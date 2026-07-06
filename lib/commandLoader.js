'use strict';
const fs = require('fs');
const path = require('path');
const logger = require('../logger');

/**
 * Loads every .js file in /commands into a single Map.
 * Each command is registered under its `name` and all `aliases`,
 * so lookups by either resolve to the same handler.
 */
function loadCommands(commandsDir = path.join(__dirname, '..', 'commands')) {
    const commands = new Map();

    const files = fs.readdirSync(commandsDir).filter((f) => f.endsWith('.js'));

    for (const file of files) {
        try {
            const cmd = require(path.join(commandsDir, file));
            if (!cmd || !cmd.name || typeof cmd.execute !== 'function') {
                logger.warn(`Skipping "${file}" — missing name/execute export.`);
                continue;
            }

            commands.set(cmd.name.toLowerCase(), cmd);
            for (const alias of cmd.aliases || []) {
                commands.set(alias.toLowerCase(), cmd);
            }

            logger.info(`Loaded command: ${cmd.name}`);
        } catch (e) {
            logger.error(`Failed to load command "${file}":`, e.message);
        }
    }

    return commands;
}

module.exports = { loadCommands };
