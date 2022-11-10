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
const errorCodes_1 = require("../commons/errorCodes");
const admin = require("firebase-admin");
const utils_1 = require("../commons/utils");
const globals_1 = require("../commons/globals");
class RpcController {
    constructor() {
        this.methods = {};
        this.generator = (name, method, auth = false, is_admin = false) => {
            this.methods[name] = { auth, method, is_admin };
        };
        this.routeRpc = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const data = req.body;
            let error;
            if (data.jsonrpc !== '2.0') {
                return onError({
                    code: -32600,
                    message: 'Bad Request. JSON RPC version is invalid or missing',
                    data: null
                }, 400);
            }
            res.header({
                'Content-Type': 'application/json',
                'Last-Modified': (new Date()).toUTCString()
            });
            try {
                const rpcMethod = this.methods[data.method];
                if (!rpcMethod) {
                    return onError({
                        code: -32601,
                        message: 'Method not found: ' + data.method,
                        data: null
                    }, 404);
                }
                // if ok
                let user;
                if (rpcMethod.auth) {
                    user = rpcMethod.is_admin ? yield this.validateAdminToken(req) : yield this.validateFirebaseIdToken(req);
                    if (!user) {
                        const e = (0, errorCodes_1.CreateError)(errorCodes_1.ErrorCodes.UNAUTHORIZED);
                        return onFailure({
                            code: -32603,
                            message: e.message,
                            data: e
                        });
                    }
                }
                const result = yield rpcMethod.method(data.params, user);
                if (rpcMethod.is_admin) {
                    globals_1.dbs.AdminLog.create({
                        admin_uid: user.uid,
                        task: rpcMethod.method.toString(),
                        value: data.params,
                    });
                }
                return onSuccess(result);
            }
            catch (e) {
                return onError({
                    code: -32601,
                    message: e.message,
                    data: null
                }, 404);
            }
            function onSuccess(result) {
                res.status(200).send({
                    jsonrpc: '2.0',
                    result,
                    error,
                    id: data.id,
                });
            }
            function onFailure(error) {
                onError(error, 500);
            }
            function onError(error, statusCode) {
                res.status(statusCode).send({
                    jsonrpc: '2.0',
                    error,
                    id: data.id,
                });
            }
        });
        this.getIdToken = (req) => {
            let authorization;
            if (typeof req.body.params === "object") {
                authorization = req.body.params.authorization;
            }
            else {
                authorization = JSON.parse(req.body.params).authorization;
            }
            if ((!authorization || !authorization.startsWith('Bearer ')) && !(req.cookies && req.cookies.__session)) {
                console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.', 'Make sure you authorize your request by providing the following HTTP header:', 'Authorization: Bearer <Firebase ID Token>', 'or by passing a "__session" cookie.');
                // throw CreateError(ErrorCodes.UNAUTHORIZED);
                return null;
            }
            let idToken;
            if (authorization && authorization.startsWith('Bearer ')) {
                // console.log('Found "Authorization" header');
                // Read the ID Token from the Authorization header.
                idToken = authorization.split('Bearer ')[1];
            }
            else if (req.cookies) {
                console.log('Found "__session" cookie');
                // Read the ID Token from cookie.
                idToken = req.cookies.__session;
            }
            else {
                // No cookie
                // throw CreateError(ErrorCodes.UNAUTHORIZED);
                return null;
            }
            return idToken;
        };
        this.validateAdminToken = (req) => {
            const idToken = this.getIdToken(req);
            if (!idToken) {
                return null;
            }
            try {
                return (0, utils_1.verifyJWT)(idToken);
            }
            catch (error) {
                console.error('Error while verifying Admin ID token:', error);
                return null;
            }
        };
        this.validateFirebaseIdToken = (req) => __awaiter(this, void 0, void 0, function* () {
            const idToken = this.getIdToken(req);
            if (!idToken) {
                return null;
            }
            try {
                const decodedIdToken = yield admin.auth().verifyIdToken(idToken);
                // console.log('ID Token correctly decoded', decodedIdToken);
                return decodedIdToken;
            }
            catch (error) {
                console.error('Error while verifying Firebase ID token:', error);
                // throw CreateError(ErrorCodes.UNAUTHORIZED);
                return null;
            }
        });
    }
}
exports.default = new RpcController();
//# sourceMappingURL=rpcController.js.map