
module.exports.run = (bot, message, args) => {
    message.channel.send({ content: 'ONE!' });
}

/**
 * This is completely optional...
 */

module.exports.info = {
    name: 'one', // default = file name (without the extention)
    description: "subcommands example 1", // default is "None"
    requiredPermission: "ADMINISTRATOR", // default is null
    aliases: ['1'], // default is null
    usage: "[number]" // default is null
}