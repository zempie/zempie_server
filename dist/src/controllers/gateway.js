"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mqGateway = void 0;
const messageQueueService_1 = require("../services/messageQueueService");
exports.mqGateway = (topic, messages) => {
    if (messageQueueService_1.default.isRunning) {
        messageQueueService_1.default.send({ topic, messages });
    }
    else {
    }
};
class SelfController {
    gameOver({ topic, messages }) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.default = new SelfController();
//# sourceMappingURL=gateway.js.map