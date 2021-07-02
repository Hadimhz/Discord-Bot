const { Collection, Permissions } = require('discord.js')
const fs = require('fs');

let log = {
    categories: [],
    errors: [],
    stats: {
        categories: 0,
        commands: 0,
        subCommands: 0,
        errors: 0
    }
}

let merge = (x, y) => {
    for (const [key, value] of Object.entries(y)) {
        x[key] = value;
    }
    return x;
}

let checkForDuplicate = (current, commands) => {
    let duplicate = commands.find(x => x.name == current.name ||
        x.alias.includes(current.name) ||
        current.alias.includes(x.name) ||
        current.alias.some(y => x.alias.includes(y))) || null;

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


let checkPermission = (permission) => {
    return Object.keys(Permissions.FLAGS).includes(permission);
}

let COMMANDS_PATH = __dirname + '/../commands';

let defaultCommands = {
    categories: [],
    errors: [],
    stats: {
        categories: 0,
        commands: 0,
        subCommands: 0,
        errors: 0
    }
}

let loadCommands = (rootPath) => {
    let toReturn = {
        commandsCol: new Collection(),
        logs: defaultCommands
    }

    return new Promise((Resolve, Reject) => {

        let load = (path, parent) => {

            let _toReturn = []

            let files = fs.readdirSync(path); // Get the list of commands.
            for (const file of files) {

                let _command = {
                    name: file.split('.')[0].toLowerCase(),
                    description: "none",
                    usage: null,
                    alias: [],
                    requiredPermission: null,
                    path: path.split('\\').pop(),
                    size: 0,
                    file: file,
                    errors: [],
                    // subCommands: null,
                    // run: null,
                };

                let stats = fs.statSync(`${path}/${file}`);

                if (stats.isDirectory()) { // If the command is a folder

                    let _files = fs.readdirSync(`${path}/${file}`);
                    let main = _files.find(x => x.toLowerCase() == file.toLowerCase() + '.js')
                    if (main) {
                        let command = require(`${path}/${file}/${main}`);
                        _command = merge(_command, command.info || {})
                    }
                    _command.subCommands = load(`${path}/${file}`, _command);
                } else {

                    _command.size = stats.size;
                    if (parent != null && (parent.file.toLowerCase() + '.js') == file.toLowerCase()) continue;
                    let command = require(`${path}/${file}`);

                    _command = merge(_command, command.info || {});
                    _command.run = command.run || ((bot, message, args) => console.log("WORKS!"));
                }

                let dupeCheck = checkForDuplicate(_command, (_toReturn || [])); // Checking for Duplicates;
                if (dupeCheck.status == true) {
                    _command.errors.push({
                        path: _command.path + '/' + _command.file,
                        error: dupeCheck.duplicate
                    })
                }

                if (_command.requiredPermission != null && checkPermission(_command.requiredPermission) == false) {
                    _command.errors.push({
                        path: _command.path + '/' + _command.file,
                        error: `"${_command.requiredPermission}" is not a valid permission. check https://discord.com/developers/docs/topics/permissions for more infromation`
                    })
                }

                if (_command.errors.length == 0) delete _command.errors;
                else {
                    toReturn.logs.errors = toReturn.logs.errors.concat(_command.errors)
                }
                _toReturn.push(_command);
            }

            _toReturn = _toReturn.filter(x => x.errors == null);
            toReturn.logs.stats.commands = toReturn.logs.stats.commands + _toReturn.length;
            toReturn.logs.stats.subCommands = toReturn.logs.stats.subCommands + _toReturn.filter(x => x.subCommands != null && x.run == null).length;
            return _toReturn;
        }


        let files = fs.readdirSync(rootPath); // Get the list of categories.

        for (const file of files) {
            toReturn.logs.categories.push({ name: file, children: load(`${rootPath}/${file}`) });
        }

        toReturn.logs.stats.errors = toReturn.logs.errors.length;
        toReturn.logs.stats.categories = files.length;
        Resolve(toReturn);
    })
}

module.exports = {
    loadCommands: loadCommands,
    log
}