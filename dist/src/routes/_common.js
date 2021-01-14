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
exports.adminTracking = exports.validateAdminIdToken = exports.validateFirebaseIdToken = exports.getIdToken = exports.isAuthenticated = exports.readyToPlay = exports.validateUid = exports.throwError = void 0;
const admin = require("firebase-admin");
const utils_1 = require("../commons/utils");
const globals_1 = require("../commons/globals");
const opt_1 = require("../../config/opt");
const logger_1 = require("../commons/logger");
function throwError(res, e, statusCode = 401) {
    res.statusCode = statusCode;
    res.send({
        error: e
    });
}
exports.throwError = throwError;
const validateUid = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { game_path, publisher_uid } = req.params;
    if (!game_path) {
        return throwError(res, 'invalid game_path');
    }
    if (!publisher_uid) {
        // return throwError(res, 'invalid publisher_uid')
    }
    next();
});
exports.validateUid = validateUid;
const readyToPlay = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { game_path, publisher_uid, user_uid } = req.params;
    if (!game_path) {
        return throwError(res, 'invalid game');
    }
    yield globals_1.dbs.Game.getTransaction((transaction) => __awaiter(void 0, void 0, void 0, function* () {
        const game = yield globals_1.dbs.Game.findOne({ pathname: game_path }, transaction);
        if (publisher_uid) {
            let publisherRecord = yield globals_1.dbs.Publisher.findOne({ uid: publisher_uid }, transaction);
            if (user_uid) {
            }
        }
        // @ts-ignore
        req.data = {
            game: {
                origin: '',
                url: game.url_game,
                title: game.title,
                frame_type: game.control_type
            },
            server: {
                url: opt_1.default.Url.DeployApiV1,
                token: '',
                shared_url: `${opt_1.default.Url.Host}/game/${game.pathname}/`,
            },
            publisher: {
                uid: publisher_uid || '',
            },
        };
    }));
    next();
});
exports.readyToPlay = readyToPlay;
const isAuthenticated = (req, res, next) => {
    if (!req.user) {
        return throwError(res, '^_^ㅗ');
    }
    next();
};
exports.isAuthenticated = isAuthenticated;
const getIdToken = (req) => {
    if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
        !(req.cookies && req.cookies.__session)) {
        logger_1.logger.debug('No Firebase ID token was passed as a Bearer token in the Authorization header.', 'Make sure you authorize your request by providing the following HTTP header:', 'Authorization: Bearer <Firebase ID Token>', 'or by passing a "__session" cookie.');
        // res.status(403).send('Unauthorized');
        return;
    }
    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        // console.log('Found "Authorization" header');
        // Read the ID Token from the Authorization header.
        idToken = req.headers.authorization.split('Bearer ')[1];
    }
    else if (req.cookies) {
        logger_1.logger.debug('Found "__session" cookie');
        // Read the ID Token from cookie.
        idToken = req.cookies.__session;
    }
    else {
        // No cookie
        // res.status(403).send('Unauthorized');
        return;
    }
    return idToken;
};
exports.getIdToken = getIdToken;
const validateFirebaseIdToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const idToken = exports.getIdToken(req);
        if (idToken) {
            req.user = yield admin.auth().verifyIdToken(idToken);
        }
        return next();
    }
    catch (error) {
        return throwError(res, 'Unauthorized', 403);
    }
});
exports.validateFirebaseIdToken = validateFirebaseIdToken;
const validateAdminIdToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const idToken = exports.getIdToken(req);
        req.user = yield utils_1.verifyJWT(idToken);
        return next();
    }
    catch (error) {
        return throwError(res, 'Unauthorized', 403);
    }
});
exports.validateAdminIdToken = validateAdminIdToken;
const adminTracking = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    globals_1.dbs.AdminLog.create({
        admin_id: req.user.id,
        path: req.route.path.substring('/api/v1/admin/'.length),
        body: JSON.stringify(req.body)
    });
    return next();
});
exports.adminTracking = adminTracking;
//# sourceMappingURL=_common.js.map