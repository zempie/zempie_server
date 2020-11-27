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
const server_1 = require("./server");
const logMQ_1 = require("../controllers/messageQueues/logMQ");
class LogServer extends server_1.default {
    constructor() {
        super(...arguments);
        this.afterStart = () => __awaiter(this, void 0, void 0, function* () {
            const options = {
                groupId: 'log-server',
                autoCommit: false,
                addTopics: logMQ_1.default.addTopics(),
                eachMessage: logMQ_1.default.eachMessage.bind(logMQ_1.default),
            };
            yield this.setMessageQueue(options);
        });
    }
}
exports.default = LogServer;
//# sourceMappingURL=logServer.js.map