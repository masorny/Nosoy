const config = require('../config/config.json')
const system = require('../config/system.json')

const timeParse = require('../modules/timeParse')

const { MessageAttachment } = require('discord.js')
const axios = require('axios')

async function template(client, message) {

    let obj = {
        color: config.embed_color,
        author: {
            name: message.author.tag + ' • Mensaje borrado',
            icon_url: message.author.avatarURL({dynamic: true, format: 'png'})
        },
        description: message.content,
        fields: [
            {
                name: 'Información',
                value: '• Autor del mensaje: **' + message.author.toString() + '** (**' + message.author.tag + '**)' +
                '\n• ID del Autor: **' + message.author.id + '**' + 
                '\n• Enviado: **' + timeParse(message.createdTimestamp) + '**' +
                '\n• En el canal: **' + message.channel.toString() + '**'
            }
        ],
        timestamp: new Date()
    }

    // If the message has attachments
    if(message.attachments.array().length > 0) {
        let channel_cache = await client.guilds.cache.get(system.cache_server.guild_id).channels.cache.get(system.cache_server.messageDelete_channel_id)
        let attachments = message.attachments.map(attachment => attachment)

        async function createAttachment(Attachments) {
            let arr = new Array()
            for(let i = 0; i < Attachments.length; i++) {
                if((/(png|jpe?g|gif|tiff|bmp|mp4|webm|mp3|flac|wav|m4a+$)/g).test(Attachments[i].name)) {
                    if(!channel_cache) return
                    await axios.get(Attachments[i].proxyURL, { responseType: 'arraybuffer' })
                        .then(res => {
                            arr.push(new MessageAttachment(res.data, Attachments[i].name))
                        })
                }
            }
            return arr
        }
        let MessageAttachments = await createAttachment(attachments)

        try {
            let msg = await channel_cache.send(message.id, { files: MessageAttachments })
            if (msg.attachments.array().length > 0) {
                obj['fields'].push({name: 'Archivos adjuntados', value: ''})
                let attachments = await getAttachment(msg)
                for (let i = 0; i < attachments.length; i++) {
                    let ext = attachments[i].name.match(/(\w+$)/g).toString().toUpperCase()
                    obj['fields'].find(field => field.name == 'Archivos adjuntados').value += `**${ext}** • [Archivo #${i + 1}](${attachments[i].url})\n`
                }
            }
        } catch(err) {
            console.log(err)
        }
    }

    return obj
}

module.exports = template


async function getAttachment(message) {
    return await message.attachments.map(attachment => attachment)
}