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
const contentRoute_1 = require("../routes/contentRoute");
const contentMQ_1 = require("../controllers/messageQueues/contentMQ");
class ContentServer extends server_1.default {
    constructor() {
        super(...arguments);
        this.initialize = (options) => __awaiter(this, void 0, void 0, function* () {
            this.options = options;
            this.setExpress(options);
            yield this.setRDB();
            yield this.setMDB();
        });
        this.afterStart = () => __awaiter(this, void 0, void 0, function* () {
            const options = {
                groupId: 'content-server',
                autoCommit: true,
                // addTopics: mq.addTopics(),
                addGateways: contentMQ_1.default.addGateway(),
                eachMessage: contentMQ_1.default.eachMessage.bind(contentMQ_1.default),
            };
            yield this.setMessageQueue(options);
        });
    }
    routes(app) {
        super.routes(app);
        contentRoute_1.default(app);
    }
}
exports.default = ContentServer;
//# sourceMappingURL=contentServer.js.map