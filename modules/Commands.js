require('dotenv').config()
const {
    OWNER:owner
} = process.env

const { readdirSync, lstatSync } = require('fs')
const Discord = require('discord.js')

let commands_cache = new Discord.Collection()

function start (client, path) {
    let get = getCommands(client, path)
    //console.log(`[COMMAND HANDLER] Se ha obtenido el comando "${command.name}"`)
    loadCommands(get)
}

function getCommands (client, path) {
    if (!path) throw new Error('No se ha especificado el directorio de comandos')
    const commands = new Discord.Collection()
    const array_dir_files = new Array()
    const directories = readdirSync(path)
    for (const dir of directories.map(dir => path + dir + '/')) {
        let booleanIsDirectory = lstatSync(dir).isDirectory()
        let booleanIsFile = lstatSync(dir).isFile()
        if (booleanIsDirectory && !booleanIsFile) {
            array_dir_files.push(readdirSync(dir).filter(file => file.endsWith('.js')).map(file => dir + file))
        } else throw new Error('En la carpeta de comandos deben ir primero las categorias (carpetas)')
    }
    for (const dir_files of array_dir_files.filter(array => array.length > 0)) {
        dir_files.forEach(dir_file => {
            const command = require('.' + dir_file)
            // If properties exists
            if (!command.name) throw new Error('El comando no tiene un nombre definido')
            if (!command.alias) throw new Error('El comando ' + command.name + ' no tiene la propiedad "alias"')
            if (!command.description) throw new Error('El comando ' + command.name + ' no tiene una description definida')
            if (!command.ownerOnly && typeof command.ownerOnly === undefined) throw new Error('El comando ' + command.name + ' no tiene la propiedad "ownerOnly" definida')
            if (!command.botPermissions) throw new Error('No se ha definido la propiedad "botPermissions" en el comando '  + command.name)
            if (typeof command.nsfw === undefined) throw new Error('No se ha definido la propiedad "nsfw" en el comando '  + command.name)
            if (!command.userPermissions) throw new Error('No se ha definido la propiedad "userPermissions" en el comando '  + command.name)
            if (!command.maxArgs) throw new Error('No se ha definido la propiedad "maxArgs" en el comando '  + command.name)
            if (!command.run) throw new Error('El comando ' + command.name + ' debe llevar una funcion "run" como propiedad')
            // Typeof section
            if (typeof command.name !== 'string') throw new Error('La propiedad "name" del comando ' + command.name + ' debe ser un string')
            if (Array.isArray(command.alias) != true) throw new Error('La propiedad "alias" del comando ' + command.name + ' debe ser un array')
            if (typeof command.description !== 'string') throw new Error('La propiedad "description" del comando ' + command.name + ' debe ser un string')
            if (typeof command.ownerOnly !== 'boolean') throw new Error('La propiedad "ownerOnly" del comando ' + command.name + ' debe ser un booleano')
            if (typeof command.nsfw !== 'boolean') throw new Error('La propiedad "nsfw" del comando ' + command.name + ' debe ser un booleano')
            if (Array.isArray(command.botPermissions) != true) throw new Error('La propiedad "botPermissions" del comando ' + command.name + ' debe ser un array')
            if (Array.isArray(command.userPermissions) != true) throw new Error('La propiedad "userPermissions" del comando ' + command.name + ' debe ser un array')
            if (typeof command.maxArgs !== 'number') throw new Error('La propiedad "maxArgs" del comando ' + command.name + ' debe ser un numero entero')
            if (typeof command.run !== 'function' || command.run.constructor.name !== 'AsyncFunction') throw new Error('La propiedad "run" del comando ' + command.name + ' debe ser una funcion asincrona')

            commands.set(command.name, command)
        })
    }

    return commands
}

function loadCommands (array_commands) {
    commands_cache = array_commands
    console.log('Se han cargado los comandos al bot')
}

function fetchCommand (search) {
    let fetch = commands_cache.find(command => (command.name == search || command.alias.includes(search)))
    if (!fetch) return false

    return fetch
}

function checkPermissions (obj) {
    if (obj.msg_permissions.has(obj.cmd_permissions) && obj.cmd_ownerOnly == false) return true
    else if (obj.cmd_ownerOnly == true && obj.msg_user.id == owner) return true
    return false
}

module.exports = {
    start,
    getCommands,
    loadCommands,
    fetchCommand,
    checkPermissions
}