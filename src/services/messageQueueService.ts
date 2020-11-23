import * as _ from 'lodash';
import { CompressionTypes, Consumer, Kafka, logLevel, Message, Producer, ProducerRecord } from 'kafkajs'
import config from '../../config/opt';


class KafkaService {
    private producer!: Producer
    private consumer!: Consumer

    async initialize (groupId: string) {
        const kafka = new Kafka({
            clientId: config.Kafka.clientId,
            brokers: config.Kafka.brokers,
            logLevel: logLevel.ERROR
        });

        this.producer = kafka.producer();
        this.consumer = kafka.consumer({ groupId });

        await this.producer.connect();
        await this.consumer.connect();
    }

    async addTopics (topics: Array<string>) {
        _.forEach(topics, async (topic: string) => {
            await this.consumer.subscribe({
                topic,
                fromBeginning: true
            })
        })
    }

    async run (eachMessage: any) {
        await this.consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                if ( message && message.value ) {
                    eachMessage(topic, message.value.toString())
                }
            }
        })
    }

    async send (payloads: {topic: string, messages: Message[]}) {
        return this.producer.send({
            ...payloads,
            compression: CompressionTypes.GZIP
        })
    }
}


export default new KafkaService()
