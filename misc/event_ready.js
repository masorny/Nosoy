const system = require('../config/system.json')

function ready(client) {
    console.log('Bot iniciado como ' + client.user.tag)
    let miembros = client.guilds.cache.get(system.guild_id).members.cache.filter(member => member.user.bot != true).array().length
    client.user.setActivity(miembros + ' miembros!', { type: 'WATCHING' })
}

module.exports = ready