import * as kafka from 'kafka-node';
import { Message } from 'kafka-node';


export namespace KafkaService {
    export class Producer {
        private producer!: kafka.Producer;
        private options = {
            requireAcks: 1,
            ackTimeoutMs: 100,
            partitionerType: 0
        };

        connect() {
            return new Promise((resolve, reject) => {
                if ( !this.producer ) {
                    const client = new kafka.KafkaClient();
                    this.producer = new kafka.Producer(client, this.options);
                    this.producer.on('ready', resolve);
                    this.producer.on('error', this.onError);
                }
                resolve();
            })
        }

        onError(error: any) {
            throw new Error(error)
        }

        send(payloads: kafka.ProduceRequest[]) {
            return new Promise((resolve, reject) => {
                this.producer.send(payloads, (err: any, data: any) => {
                    if ( err ) {
                        return reject(err)
                    }

                    resolve(data)
                })
            })
        }
    }


    export class Consumer {
        private consumer!: kafka.Consumer;

        connect(groupId?: string, autoCommit = false, onMessage = this.onMessage) {
            if ( this.consumer ) {
                return this.consumer;
            }
            const options = {
                groupId,
                autoCommit
            }
            this.consumer = new kafka.Consumer(new kafka.KafkaClient(), [], options)
            this.consumer.on('error', this.onError.bind(this))
            this.consumer.on('message', onMessage.bind(this));

            return this.consumer;
        }

        onError(error: any) {
            throw new Error(error)
        }

        addTopic(topics: string[], cb: (error: any, added: string[]) => void) {
            this.consumer.addTopics(topics, cb)
        }

        onMessage(message: Message) {}
    }
}
