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
exports.SrvMQ = void 0;
const _ = require("lodash");
class SrvMQ {
    constructor() {
        this.onMessage = (message) => {
            const func = _.camelCase(message.topic);
            // @ts-ignore
            return this[func](message);
        };
        this.eachMessage = (topic, message) => __awaiter(this, void 0, void 0, function* () {
            const func = _.camelCase(topic);
            // @ts-ignore
            return this[func](message);
        });
        this.addTopics = () => {
            const names = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
            const topics = names.filter((name) => {
                return name !== 'constructor';
            });
            return topics;
        };
        this.addGateway = () => {
            const names = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
            const gateways = names.filter((name) => {
                return name !== 'constructor';
            }).map((topic) => {
                return {
                    topic,
                    // @ts-ignore
                    func: this[topic],
                };
            });
            return gateways;
        };
    }
}
exports.SrvMQ = SrvMQ;
//# sourceMappingURL=_srvMQ.js.map