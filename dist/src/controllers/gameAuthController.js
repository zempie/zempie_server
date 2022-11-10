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
var jwt = require('jsonwebtoken');
const errorCodes_1 = require("../commons/errorCodes");
const globals_1 = require("../commons/globals");
const crypto = require('crypto');
const SECRET_KEY = crypto.randomBytes(48).toString('hex');
const ALGORITHM = 'aes-256-cbc';
const CRYPTO_KEY = crypto.randomBytes(16).toString('hex');
const IV = crypto.randomBytes(16);
const API_AUTH_KEY = 'zempie2022';
class GameAuthController {
    createUserToken({ uid }) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield globals_1.dbs.User.getInfo({ uid });
            if (user) {
                const payload = {
                    uid: uid,
                    created_time: Date.now(),
                    email: user.email,
                    picture: user.picture,
                    name: user.name
                };
                return { token: jwt.sign(payload, SECRET_KEY, { expiresIn: 60 * 60, issuer: 'zempie' }) };
            }
            else {
                throw (0, errorCodes_1.CreateError)(errorCodes_1.ErrorCodes.UNAUTHORIZED);
            }
        });
    }
    verifyToken({ token }) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return { info: jwt.verify(token, SECRET_KEY) };
            }
            catch (err) {
                throw (0, errorCodes_1.CreateError)(errorCodes_1.ErrorCodes.INVALID_TOKEN);
            }
        });
    }
    getInfo({}, { uid }) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield globals_1.dbs.User.getInfo({ uid });
            return { user: user };
        });
    }
    createGameToken({ text }) {
        return __awaiter(this, void 0, void 0, function* () {
            let cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(CRYPTO_KEY), IV);
            // Updating text
            let encrypted = cipher.update(text);
            // Using concatenation
            encrypted = Buffer.concat([encrypted, cipher.final()]);
            // Returning iv and encrypted data
            return { encryptedData: encrypted.toString('hex') };
        });
    }
    verifyGameToken(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const decipher = crypto.createDecipheriv(ALGORITHM, CRYPTO_KEY, Buffer.from(IV, 'hex'));
            const decrpyted = Buffer.concat([decipher.update(Buffer.from(key, 'hex')), decipher.final()]);
            return API_AUTH_KEY === decrpyted.toString();
        });
    }
}
exports.default = new GameAuthController();
//# sourceMappingURL=gameAuthController.js.map