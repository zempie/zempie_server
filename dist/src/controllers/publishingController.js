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
const globals_1 = require("../commons/globals");
const errorCodes_1 = require("../commons/errorCodes");
const _ = require("lodash");
class PublishingController {
    constructor() {
        this.getList = ({}, { uid }) => __awaiter(this, void 0, void 0, function* () {
            const user = yield globals_1.dbs.User.getPublishing({ uid });
            if (!user) {
                throw errorCodes_1.CreateError(errorCodes_1.ErrorCodes.INVALID_USER_UID);
            }
            const { publishing } = user;
            return {
                publishing: _.map(publishing, (obj) => {
                    const { game } = obj;
                    return {
                        game_id: game.id,
                        title: game.title,
                        count_open: obj.count_open,
                    };
                })
            };
        });
    }
}
exports.default = new PublishingController();
//# sourceMappingURL=publishingController.js.map