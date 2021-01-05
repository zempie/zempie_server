import { Db } from 'mongodb';
import { logger } from '../../commons/logger';


export abstract class Collection {
    protected collection: any;
    protected name: string = '';
    protected attributes: object = {};

    constructor(db: Db) {
        this.initialize();

        this.collection = db.collection(this.name);
    }

    protected abstract initialize(): void;

    async afterSync() {
        logger.info(`[collection] ${this.name} synced.`);
    }

    getName() {
        return this.name;
    }
    getCollectionName() {
        return this.collection.collectionName;
    }

    async create(obj: any) {
        const now = new Date();
        obj.created_at = now;
        obj.updated_at = now;
        obj.deleted_at = null;

        return await this.collection.insertOne(obj);
    }

    async bulkCreate(arr: any[]) {
        return await this.collection.insertMany(arr);
    }

    async findOne(query: any) {
        return await this.collection.findOne(query)
    }

    async findAll(query: any) {
        return await this.collection.find(query)
    }
}
