"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const mongoose = require("mongoose");
const globals_1 = require("../../commons/globals");
const utils_1 = require("../../commons/utils");
// const host = 'mongodb://localhost:27017/test';
const host = `mongodb://DESKTOP-G5BA1K1:27017,DESKTOP-G5BA1K1:27018,DESKTOP-G5BA1K1:27019/test?replicaSet=rs&retryWrites=false`;
const database = 'zempie';
class MongoDB {
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                useUnifiedTopology: true,
                useNewUrlParser: true,
                useCreateIndex: true,
                retryWrites: false,
            };
            // this.client = await MongoClient.connect(host, options);
            // this.db = this.client.db(database);
            // await this.syncDefine();
            yield mongoose.connect(host, options);
            this.db = mongoose.connection;
            this.db.on('error', console.error.bind(console, 'mongodb connection error:'));
            this.db.once('open', () => __awaiter(this, void 0, void 0, function* () {
                console.log('!!?');
            }));
            yield this.syncDefine();
            // await this.migration(this.db);
        });
    }
    syncDefine() {
        return __awaiter(this, void 0, void 0, function* () {
            // const collections: any = {};
            const dir = path.join(__dirname, '/models');
            utils_1.getFiles(dir, (dir, file) => {
                if (!!this.db) {
                    // const collection: any = require(path.join(dir, file)).default(this.db, this.client);
                    const collection = require(path.join(dir, file)).default;
                    globals_1.docs[utils_1.capitalize(collection.getName())] = collection;
                }
            });
        });
    }
    migration(db) {
        return __awaiter(this, void 0, void 0, function* () {
            // for ( const i in docs ) {
            //     if ( docs.hasOwnProperty(i) ) {
            //         const collection = docs[i];
            //         if ( collection instanceof _collection ) {
            //             await collection.afterSync();
            //         }
            //     }
            // }
            //
            // let users = await dbs.User.model.findAll({
            //     include: [{
            //         model: dbs.UserProfile.model,
            //         as: 'profile',
            //     }]
            // });
            // const arr = _.map(users, (r: any) => {
            //     const obj = r.get({ plain: true });
            //     const { profile, gameRecords, devGames } = obj;
            //     return {
            //         uid: obj.uid,
            //         activated: obj.activated,
            //         banned: obj.banned,
            //         name: obj.name,
            //         channel_id: obj.channel_id,
            //         picture: obj.picture,
            //         provider: obj.provider,
            //         email: obj.email,
            //         email_verified: obj.email_verified,
            //         fcm_token: obj.fcm_token,
            //         is_developer: obj.is_developer,
            //         last_log_in: obj.last_log_in,
            //         profile: {
            //             level: profile.level,
            //             state_msg: profile.state_msg,
            //             description: profile.description,
            //             url_banner: profile.url_banner,
            //         },
            //     }
            // })
            // await docs.User2.bulkCreate(arr);
            // await docs.User2.destroy({ uid: 'e3ritamdc0REBTzgaGzi8rqCYQa2' });
            // const res = await docs.User2.findAll({ deleted_at: null });
            // console.log(res.length);
        });
    }
}
exports.default = new MongoDB();
//# sourceMappingURL=index.js.map