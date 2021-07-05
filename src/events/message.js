const chalk = require('chalk');
const { MessageEmbed } = require('discord.js');
let { bot } = require('../index');
const config = require(ROOT_PATH + '/config.json');

bot.on('message', async (message) => {
    if (message.channel.type == 'dm' || message.author.bot == true || message.guild.id != config.guild || !message.content.startsWith(config.prefix)) return;

    let args = message.content.trim().slice(config.prefix.length).split(/ +/);


    let findCommand = (list, commandsList) => {
        let cmd;
        while (list.length > 0 && (cmd != null || args.length == list.length)) {
            let command = list.shift().toLowerCase();
            let temp;

            if (cmd != null && cmd.subCommands != null) temp = cmd.subCommands.find(x => x.name == command || x.aliases.includes(command));
            else temp = commandsList.find(x => x.name == command || x.aliases.includes(command));

            if (temp != null && temp.requiredPermission != null && !message.memberp.permissions.has(temp.requiredPermission)) { // Permission check
                message.channel.send({ content: config.missing_permission.replace("{PERMISSION}", temp.requiredPermission) }); // Missing permission message
                return;
            }

            if (temp != null) cmd = temp;
            if (temp == null || list.length == 0) return cmd;
        }
    }

    let cmd = findCommand([...args], bot.commands);

    if (cmd != null) {
        let commandTree = args.slice(0, cmd.depth)
        args = args.slice(cmd.depth);

        if (cmd.subCommands == null) {
            try {
                cmd.run(bot, message, args);
            } catch (error) {
                console.log(chalk.bgRedBright("[ERROR]"), `An error occured while trying to execute the ${cmd.name} command!`);
                console.log(error);
            }
        } else {

            message.channel.send({
                embed: new MessageEmbed()
                    .setColor("BLUE").setTitle(commandTree.join(" ") + "'s subcommands")
                    .setDescription(cmd.subCommands.map(x => `**${x.name}** - \`${x.description}\`\n*usage:* \`${x.usage}\``).join('\n\n'))
            })
            // TODO Do subcommands list 

        }

    }
});