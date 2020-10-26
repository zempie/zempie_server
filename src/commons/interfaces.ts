import { Message } from 'kafka-node';

export interface IServerOptions {
    tcp: boolean,
    port: number,
    static_path?: any,
    messageQueue?: {
        groupId: string,
        autoCommit: boolean,
        onMessage: (message: Message) => void,
        addTopics: string[],
    },
}

export interface IMessageQueueOptions {
    groupId: string,
    autoCommit: boolean,
    onMessage: (message: Message) => void,
    addTopics: string[],
}
