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
const firebase_admin_1 = require("firebase-admin");
class NotifyService {
    notify({ user_uid, type, data }) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield globals_1.dbs.User.getSetting({ uid: user_uid });
            if (!user) {
                throw (0, errorCodes_1.CreateError)(errorCodes_1.ErrorCodes.INVALID_USER_UID);
            }
            if (!user.fcm_token) {
                // throw CreateError(ErrorCodes.INVALID_FCM_TOKEN);
                return;
            }
            if (user.notify[type]) {
                yield this.send({
                    token: user.fcm_token,
                    data: Object.assign({ type: type.toString() }, data)
                });
            }
        });
    }
    send({ topic, token, data }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!topic && !token) {
                throw (0, errorCodes_1.CreateError)(errorCodes_1.ErrorCodes.INVALID_PARAMS);
            }
            const message = {
                // notification: {
                //     title,
                //     body,
                //     imageUrl: 'https://zemini.s3.ap-northeast-2.amazonaws.com/companies/FTR_Symbol.png'
                // },
                // webpush: {},
                fcmOptions: {
                    analyticsLabel: ''
                },
                topic: topic ? topic : undefined,
                token: token ? token : undefined,
                data,
            };
            return yield firebase_admin_1.default.messaging().send(message);
        });
    }
    broadcastMessage() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.default = new NotifyService();
//# sourceMappingURL=notifyService.js.map