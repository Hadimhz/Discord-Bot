
module.exports.run = (bot, message, args) => {
    message.channel.send('ONE!');
}

module.exports.info = {
    name: 'one',
    descrition: "subcommands example 1",
    requiredPermission: null,
    aliases: ['1'],
}