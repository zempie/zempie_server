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
const collection_1 = require("../collection");
class UserCollection extends collection_1.default {
    initialize() {
        this.name = 'user2';
        this.attributes = {
            uid: { type: String, index: true, unique: true },
            activated: { type: Boolean },
            banned: { type: Boolean },
            name: { type: String },
            channel_id: { type: String },
            picture: { type: String },
            provider: { type: String },
            email: { type: String },
            email_verified: { type: Boolean },
            fcm_token: { type: String },
            is_developer: { type: Boolean },
            last_log_in: { type: Date },
            profile: {
                level: { type: Number },
                exp: { type: Number },
                state_msg: { type: String },
                description: { type: String },
                url_banner: { type: String },
            },
            deleted_at: { type: Date },
        };
    }
    afterSync() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.default = new UserCollection();
//# sourceMappingURL=user.js.map