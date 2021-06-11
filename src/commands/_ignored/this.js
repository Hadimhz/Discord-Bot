module.exports.run = (bot, message, args) => {

    message.channel.send('this command is not visible on the help list');

}


module.exports.info = {
    name: 'this',
    descrition: "",
    requiredPermission: null,
    aliases: [],
    usage: ''
}