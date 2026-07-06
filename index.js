'use strict';
const path = require('path');
const chalk = require('chalk');
const pino = require('pino');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason,
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');

const config = require('./config');
const logger = require('./logger');
const { loadSession } = require('./sessionLoader');
const { loadCommands } = require('./lib/commandLoader');

const SESSION_DIR = path.resolve(config.SESSION_DIR);

function banner() {
    console.log(
        chalk.magentaBright(`
╔═══════════════════════════════╗
║          S A Y K E   N D        ║
║   WhatsApp Bot — starting up   ║
╚═══════════════════════════════╝
`)
    );
}

async function startBot() {
    banner();

    // 1. Restore creds.json from SESSION_ID if it doesn't already exist.
    const restored = await loadSession(config.SESSION_ID, SESSION_DIR);
    if (!restored) {
        logger.error('Could not initialize a session. Fix SESSION_ID in your .env and restart.');
        process.exit(1);
    }

    // 2. Load command handlers.
    const commands = loadCommands();
    logger.success(`${commands.size ? [...new Set([...commands.values()].map(c => c.name))].length : 0} unique commands ready.`);

    // 3. Set up Baileys auth state + socket.
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: [config.BOT_NAME, 'Chrome', '1.0.0'],
        printQRInTerminal: false,
        syncFullHistory: false,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

            logger.warn(`Connection closed (code ${statusCode}). Reconnecting: ${shouldReconnect}`);

            if (shouldReconnect) {
                startBot();
            } else {
                logger.error('Session logged out. Delete the session folder and generate a new SESSION_ID.');
            }
        } else if (connection === 'open') {
            logger.success(`${config.BOT_NAME} is connected and online! ✅`);
        }
    });

    // 4. Message handling — routes "<prefix>command args..." to the right handler.
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        const msg = messages[0];
        if (!msg?.message || msg.key.fromMe) return;

        const chatId = msg.key.remoteJid;
        const body =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            msg.message.imageMessage?.caption ||
            msg.message.videoMessage?.caption ||
            '';

        if (!body.startsWith(config.PREFIX)) return;

        const [rawCmd, ...args] = body.slice(config.PREFIX.length).trim().split(/\s+/);
        const cmdName = rawCmd.toLowerCase();
        const command = commands.get(cmdName);

        if (!command) return;

        try {
            logger.info(`Executing "${cmdName}" for ${chatId}`);
            await command.execute({ sock, msg, chatId, args, commands, config });
        } catch (e) {
            logger.error(`Error running "${cmdName}":`, e.message);
            await sock.sendMessage(
                chatId,
                { text: `❌ *${config.BOT_NAME}* hit an error running *${cmdName}*:\n${e.message}` },
                { quoted: msg }
            );
        }
    });

    return sock;
}

startBot().catch((e) => {
    logger.error('Fatal error starting bot:', e.message);
    process.exit(1);
});
