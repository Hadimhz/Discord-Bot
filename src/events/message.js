const chalk = require('chalk');
let { bot } = require('../index');
const config = require(ROOT_PATH + '/config.json');

bot.on('message', async (message) => {
    if (message.channel.type == 'dm' || message.author.bot == true || message.guild.id != config.guild || !message.content.startsWith(config.prefix)) return;

    let args = message.content.trim().slice(config.prefix.length).split(/ +/);
    let command = args.shift().toLowerCase();

    let cmd = bot.commands.find(x => x.name == command || x.alias.includes(command));
    if (cmd != null) {

        if (cmd.requiredPermission != null && !message.member.permissions.has(cmd.requiredPermission)) { // Permission check
            message.channel.send(config.missing_permission.replace("{PERMISSION}", cmd.requiredPermission)); // Missing permission message
            return;
        }

        if (cmd.subCommands != null) {
            if (args[0] != null) {
                let subCommand = args.shift().toLowerCase();
                let subcmd = cmd.subCommands.find(x => x.name == subCommand || x.alias.includes(subCommand));

                if (subcmd != null) {

                    if (subcmd.requiredPermission != null && !message.member.permissions.has(subcmd.requiredPermission)) { // Permission check
                        message.channel.send(config.missing_permission.replace("{PERMISSION}", subcmd.requiredPermission)); // Missing permission message
                        return;
                    }

                    try {
                        subcmd.run(bot, message, args);
                    } catch (error) {
                        console.log(chalk.bgRedBright("[ERROR]"), `An error occured while trying to execute the ${cmd.name}/${subcmd.name} command!`);
                        console.log(error);
                    }
                } else {
                    // If you want to return anything.
                }
            }
        } else {
            try {
                cmd.run(bot, message, args);
            } catch (error) {
                console.log(chalk.bgRedBright("[ERROR]"), `An error occured while trying to execute the ${cmd.name} command!`);
                console.log(error);
            }
        }
    }
});