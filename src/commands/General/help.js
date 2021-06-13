const { MessageEmbed } = require('discord.js')
const config = require(ROOT_PATH + '/config.json');

module.exports.run = (bot, message, args) => {

    let { log: parsed } = require(ROOT_PATH + '/utils/commandHandler');

    let embed = new MessageEmbed()
        .setTitle("Help!").setColor("BLUE").setDescription("Commands Help list");

    if (args[0] == null) {
        for (const category of parsed.categories.filter(x => x.name != '_ignored')) {
            embed.addField(category.name, "`" + category.children.map(x => x.name).join('`, `') + "`");
        }
    } else {

        args[0] = args[0].toLowerCase();

        let command = bot.commands.find(x => x.name == args[0] || x.alias.includes(args[0]));

        if (command == null) {

            embed.setColor("RED")
                .setDescription(`Couldn't find any command with the name or alias "${args[0]}"!\nPlease double check your spelling and try again later.`);

        } else {

            let subcommand;

            if (args[1]) {

                args[1] = args[1].toLowerCase();

                subcommand = command.subCommands != null ? command.subCommands.find(x => x.name == args[1] || x.alias.includes(args[1])) : null;

                if (command.subCommands == null) {
                    embed.setDescription(`Couldn't find any command with the name or alias "${command.name}/${args[1]}"!\nPlease double check your spelling and try again later.`)
                }
            }

            let use;
            if (args[1] != null && subcommand != null) use = subcommand;
            else use = command;

            if (subcommand != null || args[1] == null) {
                let usage = config.prefix + ((args[1] != null && subcommand != null) ? `${command.name} ` : "") + use.name + ' ' + (use.usage == null ? "" : use.usage);
                let aliases = "`" + use.alias.join('`, `') + "`"
                let subCommands = use.subCommands != null ? `\`${use.subCommands.map(x => x.name).join('`, `')}\`` : null

                let help = [
                    `**name:** ${use.name}`,
                    `**description:** ${use.description}`,
                    use.alias.length == 0 ? null : `**aliases:** ${aliases}`,
                    `**usage:** ${usage}`,
                    `**requiredPermission:** ${use.requiredPermission == null ? "none" : use.requiredPermission}`,
                    subCommands != null ? `**subcommands:** ${subCommands}` : null
                ]

                embed.addField(`${command.name}'s Help:`, help.filter(x => x != null).join('\n'))
            }
        }

    }

    message.channel.send(embed);
}


/**
 * This is completely optional...
 */

module.exports.info = {
    name: 'help',// default = file name (without the extention)
    description: "Shows you the list of commands.",// default is "None"
    requiredPermission: null,// default is null
    aliases: ['?', "h"], // default is null
    usage: '[command] [subcommand]' // default is null
}