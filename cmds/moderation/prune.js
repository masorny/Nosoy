module.exports = {
    name: 'prune',
    alias: [],
    description: 'Seccion de pruebas',
    ownerOnly: false,
    nsfw: false,
    botPermissions: [],
    userPermissions: ['MANAGE_MESSAGES'],
    maxArgs: -1,
    async run () {
        const { embed_color } = require('../../config/config.json')
        let obj = {
            color: embed_color,
            description: ''
        }

        let id = this.args.shift()

        if (!id) {
            obj.description = 'Especifica la ID de un mensaje'
            return await this.message.channel.send({ embed: obj })
        }

        if (!(/^\d+$/).test(id)) {
            obj.description = 'La ID contiene letras (Inválido)'
            return await this.message.channel.send({ embed: obj })
        }

        let messages = await this.message.channel.messages.fetch()

        if (!messages.has(id)) {
            obj.description = 'El mensaje no existe en mi base de datos'
            return await this.message.channel.send({ embed: obj })
        }

        await this.fetchMessages(messages, id)
            .then(async msgs => {
                await this.message.channel.bulkDelete(msgs)
                    .then(async () => {
                        let msg = await this.message.channel.send({ embed: {
                            color: embed_color,
                            description: 'Se han borrado **' + msgs.length + '** mensajes'
                        } })
                        msg.delete({ timeout: 10000 })
                    })
            })
    },
    async fetchMessages (messages, id) {
        let arr = new Array()
        let msgs = await messages.map(message => message).sort((a, b) => b.id - a.id)

        for (let i = 0; i <= msgs.map(message => message.id).indexOf(id); i++) {
            arr.push(msgs[i])
        }

        return arr
    }
}