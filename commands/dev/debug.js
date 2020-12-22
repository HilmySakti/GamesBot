// create Collection<Game> of all the games
const options = require('./../../config/options')

module.exports = {
  name: 'debug',
  usage: 'debug <game>',
  aliases: ['db'],
  description: 'Starts a new game with no minimum player count.',
  category: 'dev',
  permissions: ['GOD'],
  dmCommand: false,
  args: true,
  run: function(msg, args) {

    // for testing only
    const selection = args.join(' ').toLowerCase()
    const game = msg.client.games.find((game, meta) => meta.id == selection || meta.name.toLowerCase() == selection)
    
    const gameOptions = args.slice(1).join(' ')

    // check if game is playing in channel
    if(msg.channel.gamePlaying) {
      msg.channel.sendMsgEmbed(`A game is already playing in this channel! End that game first by using the \`${options.prefix}end\` command.`, 'Uh oh...', 13632027)
      return
    }
    if(!game) {
      msg.channel.sendMsgEmbed(`Game not found. Make sure you typed the game ID correctly. You can see the game IDs by typing \`${options.prefix}gamelist\``, 'Error!', 13632027)
      return
    }

    msg.channel.gamePlaying = true
    
    // create new instance of game
    msg.channel.game = new (game)(msg, gameOptions)

    // configure dev options
    msg.channel.game.metadata.playerCount.min = 0
    msg.channel.game.playerCount.min = 0

    // run initialization of game
    msg.channel.game.init()
    
  }
}