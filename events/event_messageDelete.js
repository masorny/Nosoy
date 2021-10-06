const template = require('../template/embed_deletedMessage')

module.exports = {
    name: 'messageDelete',
    execute (message) {
        const config = require('../config/config.json')
        const system = require('../config/system.json')
        const client = this
        
        // Ignore partial messages
        if(message.partial) return
        if(system.log_deleted_messages == true) {
            if(message.guild.id != system.guild_id || message.author.bot != false) return
    
            // Code here
            // Logger, send to channel
            let channels = function(channels) {
                let arr = new Array()
                channels.forEach(channel => {
                    arr.push(client.channels.cache.get(channel))
                })
                
                return arr
            }
            channels(config.log_channels_id).forEach(async channel => {
    
                // Si no existe ese canal, no hacer nada
                if(!channel) return
    
                // Condicional para el canal log de team-de-bienvenida
                if(channel.id == '807748221899505694' && message.channel.id != '804502142097948722') return
    
                // Llamar funcion para generar embed
                let obj = await template(this, message)
                obj.footer = {
                    text: 'Logger 1.1.0'
                }
    
                // Enviar a los canales seleccionados para el log
                await channel.send({ embed: obj })
            })
        }
    }
}