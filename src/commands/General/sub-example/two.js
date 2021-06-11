
module.exports.run = (bot, message, args) => {
    message.channel.send('TWO!');
}

module.exports.info = {
    name: 'two',
    descrition: "subcommands example 2",
    requiredPermission: null,
    aliases: ['2'],
}