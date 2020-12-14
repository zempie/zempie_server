"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const configEntries = [
    {
        name: 'compression.type',
        value: 'gzip',
    }
];
const topics = [
    {
        topic: 'gameOver',
        partitions: 1,
        replicationFactor: 1,
        configEntries,
    },
    {
        topic: 'pub_PlayGame',
        partitions: 1,
        replicationFactor: 1,
        configEntries,
    },
    {
        topic: 'battle_gameOver',
        partitions: 1,
        replicationFactor: 1,
        configEntries,
    }
];
exports.default = topics;
//# sourceMappingURL=kafkaTopics.js.map