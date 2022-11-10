"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const wsController_1 = require("./wsController");
const tcpRoomManager_1 = require("../../services/tcpRoomManager");
const packetService_1 = require("../../services/packetService");
const logger_1 = require("../../commons/logger");
class TcpController extends wsController_1.default {
    constructor() {
        super(...arguments);
        this.onClosed = (ws) => {
            tcpRoomManager_1.default.leave(ws);
        };
        this.onConnected = (ws) => {
            var _a;
            logger_1.logger.debug(`[zWS] connected pathname:`, (_a = ws.gameData) === null || _a === void 0 ? void 0 : _a.game_id);
            (0, packetService_1.SendPacket)(ws, 'open_ok', { uid: ws.uid });
        };
        this.onMessage = (ws, message) => {
            logger_1.logger.debug(message);
            const packet = JSON.parse(message);
            switch (packet.head) {
                case 'enter':
                    tcpRoomManager_1.default.enter(ws);
                    break;
                case 'leave':
                    tcpRoomManager_1.default.leave(ws);
                    break;
                default:
                    tcpRoomManager_1.default.play(ws, packet.body);
            }
        };
    }
}
exports.default = new TcpController();
//# sourceMappingURL=tcpController.js.map