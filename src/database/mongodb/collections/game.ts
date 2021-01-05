import { Db } from 'mongodb';
import { Collection } from '../collection';


class GameDocument {
    activated:      boolean = false
    enabled:        boolean = false
    official:       boolean = false
    user_id:        string | null = null
    pathname!:      string
    title:          string = ''
    description:    string = ''
    version:        string = '0.0.1'
    control_type:   number = 0
    hashtags!:      string[]
    count_start:    number = 0
    count_over:     number = 0
    url_game:       string | null = null
    url_thumb:      string | null = null
    url_thumb_webp: string | null = null
    url_thumb_gif:  string | null = null
}

class GameCollection extends Collection {
    protected initialize(): void {
        this.name = 'game';
    }

    async afterSync(): Promise<void> {
        await super.afterSync();
    }

    async create(game: GameDocument) {
        return super.create(game);
    }
    async bulkCreate(gameArr: GameDocument[]) {
        return super.bulkCreate(gameArr);
    }
}


export default (db: Db) => new GameCollection(db)
