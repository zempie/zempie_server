import { Message } from 'kafka-node';

export interface IServerOptions {
    tcp: boolean,
    static_path?: any,
    messageQueue?: {
        groupId: string,
        autoCommit: boolean,
        onMessage: (message: Message) => void,
    },
}
