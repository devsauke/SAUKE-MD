
'use strict';
const config = require('../config');

function formatUptime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
}

module.exports = {
    name: 'alive',
    aliases: ['status'],
    description: 'Check if the bot is online',
    async execute({ sock, msg, chatId }) {
        const uptime = formatUptime(process.uptime());

        const text =
            `╭───〔 *${config.BOT_NAME}* 〕───╮\n` +
            `│ ✅ Status : *Online*\n` +
            `│ ⏱️ Uptime : *${uptime}*\n` +
            `│ ⚙️ Prefix : *${config.PREFIX}*\n` +
            `│ 🧠 Engine : Baileys (multi-device)\n` +
            `╰──────────────────────╯\n\n` +
            `> _${config.BOT_NAME} is up and listening._`;

        await sock.sendMessage(chatId, { text }, { quoted: msg });
    },
};
