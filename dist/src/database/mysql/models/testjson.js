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
const model_1 = require("../model");
const sequelize_1 = require("sequelize");
const globals_1 = require("../../../commons/globals");
class Testjson extends model_1.default {
    initialize() {
        this.name = 'testJson';
        this.attributes = {
            name: { type: sequelize_1.DataTypes.STRING(10) },
            body: { type: sequelize_1.DataTypes.JSON },
        };
    }
    afterSync() {
        const _super = Object.create(null, {
            afterSync: { get: () => super.afterSync }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.afterSync.call(this);
            this.model.belongsTo(globals_1.dbs.Game.model);
            // const data = await Sequelize.fn('json_extract', Sequelize.col('body'), '$.game_uid');
            // console.log(data);
            if ((yield this.model.count()) < 1) {
                const bulk = [{
                        name: 'test1',
                        body: [
                            1, 2, 3
                        ]
                    }, {
                        name: 'test2',
                        body: {
                            game_id: 4,
                            user_uid: '1EFdB1UR3ANeLmK3p21IoA74MkD3',
                        }
                    }, {
                        name: 'test1',
                        body: {
                            game_id: 6,
                            user_uid: 'mwCRK8FSote6R3z4kVRdwXekTRZ2',
                        }
                    }];
                yield this.bulkCreate(bulk);
            }
            else {
                // const r = await this.model.findOne({
                //     where: Sequelize.where(
                //         Sequelize.fn('JSON_SEARCH', Sequelize.col('game_id'), 'one', 6), {
                //             // @ts-ignore
                //             [Op.ne]: null,
                //         }),
                //     include: [{
                //         model: dbs.Game.model,
                //     }]
                // });
                // const r = await this.model.findOne({
                //     where: Sequelize.literal(`body->'$.user_uid'='mwCRK8FSote6R3z4kVRdwXekTRZ2'`),
                // })
                // console.log(r);
            }
        });
    }
}
exports.default = (rdb) => new Testjson(rdb);
//# sourceMappingURL=testjson.js.map