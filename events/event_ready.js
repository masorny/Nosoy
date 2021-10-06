const system = require('../config/system.json')

module.exports = {
    name: 'ready',
    execute () {
        console.log('ready')
        setInterval(() => {
            this.user.setActivity(this.guilds.cache.get(system.guild_id).members.cache.array().length + ' miembros!')
        }, 10000)
    }
}