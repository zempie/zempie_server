import { Db } from 'mongodb';
import { Collection } from '../../collection';
import { docs } from '../../../../commons/globals';


class UserProfile {
    level?: number = 0
    exp?: number = 0
    state_msg: string | null = null
    description: string | null = null
    url_banner: string | null = null
}
class UserExternalLink {
    name!: string
    url_link!: string
}
class UserGame {
    game_id!: number
    score!: number
}
class UserDocument {
    uid!:               string
    activated?:         boolean = false
    banned?:            boolean = false
    name:               string | null = null
    channel_id!:        string
    picture:            string | null = null
    provider:           string = 'email'
    email:              string | null = null
    email_verified:     boolean = false
    fcm_token?:         string | null = null
    is_developer?:      boolean = false
    last_log_in:        Date | null = null
    profile!:           UserProfile
    external_link?:     UserExternalLink[]
    // gameRecords?:       {[key: number]: UserGame}
}

class UserCollection extends Collection {
    protected initialize() {
        this.name = 'user';
    }

    async afterSync(): Promise<void> {
        await super.afterSync();

        this.collection.createIndex({ uid : 1 }, { unique: true });
    }

    async create(user: UserDocument) {
        user.profile.level = 0;
        user.profile.exp = 0;

        return super.create(user)
    }
    async bulkCreate(userArr: UserDocument[]) {
        return super.bulkCreate(userArr)
    }

    async findOneByUid(uid: string) {
        return this.collection.findOne({ uid });
    }

    async getProfile(query: any) {
        const res = await this.collection.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: docs.UserGame.getCollectionName(),
                    localField: '_id',
                    foreignField: 'user_id',
                    as: 'game_records',
                }
            },
            {
                $unwind: {
                    path: "$game_records",
                    // includeArrayIndex: 'id',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: docs.Game.getCollectionName(),
                    localField: 'game_records.game_id',
                    foreignField: '_id',
                    as: 'game_records.game',
                }
            },
            {
                $group: {
                    _id: '$_id',
                    name: { $first: '$name' },
                    channel_id: { $first: '$channel_id' },
                    email: { $first: '$email' },
                    picture: { $first: '$picture' },
                    profile: { $first: '$profile' },
                    game_records: {
                        $push: '$game_records',
                    },

                }
            }
        ]).toArray();
        return res.length > 0? res[0] : null;
    }
}


export default (db: Db) => new UserCollection(db)
