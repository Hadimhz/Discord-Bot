const { Collection } = require('discord.js')
const fs = require('fs');

let commandsCol = new Collection();

let log = {}

let checkForDuplicate = (current, commands) => {
    let duplicate = commands.find(x => x.name == current.name || x.alias.includes(current.name) || current.alias.includes(x.name) || current.alias.some(y => x.alias.includes(y))) || null;

    let toReturn = {
        status: duplicate != null,
        file: (current.mainCommand != null ? current.mainCommand + "/" : "") + current.file,
        in: duplicate != null ? (duplicate.mainCommand != null ? duplicate.mainCommand + "/" : "") + duplicate.file : null,
        duplicate: []
    }

    if (duplicate != null) {
        if (current.name == duplicate.name) {
            toReturn.duplicate.push(`${current.file} shares the same name variable with ${duplicate.file}`);
        }

        if (duplicate.alias.includes(current.name)) {
            toReturn.duplicate.push(`${current.file}'s name was found is ${duplicate.file}'s aliases`);
        }

        if (current.alias.includes(duplicate.name)) {
            toReturn.duplicate.push(`${duplicate.file}'s name was found is ${current.file}'s aliases`);
        }

        for (const alias of current.alias.filter(y => duplicate.alias.includes(y))) {
            toReturn.duplicate.push(`${current.file} and ${duplicate.file} both have the same alias ("${alias}")`);
        }
    }

    return toReturn;
}


let COMMANDS_PATH = __dirname + '/../commands';

let loadCommands = () => {

    log = {
        categories: [],
        errors: [],
        stats: {
            categories: 0,
            commands: 0,
            subCommands: 0,
            errors: 0
        }
    }

    return new Promise((Resolve) => {

        // << Command Handler >>
        let categories = fs.readdirSync(COMMANDS_PATH); // Get the list of categories.

        for (const category of categories) {
            log.stats.categories++;

            let _category = { name: category, children: [] };

            let commands = fs.readdirSync(COMMANDS_PATH + '/' + category) // Get the commands from each categories

            let _command = {};

            for (const command of commands) { // Loop thru the commands.

                if ((command.startsWith('sub-') || command.startsWith('sub_')) && !command.endsWith('.js')) { // If the command has sub-commands
                    let name = command.toLowerCase().slice(4); // Get the name of the command by slicing `sub-` off.

                    let subCommands = fs.readdirSync(COMMANDS_PATH + `/${category}/${command}`).filter(x => x.endsWith('.js')); // get the list of sub-commands.

                    if (!subCommands.map(x => x.toLowerCase()).includes(`${name}.js`)) {
                        log.errors.push({
                            category,
                            command,
                            error: "Main sub-command Class not found!"
                        })

                        continue;
                    } else if (subCommands.filter(x => x.toLowerCase() == name).length > 1) {
                        log.errors.push({
                            category,
                            command,
                            error: "Found multiple of the same sub commands class!"
                        })
                        continue;
                    }

                    let mainClass = require(COMMANDS_PATH + `/${category}/${command}/${name}.js`); // Load the main class to get the command info.

                    if (mainClass.info == null) {
                        log.errors.push({
                            category,
                            command,
                            error: "Main sub-command class description missing!"
                        })
                        continue;
                    }

                    let commandData = {
                        name: mainClass.info.name,
                        category: category,
                        description: mainClass.info.description || "none",
                        usage: mainClass.info.usage || "",
                        alias: mainClass.info.aliases || [],
                        requiredPermission: mainClass.info.requiredPermission || null,
                        subCommands: null
                    };

                    for (const subCommand of subCommands.filter(x => x != name + '.js')) { // Loop thru all sub-commands except the "main class"
                        let subClass = require(COMMANDS_PATH + `/${category}/${command}/${subCommand}`); // Get the sub-command Class

                        if (subClass.info == null) subClass.info = {};

                        let subData = {
                            name: subClass.info.name || subCommand.split('.')[0].toLowerCase(),
                            description: subClass.info.description || "none",
                            usage: subClass.info.usage || "",
                            alias: subClass.info.aliases || [],
                            requiredPermission: subClass.info.requiredPermission || null,
                            mainCommand: commandData.name,
                            file: subCommand,
                            run: subClass.run,
                        }

                        if (subData.name == null || subData.run == null) { // if name or run are = to null

                            log.errors.push({
                                category,
                                command,
                                subCommand,
                                error: "Name or run() are missing!"
                            })

                            continue;
                        }

                        let dupeCheck = checkForDuplicate(subData, (commandData.subCommands || [])); // Checking for dupelicates;
                        if (dupeCheck.status == true) {
                            log.errors.push({
                                category,
                                command,
                                subCommand,
                                error: dupeCheck.duplicate
                            })
                            continue;
                        }

                        commandData.subCommands = commandData.subCommands == null ? [subData] : [...commandData.subCommands, subData]; // Push subcommand to commandData
                    }

                    if (commandData.name == null || commandData.subCommands == null) { // if name or run are = to null

                        log.errors.push({
                            category,
                            command,
                            subCommand,
                            error: "Name or subCommands are missing!"
                        })
                        continue;
                    }

                    _command = commandData;

                    commandsCol.set(commandData.name, commandData) //Store command in the collection

                } else {

                    let commandClass = require(COMMANDS_PATH + `/${category}/${command}`); // Load the main class to get the command info.

                    if (commandClass.info == null) commandClass.info = {};

                    let commandData = {
                        name: commandClass.info.name || command.split('.')[0].toLowerCase(),
                        category: category,
                        description: commandClass.info.description || "none",
                        usage: commandClass.info.usage || "",
                        alias: commandClass.info.aliases || [],
                        requiredPermission: commandClass.info.requiredPermission || null,
                        file: command,
                        run: commandClass.run,
                    };

                    if (commandData.name == null || commandData.run == null) { // if name or run are = to null

                        log.stats.errors++;
                        log.errors.push({
                            category,
                            command,
                            error: "Name or run() are missing!"
                        })
                        continue;
                    }

                    let dupeCheck = checkForDuplicate(commandData, (commandsCol.array() || [])); // Checking for dupelicates;
                    if (dupeCheck.status == true) {
                        log.errors.push({
                            category,
                            command,
                            error: dupeCheck.duplicate
                        })
                        continue;
                    }

                    _command = commandData;
                    commandsCol.set(commandData.name, commandData) //Store command in the collection
                }
                _category.children.push(_command);
            }

            log.stats.commands = log.stats.commands + _category.children.length;
            log.stats.subCommands = log.stats.subCommands + _category.children.filter(x => x.subCommands != null).reduce((a, b) => a + b.subCommands.length, 0);
            log.stats.errors = log.errors.length;

            log.categories.push(_category);
        }

        module.exports.log = log;
        Resolve({ log: log, commandsCol });
    })

}



module.exports = {
    loadCommands: loadCommands,
    log
}