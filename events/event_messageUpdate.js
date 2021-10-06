const template = require('../template/embed_updatedMessage')

module.exports = {
    name: 'messageUpdate',
    async execute (oldMessage, newMessage) {
        const client = this
        const config = require('../config/config.json')
        const system = require('../config/system.json')
        
        // Get full content of partial message
        if(oldMessage.partial && newMessage.partial) {
            oldMessage = await oldMessage.fetch()
            newMessage = await newMessage.fetch()
        }
    
        if(system.log_deleted_messages == true) {
            if(oldMessage.guild.id != system.guild_id || oldMessage.author.bot != false) return
            if(oldMessage.content == newMessage.content) return
    
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
                if(channel.id == '807748221899505694' && oldMessage.channel.id != '804502142097948722') return
    
                // Llamar funcion para generar embed
                let obj = await template(client, oldMessage, newMessage)
                obj.footer = {
                    text: 'Logger 1.1.0'
                }
    
                // Enviar a los canales seleccionados para el log
                await channel.send({ embed: obj })
            })
        }
    }
}