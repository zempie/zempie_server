import { Collection } from '../../collection';
import { Db } from 'mongodb';


class UserGameDocument {
    user_id!: string
    game_id!: number
    score!: number
}

class UserGameCollection extends Collection {
    protected initialize(): void {
        this.name = 'userGame';
    }

    async afterSync(): Promise<void> {
        await super.afterSync();

        await this.collection.createIndexes({ user_id: 1, game_id: 1 }, { unique: true });
    }

    async create(obj: UserGameDocument) {
        return super.create(obj);
    }
}


export default (db: Db) => new UserGameCollection(db)
