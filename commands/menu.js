
'use strict';
const config = require('../config');

module.exports = {
    name: 'menu',
    aliases: ['help', 'commands'],
    description: 'Show the command list',
    async execute({ sock, msg, chatId, commands }) {
        const grouped = [...commands.values()]
            .filter((cmd, i, arr) => arr.findIndex((c) => c.name === cmd.name) === i)
            .sort((a, b) => a.name.localeCompare(b.name));

        let list = grouped
            .map((cmd) => `│ ${config.PREFIX}${cmd.name} — ${cmd.description || 'No description'}`)
            .join('\n');

        const text =
            `╭──〔 *${config.BOT_NAME}* 〕──╮\n` +
            `│ 👋 Hello, here's what I can do:\n` +
            `│\n` +
            `${list}\n` +
            `╰──────────────────────╯\n\n` +
            `> _Prefix: "${config.PREFIX}" • ${grouped.length} commands loaded_`;

        await sock.sendMessage(chatId, { text }, { quoted: msg });
    },
};
