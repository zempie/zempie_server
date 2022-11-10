"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = require("winston");
exports.logger = (0, winston_1.createLogger)({
    level: 'info',
    format: winston_1.format.combine(winston_1.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss.SSS'
    }), winston_1.format.json()),
    transports: [
        new winston_1.transports.Console({
            level: 'debug',
            format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`))
        })
    ]
});
//# sourceMappingURL=logger.js.map