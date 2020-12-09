"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zWS = void 0;
const ws = require("ws");
const uniqid = require("uniqid");
const logger_1 = require("../../commons/logger");
class zWS extends ws {
    constructor() {
        super(...arguments);
        this.isAlive = false;
    }
}
exports.zWS = zWS;
class WSController {
    constructor() {
        this.connected = (ws, req) => {
            ws.uid = uniqid.time();
            ws.gameData = {
                game_id: req.params.pathname,
                num: (req.params.num || 2).toString(),
                room_id: '',
                save_data: {}
            };
            ws.isAlive = true;
            ws.on('pong', () => {
                ws.isAlive = true;
            });
            ws.on('message', (_message) => {
                // return this.onMessage(ws, _message);
            });
            ws.on('close', () => {
                logger_1.logger.debug('onClosed');
                // return this.onClosed(ws);
            });
            ws.on('error', () => {
                logger_1.logger.debug('onError');
                // return this.onPeerDisconnect(ws);
            });
            this.onConnected(ws);
        };
        this.onConnected = (ws) => { };
        this.onMessage = (ws, message) => { };
        this.onClosed = (ws) => { };
        this.onPeerDisconnect = (ws) => {
            this.onClosed(ws);
        };
    }
}
exports.default = WSController;
//# sourceMappingURL=wsController.js.map