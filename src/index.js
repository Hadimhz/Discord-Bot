const chalk = require('chalk');
const Discord = require('discord.js');
const fs = require('fs');
const config = require('./config.json');

const { loadCommands } = require('./utils/commandHandler');
let bot = new Discord.Client();

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

loadCommands().then(x => {
    fs.writeFileSync(ROOT_PATH + '/../log.json', JSON.stringify(x.log, null, 2));
    bot.commands = x.commandsCol;
    if (x.log.stats.errors != 0)
        console.log(chalk.bgRedBright("[ERROR]"), `An error occured while loading commands, please check`, chalk.bgWhite("log.json"), `for more information.`);

    console.log(chalk.bgCyan("[CommandHandler]"), `Loaded a total of ${x.log.stats.commands} commands in ${x.log.stats.categories} categories.`);
}).catch(x => { console.error(x);; process.exit() });

bot.on('ready', () => {

    console.log("online");

});

bot.login(config.token);
