const Discord = require('discord.js')
const { readdirSync } = require('fs')

function load (client, obj) {
    if (!obj.dir) throw new Error('No se ha especificado un directorio de eventos')
    const files = readdirSync(obj.dir)
    files.forEach(file => {
        const event = require('.' + obj.dir + file)
        client.addListener(event.name, event.execute)
        console.log('[EVENT HANDLER] Se ha cargado el evento ' + event.name)
    })
}

module.exports = {
    load
}