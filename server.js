require('dotenv').config({ path: './config/.env' })
const {
    TOKEN:token,
    OWNER:owner
} = process.env
const config = require('./config/config.json')

const Discord = require('discord.js')
const client = new Discord.Client({ partials: ['MESSAGE'] })
const path = require('path')

// Cargar comandos
let commands = require('./modules/Commands')
commands.start(client, './cmds/')

// Cargar eventos
let events = require('./modules/Events')
events.load(client, { dir: './events/' })

client.login(token)