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
const adminRoute_1 = require("../routes/adminRoute");
const contentRoute_1 = require("../routes/contentRoute");
const userRoute_1 = require("../routes/userRoute");
const gameRoute_1 = require("../routes/gameRoute");
const launcherRoute_1 = require("../routes/launcherRoute");
const supportRoute_1 = require("../routes/supportRoute");
const tcpRoute_1 = require("../routes/tcpRoute");
const apiMQ_1 = require("../controllers/messageQueues/apiMQ");
class ApiServer extends server_1.default {
    constructor() {
        super(...arguments);
        this.initialize = (options) => __awaiter(this, void 0, void 0, function* () {
            this.options = options;
            this.setFirebase();
            this.setExpress(options);
            yield this.setRDB();
            yield this.setMDB();
            // this.setEJS();
            this.setSwagger();
            this.setGraphQL();
        });
        this.afterStart = () => __awaiter(this, void 0, void 0, function* () {
            const options = {
                groupId: 'api-server',
                autoCommit: true,
                // addTopics: mq.addTopics(),
                addGateways: apiMQ_1.default.addGateway(),
                eachMessage: apiMQ_1.default.eachMessage.bind(apiMQ_1.default),
            };
            yield this.setMessageQueue(options);
        });
    }
    routes(app) {
        super.routes(app);
        adminRoute_1.default(app);
        userRoute_1.default(app);
        contentRoute_1.default(app);
        gameRoute_1.default(app);
        launcherRoute_1.default(app);
        supportRoute_1.default(app);
        tcpRoute_1.default(app);
        // scheduleService.start()
        // ExchangeManager.start()
    }
}
exports.default = ApiServer;
//# sourceMappingURL=apiServer.js.map