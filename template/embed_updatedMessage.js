const config = require('../config/config.json')
const system = require('../config/system.json')

const timeParse = require('../modules/timeParse')

const { MessageAttachment } = require('discord.js')
const axios = require('axios')
const fetchAll = require('discord-fetch-all')

async function template(client, oldMessage, newMessage) {
    let obj = {
        color: config.embed_color,
        description: `[**Ir al mensaje**](https://discord.com/channels/${oldMessage.guild.id}/${oldMessage.channel.id}/${oldMessage.id})`,
        author: {
            name: oldMessage.author.tag + ' • Mensaje editado',
            icon_url: oldMessage.author.avatarURL({dynamic: true, format: 'png'}),
        },
        fields: [
            {
                name: 'Contenido original',
                value: getMessage(oldMessage)
            },
            {
                name: 'Contenido actual',
                value: getMessage(newMessage)
            },
            {
                name: 'Información',
                value: '• Autor del mensaje: **' + oldMessage.author.toString() + '** (**' + oldMessage.author.tag + '**)' +
                '\n• ID del Autor: **' + oldMessage.author.id + '**' + 
                '\n• Enviado: **' + timeParse(oldMessage.createdTimestamp) + '**' +
                '\n• En el canal: **' + oldMessage.channel.toString() + '**'
            }
        ],
        timestamp: new Date()
    }

    if(oldMessage.attachments.array().length > 0) {
        let channel_cache = await client.guilds.cache.get(system.cache_server.guild_id).channels.cache.get(system.cache_server.messageUpdate_channel_id)
        let attachments = oldMessage.attachments.map(attachment => attachment)
        async function createAttachment(Attachments) {
            let arr = new Array()
            for(let i = 0; i < Attachments.length; i++) {
                if(!channel_cache) return
                await axios.get(Attachments[i].proxyURL, { responseType: 'arraybuffer' })
                    .then(res => {
                        arr.push(new MessageAttachment(res.data, Attachments[i].name))
                    })
            }
            return arr
        }
        let MessageAttachments = await createAttachment(attachments)

        try {
            await channel_cache.send(oldMessage.id, { files: MessageAttachments })
        } catch(err) {
            console.log(err)
        }
    }

    if(oldMessage.attachments.array().length > 0) {
        obj['fields'].push({name: 'Archivos', value: ''})
        let attachments = await fetchAttachment(oldMessage, client)
        for (let i = 0; i < attachments.length; i++) {
            let ext = attachments[i].name.match(/(\w+$)/g).toString().toUpperCase()
            obj['fields'].find(field => field.name == 'Archivos').value += `**${ext}** • [Archivo #${i + 1}](${attachments[i].url})\n`
        }
    }

    return obj
}

module.exports = template


async function fetchAttachment(message, client) {
    let msgs = await fetchAll.messages(client.channels.cache.get(system.cache_server.messageUpdate_channel_id), { botOnly: true })
    let msg = msgs.filter(msg => msg.content == message.id)
    return msg[0].attachments.map(attachment => attachment)
}

function getMessage(message) {
    if(!message.content) return '``[No posee contenido]``'
    return (message.content.length > 1000 ? (message.content.slice(0, 999) + '**...**') : message.content)
}