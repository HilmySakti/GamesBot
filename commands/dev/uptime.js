module.exports = {
    name: 'uptime',
    usage: 'uptime',
    aliases: [],
    description: 'Displays how long the bot has been running',
    category: 'dev',
    permissions: ['GOD'],
    dmCommand: true,
    args: false,
    run: function(msg, args) {
        let s = (Date.now() - msg.client.readyAt.valueOf())
        var ms = s % 1000;
        s = (s - ms) / 1000;
        var secs = s % 60;
        s = (s - secs) / 60;
        var mins = s % 60;
        var hrs = (s - mins) / 60;
        msg.channel.sendMsgEmbed(`Gamebot has been running for ${hrs} hours, ${mins} minutes, ${secs}.${ms} seconds`)
    }
  }
