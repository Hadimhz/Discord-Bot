const chalk = require('chalk');
const Discord = require('discord.js');
const fs = require('fs');
const config = require('./config.json');

const { loadCommands } = require('./utils/commandHandler');

let bot = new Discord.Client({
    intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_BANS",
        "GUILD_INTEGRATIONS", "GUILD_WEBHOOKS", "GUILD_INVITES",
        "GUILD_VOICE_STATES", "GUILD_PRESENCES", "GUILD_MESSAGES",
        "GUILD_MESSAGE_REACTIONS", "GUILD_MESSAGE_TYPING", "DIRECT_MESSAGES",
        "DIRECT_MESSAGE_REACTIONS", "DIRECT_MESSAGE_TYPING"],

    allowedMentions: {
        parse: ['users', 'roles', 'everyone'],
        repliedUser: true
    },
})

exports.bot = bot;
global.ROOT_PATH = __dirname;

// Event Handler
let events = fs.readdirSync(ROOT_PATH + '/events').filter(x => x.endsWith(".js"));
events.forEach(x => {
    try {
        require('./events/' + x);
    } catch (error) {
        console.log(chalk.bgRedBright("[ERROR]"), `An error occured while trying to load the ${x} event`);
    }
});

loadCommands(`${ROOT_PATH}/commands`).then(x => {
    // console.log(x);
    fs.writeFileSync(ROOT_PATH + '/../log.json', JSON.stringify(x.logs, null, 2));
    bot.commands = x.commandsCol;

    if (x.logs.stats.errors != 0)
        console.log(chalk.bgRedBright("[ERROR]"), `An error occured while loading commands, please check`, chalk.bgWhite("log.json"), `for more information.`);

    console.log(chalk.bgCyan("[CommandHandler]"), `Loaded a total of ${x.logs.stats.commands} commands in ${x.logs.stats.categories} categories.`);
})

bot.on('ready', () => {
    console.log("online");
});

bot.login(config.token);