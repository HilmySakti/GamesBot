const options = require('./../../config/options')

module.exports = {
  name: 'draw',
  usage: 'draw',
  aliases: [],
  description: 'Lets you send a drawing in chat!',
  category: 'fun',
  permissions: [],
  dmCommand: false,
  args: false,
  run: function (msg, args) {
    // Check permissions
    /*if(!msg.channel.permissionsFor(msg.member).has('ATTACH_FILES')) {
      msg.channel.sendMsgEmbed(`You are missing the "Attach Files" permission. Try using this command in a channel that allows images.`, 'You could not use this command.', options.colors.error)
      return
    }*/
    msg.client.webUIClient.createWebUI(msg.member, data => msg.channel.send({
      embed: {
        color: 5301186,
        author: {
          name: `${msg.author.tag}'s drawing`,
          icon_url: msg.author.avatarURL
        },
        image: {
          url: 'attachment://file.png'
        }
      },
      files: [{
        name: 'file.png',
        attachment: Buffer.from(data, 'base64')
      }]
    }), {
      type: 'drawing',
      duration: 1800
    }).then(url => {
      msg.author.createDM()
      .then(channel => {
        channel.send({
          embed: {
            description: `[**Click here** for your drawing page](${url}), ${msg.author}! It will be sent in ${msg.channel}.`,
            color: 5301186
          }
        }).then(m => {
          msg.channel.sendMsgEmbed(`${msg.author}, [click here to go to your DMs directly.](${m.url}) Your drawing link is in your DMs!`)
        }).catch(err =>
          msg.channel.send({
            embed: {
              title: 'There was an error sending you a DM!',
              description: `Make sure you have DMs from server members enabled in your Privacy settings.`,
              color: options.colors.error
            }
        }))
      })
    }).catch(err => {
      msg.channel.send({
        embed: {
          title: 'Error!',
          description: `There was an error loading the drawing page.`,
          color: 5301186
        }
      })
      console.error(err)
    })
  }
}