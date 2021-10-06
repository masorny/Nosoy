const beautify = require('beautify')
const timeParse = require('../../modules/timeParse')

module.exports = {
    name: 'eval',
    alias: ['cmd'],
    description: 'Evalua la expresion dada',
    ownerOnly: true,
    nsfw: false,
    botPermissions: [],
    userPermissions: [],
    maxArgs: -1, // -1 = No limit
    async run () {
        try {
            const { embed_color } = require('../../config/config.json')
            let obj = {
                color: embed_color
            }

            let input = this.args.join(' '), output = undefined

            try {
                let evaled = await eval(input)
                if (typeof evaled !== 'string') output = require('util').inspect(evaled, { depth: 0 })
            } catch (err) {
                output = err.toString()
            }

            obj.description = '```js\n' + beautify(output, { format: 'js' }) + '```'
            await this.message.channel.send({ embed: obj })
        } catch (err) {
            console.log(err)
        }
    }
}