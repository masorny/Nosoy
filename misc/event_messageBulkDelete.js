const template = require('../template/embed_deletedBulkMessage')

module.exports = {
    name: 'messageDeleteBulk',
    execute (messages) {
        const config = require('../config/config.json')
        const system = require('../config/system.json')

        const client = this
        
        //if(message.partials == true) return
    
        if(system.log_deleted_messages == true) {
            if(messages.map(msg => msg).filter(message => message.guild.id == system.guild_id).length < 1 || messages.map(msg => msg).filter(message => message.author.bot == false).length < 1) return
    
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
                if(channel.id == 'UR_CHANNEL_ID_HERE' && messages.first().channel.id != 'UR_CHANNEL_ID_HERE') return
    
                // Llamar funcion para generar embed
                let obj = await template(this, messages)
                obj.footer = {
                    text: 'Logger 1.1.0'
                }
    
                // Enviar a los canales seleccionados para el log
                await channel.send({ embed: obj })
            })
        }
    }
}