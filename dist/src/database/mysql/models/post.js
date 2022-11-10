"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = require("../../_base/model");
class PostModel extends model_1.default {
    initialize() {
        this.name = 'post';
        // this.attributes = {
        //     name:           { type: DataTypes.STRING(20), allowNull: false },
        //     used_type:      { type: DataTypes.SMALLINT, allowNull: false, defaultValue: eItemUsingType.Permanent },
        //     // is_using:       { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        //     period:         { type: DataTypes.INTEGER },
        //     is_used:        { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        // }
    }
}
exports.default = (rdb) => new PostModel(rdb);
//# sourceMappingURL=post.js.map