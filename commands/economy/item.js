const Discord = require('./../../discord_mod')
const options = require('./../../config/options')

module.exports = {
    name: 'item',
    usage: 'item <buy/info> <item id>',
    aliases: [],
    description: 'Buys or displays info for a specific item.',
    category: 'economy',
    permissions: [],
    dmCommand: true,
    args: true,
    run: async function(msg, args) {
        const collection = msg.client.database.collection('items')
        const command = args[0].toLowerCase()
        const itemID = (args.slice(1).join(' ')).toLowerCase()
        const filter = {
            $or: [{ itemID }, { friendlyName: { $regex: new RegExp( itemID, 'i') } }]
        }
        var item = await collection.find(filter).toArray()
        item = item[0]
        if(!item) {
            msg.channel.sendMsgEmbed(`Type \`${options.prefix}shop <game>\` to see available shop items. You can enter the item ID or the item name to specify an item.`, 'Item not found!', options.colors.economy)
            return
        }

        // check if user has item
        if(await msg.author.hasItem(itemID) && command == 'buy') {
            msg.channel.sendMsgEmbed(`You already own this item!`, 'Error!', options.colors.error)
            return
        }

        // display item info
        if (command == 'info' || command == 'buy') {
            var embed = new Discord.RichEmbed()
            let game = msg.client.games.findKey((game, meta) => meta.id == item.game).name
            embed.setTitle(`Info for ${item.friendlyName} - \`${item.itemID}\``)
            embed.setColor(options.colors.economy)
            embed.setDescription(`
            **Description:** ${item.description}
            **Cost:** ${item.cost}${options.creditIcon}
            **Game:** ${game}`)
            if(item.image) {
                let image = `./assets/images/${item.game}-shop/${item.image}`
                embed.attachFile({ attachment: image, name: item.image})
                embed.setImage(`attachment://${item.image}`)
            }
            if(command != 'buy') {
                embed.setFooter(`To buy this item, type ${options.prefix}item buy ${item.itemID}`)
            }
            await msg.channel.send(embed)
        } else {
            msg.channel.sendMsgEmbed(`Type \`${options.prefix}help item\` to see how to use this command.`, 'Command not recognized!', options.colors.error)
            return
        }
        
        // await purchase
        if(command == 'buy') {
            // check if user has enough currency
            var balance = -1
            await msg.author.fetchDBInfo().then(info => {
                balance = info.balance
            })

            if(balance < item.cost) {
                msg.channel.sendMsgEmbed(`You can't afford this item! You currently have ${balance}${options.creditIcon}.`, 'Unable to purchase.', options.colors.error)
                return
            }

            await msg.channel.sendMsgEmbed(`You currently have ${balance}${options.creditIcon}\n\nType \`${options.prefix}confirm\` or \`${options.prefix}cancel\``, `Are you sure you want to buy **${item.friendlyName}** for ${item.cost}${options.creditIcon}?`, options.colors.economy)
            
            // create confirm collector
            const filter = m => m.author.id == msg.author.id && (m.content.startsWith(`${options.prefix}confirm`) || m.content.startsWith(`${options.prefix}cancel`))
            msg.channel.awaitMessages(filter, {max: 1, time: 60000}).then(async collected => {
                if(collected.size == 0) {
                    msg.channel.sendMsgEmbed(`To buy this item, please use the command \`${options.prefix}item buy ${item.itemID}\` again.`, 'Time ran out!', options.colors.error)
                    return
                }
                const m = collected.first()
                if(m.content.startsWith(`${options.prefix}confirm`)) {
                    // check if user has enough currency
                    var balance = -1
                    await msg.author.fetchDBInfo().then(info => {
                        balance = info.balance
                    })
                    await msg.client.database.collection('users').findOneAndUpdate(
                        { userID: msg.author.id },
                        { 
                            $push: { unlockedItems: item.itemID },
                            $inc: { balance: -item.cost }
                        },
                        { returnOriginal: false }
                    ).then(result => {
                        msg.channel.sendMsgEmbed(`Item successfully purchased. You now have ${result.value.balance}${options.creditIcon}`, options.colors.economy)
                        msg.client.logger.log('Item Purchased', {
                            itemID: item.itemID,
                            item: item.friendlyName,
                            cost: item.cost,
                            remainingBalance: result.value.balance
                        })
                    }).catch()
                } else if(m.content.startsWith(`${options.prefix}cancel`)) {
                    msg.channel.sendMsgEmbed('Item purchase cancelled.', undefined, options.colors.economy)
                }
            }).catch(console.error)
        }
    }
  }