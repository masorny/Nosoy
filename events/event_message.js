require('dotenv').config()
const {
    OWNER:owner
} = process.env, config = require('../config/config.json')

const commands = require('../modules/Commands')

module.exports = {
    name: 'message',
    execute (message) {
        if (!message.content.toLowerCase().startsWith(config.prefix)) return
        const args = generateArgs(message), command = args.shift().toLowerCase(); if (!command) return
        let fetchCommand = commands.fetchCommand(command); if (!fetchCommand) return
        try {
            fetchCommand.client = this
            fetchCommand.message = message
            fetchCommand.args = args
            fetchCommand.config = config
            fetchCommand.userCanExecuteCMD = commands.checkPermissions({
                msg_user: message.author,
                msg_permissions: message.member.permissions, 
                cmd_permissions: fetchCommand.userPermissions, 
                cmd_ownerOnly: fetchCommand.ownerOnly
            })
            fetchCommand.commands = commands.getCommands(this, './cmds/')
            fetchCommand.userCanExecuteCMD == true ? fetchCommand.run() : message.channel.send({ embed: { color: config.embed_color, author: { name: '❌ Error' }, description: 'No tienes permiso para ejecutar este comando' }})
        } catch (err) {
            console.log(err)
        }
    }
}

function generateArgs (message) {
    return message.content.slice(config.prefix.length).trim().split(/ +/g)
}