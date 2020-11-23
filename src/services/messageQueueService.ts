import * as _ from 'lodash';
import { CompressionTypes, Consumer, Kafka, logLevel, Producer, ProducerRecord } from 'kafkajs'
import config from '../../config/opt';


class KafkaService {
    private producer!: Producer
    private consumer!: Consumer

    async initialize (groupId: string) {
        const kafka = new Kafka({
            clientId: config.Kafka.clientId,
            brokers: config.Kafka.brokers,
            logLevel: logLevel.DEBUG
        });

        this.producer = kafka.producer();
        this.consumer = kafka.consumer({ groupId });

        await this.producer.connect();
        await this.consumer.connect();
    }

    async addTopics (topics: Array<string>) {
        _.forEach(topics, async (topic: string) => {
            await this.consumer.subscribe({
                topic
            })
        })
    }

    async run (eachMessage: any) {
        await this.consumer.run({
            eachMessage: eachMessage
        })
    }

    async send (payloads: ProducerRecord) {
        return this.producer.send({
            ...payloads,
            compression: CompressionTypes.GZIP
        })
    }
}


export default new KafkaService()
