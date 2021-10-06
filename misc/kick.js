const Commando = require('discord.js-commando')

class KickCommand extends Commando.Command {
    constructor (client) {
        super(client, {
            name: 'kick',
            group: 'moderation',
            memberName: 'kick',
            description: 'Kickea a uno o mas usuarios de un servidor',
            clientPermissions: ['KICK_MEMBERS'],
            userPermissions: ['KICK_MEMBERS'],
            argsType: 'multiple',
        })
    }

    async run (message, args) {
        const { embed_color } = require('../config/config.json')
        let obj = {
            author: {
                name: 'Error'
            },
            color: embed_color,
            description: ''
        }

        let fetch = this.getUsers(message, args)

        console.log(fetch)

        if (fetch == 'No Args') {
            obj.description = 'Ingresa una o mas IDs para poder ejecutar el comando'
            return await message.embed(obj)
        }

        if (fetch.members.length < 1 && fetch.invalid_users_count > 0) {
            obj.description = 'Se ' + ( fetch.invalid_users_count > 1 ? 'han' : 'ha' ) + ' ' + 'introducido ' + (fetch.invalid_users_count > 1 ? 'varias' : 'una') + ' ' + (fetch.invalid_users_count > 1 ? 'IDs' : 'ID') + ' ' + (fetch.invalid_users_count > 1 ? 'inválidas' : 'inválida')
            return await message.embed(obj)
        }

        if (fetch.members.length < 1 && fetch.unkickable_users_count > 0) {
            obj.description = 'Se han introducido IDs de usuarios que no pueden ser kickeados'
            return await message.embed(obj)
        }

        obj.author.name = 'Aviso de confirmación'
        obj.description = 'Estás a punto de kickear.\nPara confirmar que lo harás realmente, presiona ✅\nEn caso de que no quieras confirmar, presiona ❌\n'
        obj.description += fetch.invalid_users_count > 0 ? '\n⚠️ **AVISO**:' + (fetch.invalid_users_count == 1 ? ' Se introdujo una ID que resultó ser inválida.' : ' Se introdujeron varias IDs que resultaron ser inválidas.') + ' Así que solamente se kickearan a los que aparecen en la lista.' : ''
        obj.description += '```' + fetch.members.map(member => `[${member.user.id}] => ${member.user.tag}`).join('\n') + '```'

        let msg = await message.embed(obj)

        await Promise.all([
            msg.react('✅'),
            msg.react('❌')
        ])

        const filter = (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id
        const collector = msg.awaitReactions(filter, { max: 1, time: 20000, errors: ['time'] })
        collector.then(async collected => {
            switch (collected.first().emoji.name) {
                case '✅':
                    this.kickMembers(fetch.members)
                        .then(async () => {
                            msg.delete()
                            await message.embed({
                                color: embed_color,
                                author: {
                                    name: 'Operacion exitosa'
                                },
                                description: 'Se ' + (fetch.members.length > 1 ? 'han' : 'ha') + ' kickeado a **' + fetch.members.map(member => member.user.tag) + '** del servidor.'
                            })
                        })
                break
                case '❌':
                    msg.delete()
                    await message.embed({
                        color: embed_color,
                        author: {
                            name: 'Operacion Cancelada'
                        },
                        description: 'El mensaje de confirmación ha sido cancelado'
                    })
                break
            }
        })
        .catch(async data => {
            msg.delete()
            await message.embed({
                color: embed_color,
                author: {
                    name: 'Error'
                },
                description: 'Tiempo de espera agotado'
            })
        })
    }

    getUsers (message, args) {
        let tmp_1 = new Array()

        if (args.length < 1) return 'No Args'

        for (const id of args) {
            tmp_1.push(id)
        }

        tmp_1.filter((id, index, array) => array.indexOf(id) === index)

        for (let i = 0; i < tmp_1.length; i++) {
            tmp_1[i] = message.guild.members.cache.get(tmp_1[i])
        }

        let tmp_2 = new Array()
        let und_arr = new Array()

        tmp_1.forEach(obj => {
            if (typeof obj != 'undefined') {
                tmp_2.push(obj)
            } else {
                und_arr.push(obj)
            }
        })

        let tmp_3 = new Array()
        let unkickable_users = new Array()

        tmp_2.forEach(obj => {
            if (obj.kickable == true) {
                tmp_3.push(obj)
            } else {
                unkickable_users.push(obj)
            }
        })

        return {
            members: tmp_3,
            invalid_users_count: und_arr.length,
            unkickable_users_count: unkickable_users.length
        }
    }

    async kickMembers (members) {
        members.forEach(async member => {
            await member.kick()
        })

        return
    }
}

module.exports = KickCommand