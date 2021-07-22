const { MessageEmbed } = require("discord.js");

module.exports.run = (bot, message, args) => {
    const embed = new MessageEmbed()
    .setTitle('Example')
    message.channel.send({content: 'This is a Example', embeds: [embed]});
}

/**
 * This is completely optional...
 */

module.exports.info = {
    name: 'three', // default = file name (without the extention)
    description: "subcommands example 3", // default is "None"
    requiredPermission: "ADMINISTRATOR", // default is null
    aliases: ['3'], // default is null
    usage: "" // default is null
}