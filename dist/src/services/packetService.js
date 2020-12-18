"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Broadcast = exports.SendPacket = void 0;
const _ = require("lodash");
function SendPacket(ws, head, body = {}) {
    if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify({
            head,
            body
        }));
    }
}
exports.SendPacket = SendPacket;
function Broadcast(members, ws, head, body = {}) {
    _.forEach(members, (_ws) => {
        SendPacket(_ws, head, body);
    });
}
exports.Broadcast = Broadcast;
//# sourceMappingURL=packetService.js.map