
'use strict';
require('dotenv').config();

module.exports = {
    BOT_NAME: process.env.BOT_NAME || 'SAYKE ND',
    PREFIX: process.env.PREFIX || '.',
    SESSION_ID: process.env.SESSION_ID || '',
    SESSION_DIR: process.env.SESSION_DIR || './session',
    OWNER_NUMBER: process.env.OWNER_NUMBER || '', // e.g. 2348012345678
    PUBLIC_MODE: (process.env.PUBLIC_MODE || 'true').toLowerCase() !== 'false',
};
