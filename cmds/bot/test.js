module.exports = {
    name: 'test',
    alias: [],
    description: 'Seccion de pruebas',
    ownerOnly: true,
    nsfw: false,
    botPermissions: [],
    userPermissions: [],
    maxArgs: -1,
    async run () {
        this.message.channel.send({ embed: {
            description: 'a'
        }})
    }
}