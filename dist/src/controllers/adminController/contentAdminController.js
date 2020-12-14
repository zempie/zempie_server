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
const _ = require("lodash");
const globals_1 = require("../../commons/globals");
const notifyService_1 = require("../../services/notifyService");
const opt_1 = require("../../../config/opt");
const { Url, Deploy } = opt_1.default;
class ContentAdminController {
    /**
     *
     * @param params
     * @param admin
     */
    getProjects(params, admin) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    /**
     * 게임
     */
    // async getGames(params: any, admin: IAdmin) {
    //     const response = await fetch(`${Url.DeployApiV1}/games?key=${Deploy.api_key}`);
    //     if( response.status === 200 ) {
    //         const json = await response.json();
    //         return json.data
    //     }
    //     throw new Error(response.statusText);
    // }
    getGames({ limit = 50, offset = 0 }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { count, rows } = yield globals_1.dbs.Games.findAndCountAll({}, {
                include: [{
                        model: globals_1.dbs.User.model,
                    }],
                limit: _.toNumber(limit),
                offset: _.toNumber(offset),
            });
            return {
                count,
                games: _.map(rows, (row) => {
                    return Object.assign({}, row);
                })
            };
        });
    }
    notify({ title, body }, admin) {
        return __awaiter(this, void 0, void 0, function* () {
            const topic = 'test-topic';
            const data = {
                title,
                body,
            };
            yield notifyService_1.default.send({ topic, data });
        });
    }
}
exports.default = new ContentAdminController();
//# sourceMappingURL=contentAdminController.js.map