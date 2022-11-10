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
const enums_1 = require("../commons/enums");
class ShopController {
    buyItem({ item_id }, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = yield globals_1.dbs.Item.findOne({ item_id });
            if (!item) {
                throw (0, errorCodes_1.CreateError)(errorCodes_1.ErrorCodes.INVALID_ITEM_ID);
            }
            const userRecord = yield globals_1.dbs.User.findOne({ uid: user.uid });
            const user_id = userRecord.id;
            yield globals_1.dbs.Inventory.getTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                // 구입 가능한지 확인
                // 중복 확인
                if (item.used_type !== enums_1.eItemUsingType.Accumulated) {
                    const _have_it = yield globals_1.dbs.Inventory.findOne({ user_id, item_id });
                    if (_have_it) {
                        throw (0, errorCodes_1.CreateError)(errorCodes_1.ErrorCodes.BUY_DUPLICATED_ITEM);
                    }
                }
                // 돈 있나 확인
                // 구매 - 포인트 차감
                // 구매 - 인벤토리에 추가
                yield globals_1.dbs.Inventory.create({ user_id, item_id }, transaction);
            }));
        });
    }
    useItem({ item_id }, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRecord = yield globals_1.dbs.User.findOne({ uid: user.uid });
            const user_id = userRecord.id;
            yield globals_1.dbs.Inventory.getTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                const item = yield globals_1.dbs.Inventory.findOne({ user_id, item_id });
                if (item.is_used) {
                    throw (0, errorCodes_1.CreateError)(errorCodes_1.ErrorCodes.REJECT_USE_ITEM);
                }
            }));
        });
    }
}
exports.default = new ShopController();
//# sourceMappingURL=shopController.js.map