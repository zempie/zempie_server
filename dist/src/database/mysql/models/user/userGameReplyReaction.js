"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = require("../../../_base/model");
const sequelize_1 = require("sequelize");
const enums_1 = require("../../../../commons/enums");
class UserGameReplyReactionModel extends model_1.default {
    initialize() {
        this.name = 'userGameReplyReaction';
        this.attributes = {
            reply_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, unique: 'compositeIndex' },
            user_uid: { type: sequelize_1.DataTypes.STRING(36), allowNull: false, unique: 'compositeIndex' },
            reaction: { type: sequelize_1.DataTypes.SMALLINT, allowNull: false, defaultValue: enums_1.eReplyReaction.none },
        };
    }
}
exports.default = (rdb) => new UserGameReplyReactionModel(rdb);
//# sourceMappingURL=userGameReplyReaction.js.map