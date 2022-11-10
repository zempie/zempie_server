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
const _ = require("lodash");
const kafkajs_1 = require("kafkajs");
const opt_1 = require("../../config/opt");
class KafkaService {
    constructor() {
        this._isRunning = false;
        this.gateways = {};
    }
    initialize(groupId) {
        return __awaiter(this, void 0, void 0, function* () {
            const kafka = new kafkajs_1.Kafka({
                clientId: opt_1.default.Kafka.clientId,
                brokers: opt_1.default.Kafka.brokers,
                logLevel: kafkajs_1.logLevel.ERROR,
                retry: {
                // initialRetryTime: 100,
                // retries: 0,
                }
            });
            this.producer = kafka.producer();
            this.consumer = kafka.consumer({ groupId });
            try {
                yield this.producer.connect();
                yield this.consumer.connect();
                // await this.consumer.subscribe({ topic: 'test-topic', fromBeginning: true })
                this._isRunning = true;
            }
            catch (e) {
                console.error(e);
                this.producer = undefined;
                this.consumer = undefined;
            }
        });
    }
    get isRunning() { return this._isRunning; }
    addTopics(topics) {
        return __awaiter(this, void 0, void 0, function* () {
            _.forEach(topics, (topic) => __awaiter(this, void 0, void 0, function* () {
                if (this.consumer) {
                    yield this.consumer.subscribe({
                        topic,
                        fromBeginning: true
                    });
                }
            }));
        });
    }
    addGateways(gateways) {
        return __awaiter(this, void 0, void 0, function* () {
            _.forEach(gateways, (obj) => __awaiter(this, void 0, void 0, function* () {
                if (this.isRunning && this.consumer) {
                    yield this.consumer.subscribe({
                        topic: obj.topic,
                        fromBeginning: true
                    });
                }
                else {
                    this.gateways[obj.topic] = obj.func;
                }
            }));
        });
    }
    run(eachMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.consumer) {
                yield this.consumer.run({
                    eachMessage: ({ topic, partition, message }) => __awaiter(this, void 0, void 0, function* () {
                        if (message && message.value) {
                            eachMessage(topic, message.value.toString());
                        }
                    })
                });
            }
        });
    }
    send(payloads) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isRunning && this.producer) {
                return this.producer.send(Object.assign(Object.assign({}, payloads), { compression: kafkajs_1.CompressionTypes.GZIP }));
            }
            else {
                _.forEach(payloads.messages, (message) => {
                    this.gateways[payloads.topic](message.value);
                });
            }
        });
    }
}
exports.default = new KafkaService();
//# sourceMappingURL=messageQueueService.js.map