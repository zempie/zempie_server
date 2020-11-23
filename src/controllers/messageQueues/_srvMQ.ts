import { Message } from 'kafka-node';
import * as _ from 'lodash';
import { KafkaMessage } from 'kafkajs';


export class SrvMQ {
    onMessage =  (message: Message) => {
        const func = _.camelCase(message.topic);

        // @ts-ignore
        return this[func](message)
    }

    eachMessage = async (topic: string, message: any): Promise<any> => {
        const func = _.camelCase(topic);

        // @ts-ignore
        return this[func](message);
    }

    addTopics = (): string[] => {
        const names = Object.getOwnPropertyNames(Object.getPrototypeOf(this))
        const topics = names.filter((name) => {
            return name !== 'constructor'
        })
        return topics;
    }
}
