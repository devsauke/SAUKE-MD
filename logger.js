
'use strict';
const chalk = require('chalk');

const tag = () => chalk.gray(`[${new Date().toLocaleTimeString()}]`);

module.exports = {
    info: (...args) => console.log(tag(), chalk.cyanBright('[SAYKE ND]'), ...args),
    warn: (...args) => console.log(tag(), chalk.yellowBright('[SAYKE ND]'), ...args),
    error: (...args) => console.log(tag(), chalk.redBright('[SAYKE ND]'), ...args),
    success: (...args) => console.log(tag(), chalk.greenBright('[SAYKE ND]'), ...args),
};
