"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Consumer = exports.Producer = void 0;
const kafka = require("kafka-node");
const kafkaTopics_1 = require("./kafkaTopics");
const logger_1 = require("../commons/logger");
var KafkaService;
(function (KafkaService) {
    class Producer {
        constructor() {
            this.options = {
                requireAcks: 1,
                ackTimeoutMs: 100,
                partitionerType: 0
            };
        }
        connect() {
            return new Promise((resolve, reject) => {
                try {
                    if (this.producer) {
                        return resolve(this.producer);
                    }
                    const client = new kafka.KafkaClient();
                    client.createTopics(kafkaTopics_1.default, (error, result) => {
                        this.producer = new kafka.Producer(client, this.options);
                        this.producer.on('ready', () => { resolve(this.producer); });
                        this.producer.on('error', this.onError);
                        // resolve(this.producer);
                    });
                }
                catch (e) {
                    reject(e);
                }
            });
        }
        onError(error) {
            throw new Error(error);
        }
        send(payloads) {
            this.producer.send(payloads, (err, data) => {
                if (err) {
                    return logger_1.logger.error(err);
                }
                // logger.debug(data)
                console.log('[kafka-produce]', data);
            });
        }
    }
    KafkaService.Producer = Producer;
    class Consumer {
        connect(groupId, autoCommit = false, onMessage = this.onMessage) {
            return new Promise((resolve, reject) => {
                try {
                    if (this.consumer) {
                        return resolve(this.consumer);
                    }
                    const options = {
                        groupId,
                        autoCommit
                    };
                    this.consumer = new kafka.Consumer(new kafka.KafkaClient(), [], options);
                    this.consumer.on('error', this.onError.bind(this));
                    this.consumer.on('message', onMessage);
                    resolve(this.consumer);
                }
                catch (e) {
                    reject(e);
                }
            });
        }
        onError(error) {
            throw new Error(error);
        }
        addTopic(topics) {
            this.consumer.addTopics(topics, (error, added) => {
                if (error) {
                    return console.error(error);
                }
                console.log(`added Topic: `, added);
            });
        }
        onMessage(message) { }
    }
    KafkaService.Consumer = Consumer;
})(KafkaService || (KafkaService = {}));
exports.Producer = new KafkaService.Producer();
exports.Consumer = new KafkaService.Consumer();
//# sourceMappingURL=kafkaService.js.map