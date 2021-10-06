const config = require('../config/config.json')
const system = require('../config/system.json')

const timeParse = require('../modules/timeParse')

const { MessageAttachment } = require('discord.js')
const axios = require('axios')
const fetchAll = require('discord-fetch-all')

async function template(client, messages) {

    let obj = {
        color: config.embed_color,
        author: {
            name: 'Conjunto de mensajes borrados',
        },
        fields: [
            {
                name: 'Información',
                value: '• Cantidad de mensajes recopilados: **' + messages.array().length + '**' +
                '\n• Ejecutado por: **' + messages.first().author.toString() + '** (**' + messages.first().author.tag + '**)' +
                '\n• En el canal: **' + messages.first().channel.toString() + '**'
            }
        ],
        timestamp: new Date()
    }


    // Build text
    async function buildTxt(msgs) {
        let buffer = 'Los mensajes están ordenados de forma descendiente\r\n'
        buffer += '(Es decir, de recientes hasta antiguos)\r\n'
        buffer += '=============================================\r\n'
        buffer += 'Cantidad de mensajes: ' + msgs.length + '\r\n'
        buffer += 'Nombre del canal: ' + msgs[0].channel.name + '\r\n'
        buffer += 'ID del canal: ' + msgs[0].channel.id + '\r\n'
        buffer += 'Usuarios involucrados: '
        let users = new Array()
        for (let i = 0; i < msgs.length; i++) {
            users.push(msgs[i].author.tag + ' (' + msgs[i].author.id + ')')
        }
        buffer += users.filter((user, index, array) => array.indexOf(user) === index).join(', ')
        buffer += '\r\n=============================================\r\n'

        for (let msg of msgs) {
            buffer += '[' + timeParse(msg.createdTimestamp) + '] de ' + msg.author.tag + ':\r\n >> Contenido: ' + (msg.content.length < 1 ? 'Sin contenido' : msg.content) + '\r\n'
            // If the message has attachments
            if(msg.attachments.array().length > 0) {
                let attachments = await getAttachment(msg, client)
                if(attachments.length > 0) {
                    buffer += ' >> Archivos (' + attachments.length + '): ' + attachments + '\n'
                }
            }
        }

        return buffer
    }

    obj.files = [new MessageAttachment(Buffer.from(await buildTxt(messages.map(msg => msg)), 'utf-8'), (messages.first().channel.name.length < 1 ? '[canal_sin_nombre]' : '[' + messages.first().channel.name + ']') + '-conjunto_de_mensajes.txt')]

    return obj
}

module.exports = template

async function getAttachment(message, client) {
    let channel_cache = await client.guilds.cache.get(system.cache_server.guild_id).channels.cache.get(system.cache_server.messageBulkDelete_channel_id)
    let attachments = message.attachments.map(attachment => attachment)
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
        let msg = await channel_cache.send(message.id, { files: MessageAttachments })
        return msg.attachments.map(attachment => attachment.url)
    } catch(err) {
        console.log(err)
    }
}

// async function fetchAttachment(message, client) {
//     let msgs = await fetchAll.messages(client.channels.cache.get(system.cache_server.messageBulkDelete_channel_id), { botOnly: true })
//     let msg = msgs.filter(msg => msg.content == message.id)
//     return msg[0].attachments.map(attachment => attachment)
// }
