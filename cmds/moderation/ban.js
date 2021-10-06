const { User } = require('discord.js')

const config = require('../../config/system.json')

module.exports = {
    name: 'ban',
    alias: [],
    description: 'Seccion de pruebas',
    ownerOnly: false,
    nsfw: false,
    botPermissions: [],
    userPermissions: ['BAN_MEMBERS'],
    maxArgs: 15,
    async run () {
        const { embed_color } = require('../../config/config.json')
        let obj = {
            author: {
                name: '❌ Error'
            },
            color: embed_color,
            description: ''
        }
    
        let fetch = await this.getUsers(this.message, this.args)
        console.log(fetch)
    
        // Errors section
            if (fetch == 'No Args') {
                obj.description = 'Ingresa una o mas IDs para poder ejecutar el comando'
                return await this.message.channel.send({ embed: obj })
            }
    
            if (fetch.members.length < 1 && fetch.invalid_users_count > 0) {
                obj.description = (fetch.invalid_users_count > 1 ? 'Se han introducido' : 'Se introdujo') + ' ' + (fetch.invalid_users_count > 1 ? 'varias IDs inválidas' : 'una ID inválida')
                return await this.message.channel.send({ embed: obj })
            }
    
            if (fetch.members.length < 1 && fetch.already_banned_users > 0) {
                obj.description = (fetch.already_banned_users > 1 ? 'Los usuarios especificados' : 'El usuario especificado') + ' ya ' + (fetch.already_banned_users > 1 ? 'han' : 'ha') + ' sido ' + (fetch.already_banned_users > 1 ? 'baneados' : 'baneado')
                return await this.message.channel.send({ embed: obj })
            }
    
            if (fetch.members.length < 1 && fetch.unbannable_users > 0) {
                obj.description = 'No será posible banear ' + (fetch.unbannable_users > 1 ? 'a los usuarios especificados' : 'al usuario especificado')
                return await this.message.channel.send({ embed: obj })
            }
    
        // Confirm embed message
        this.buildDescription(obj, fetch)
        let msg = await this.message.channel.send({ embed: obj })
    
        await Promise.all([
            msg.react('✅'),
            msg.react('❌')
        ])
    
        // Setting timeout and time_left
        const timeout = 20000 // Milliseconds
        const timeout_left = new Date().getTime() + timeout
    
        // Render first timeout left on embed
        obj.description += '\n Tiempo restante: **' + (timeout / 1000) + '** segundos restantes'
        await msg.edit({ embed: obj })
        
        // Render time on embed
        const interval = setInterval(() => {
            const timeout_date = new Date().getTime()
            this.buildDescription(obj, fetch)
            obj.description += '\n Tiempo restante: **' + (Math.floor((timeout_left - timeout_date) / 1000)) + '** ' + ((Math.floor((timeout_left - timeout_date) / 1000)) > 1 ? 'segundos restantes' : 'segundo restante')
            msg.edit({ embed: obj })
        }, 2000)
    
        const filter = (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === this.message.author.id
        const collector = msg.awaitReactions(filter, { max: 1, time: timeout, errors: ['time'] })
        collector.then(async collected => {
            clearInterval(interval)
    
            switch (collected.first().emoji.name) {
                case '✅':
                    this.BanMembers(fetch.members)
                        .then(async () => {
                            msg.delete()
                            await this.message.channel.send({ embed: {
                                color: embed_color,
                                author: {
                                    name: '☑️ Operacion exitosa'
                                },
                                description: 'Se ' + (fetch.members.length > 1 ? 'han' : 'ha') + ' baneado ' + (fetch.members.length > 1 ? 'a los siguientes usuarios' : 'al siguiente usuario') + ':\n```' +
                                fetch.members.map(user => user.tag).join('\n') + '```'
                            }})
                        })
                break
                case '❌':
                    msg.delete()
                    obj.author.name = 'ℹ️ Operación Cancelada'
                    obj.description = 'El mensaje de confirmación ha sido cancelado'
                    await this.message.channel.send({ embed: obj })
                break
            }
        })
        .catch(async data => {
            clearInterval(interval)
    
            msg.delete()
    
            obj.author.name = 'ℹ️ Operación Cancelada'
            obj.description = 'Tiempo de espera agotado'
            await this.message.channel.send({ embed: obj })
        })
    },
    async getUsers (message, args) {
        let tmp_1 = new Array()
    
        if (args.length < 1) return 'No Args'
    
        for (const id of args) {
            tmp_1.push(id)
        }
    
        // Remove same values
        tmp_1 = tmp_1.filter((id, index, array) => array.indexOf(id) === index)
    
        // Fetch users by id in guild or client
        for (let i = 0; i < tmp_1.length; i++) {
            let member = this.fetchGuildUser(tmp_1[i])
            tmp_1[i] = !member ? await this.fetchUser(tmp_1[i]) : member.user
        }
    
        const obj = await this.filterUsers(tmp_1)
    
        return obj
    },
    async BanMembers (members) {
        members.forEach(async member => {
            await this.client.guilds.cache.get(config.guild_id).members.ban(member)
        })
    
        return
    },
    async fetchBan (User) {
        let fetch = await this.client.guilds.cache.get(config.guild_id).fetchBan(User)
            .then(data => {
                return true
            })
            .catch(() => {
                return false
            })
        return fetch
    },
    isBannable (User) {
        let fetch = this.client.guilds.cache.get(config.guild_id).members.cache.find(member => member.user == User)
        return !fetch ? false : fetch.bannable
    },
    buildDescription (Embed, Fetch) {
        Embed.author.name = 'Aviso de confirmación'
        Embed.description = 'Estás a punto de banear.\nPara confirmar que lo harás realmente, presiona ✅\nEn caso contrario, presiona ❌\n'
        Embed.description += Fetch.invalid_users_count > 0 ? '\n⚠️ **AVISO**: ' + (Fetch.invalid_users_count > 1 ? 'Se omitieron **' + Fetch.invalid_users_count + '** IDs que resultaron ser inválidas.' : 'Se introdujo una ID que resultó ser inválida.') + ' Solamente se baneará a los que aparecen en la siguente lista.' : ''
        Embed.description += Fetch.unbannable_users > 0 ? '\n ⚠️ **AVISO**: ' + (Fetch.unbannable_users > 1 ? 'Se omitieron **' + Fetch.unbannable_users + '** usuarios debido a que no son baneables' : 'Se ha omitido un usuario debido a que no es baneable') : ''
        Embed.description += Fetch.already_banned_users > 0 ? '\n⚠️ **AVISO**: ' + (Fetch.already_banned_users > 1 ? 'Se omitieron **' + Fetch.already_banned_users + '** usuarios debido a que ya fueron baneados' : 'Se ha omitido un usuario debido a que ya fue baneado') : ''
        Embed.description += '```' + Fetch.members.map(user => `[${user.id}] => ${user.tag}`).join('\n') + '```'
    
        return
    },
    async fetchUser (UserID) {
        let fetch = await this.client.users.fetch(UserID)
            .then(user => {
                return user
            })
            .catch(() => {
                return undefined
            })
        
        return fetch
    },
    fetchGuildUser (UserID) {
        let fetch = this.client.guilds.cache.get(config.guild_id).members.cache.get(UserID)
        return !fetch ? false : fetch
    },
    async filterUsers (Users) {
        let arr = new Array()
        let und_arr = new Array()
        let unbannable_users = new Array()
        let already_banned_users = new Array()
    
        und_arr = Users.filter(user => user == undefined)
        Users = Users.filter(user => user != undefined)
    
        for (const user of Users) {
            let booleanFetchGuildUser = this.fetchGuildUser(user.id)
            let booleanFetchBan = await this.fetchBan(user)
            let booleanIsBannable = this.isBannable(user)
    
            if ((booleanFetchGuildUser != false && booleanIsBannable == true && booleanFetchBan == false) || (booleanFetchBan == false && booleanIsBannable != true && booleanFetchGuildUser == false)) arr.push(user)
            else if ((booleanFetchGuildUser == false && booleanFetchBan == true)) already_banned_users.push(user)
            else unbannable_users.push(user)
        }
    
        return {
            members: arr,
            invalid_users_count: und_arr.length,
            unbannable_users: unbannable_users.length,
            already_banned_users: already_banned_users.length
        }
    },
    async filterBannedUsers (Users) {
        let arr = new Array()
    
        for (const user of Users) {
            if (await this.fetchBan(user) == true) arr.push(user)
        }
    
        return arr
    },
    async filterUnbannableUsers (Users) {
        let arr = new Array()
    
        for (const user of Users) {
            if (this.isBannable(user) != true && await this.fetchBan(user) == false && await this.fetchGuildUser(user.id) == true) arr.push(user)
        }
    
        return arr
    }
}
