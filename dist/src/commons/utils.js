"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContentType = exports.afterHours = exports.Yesterday = exports.Today = exports.expiresIn = exports.getFiles = exports.updateZempieClaims = exports.verifyJWT = exports.signJWT = exports.verifyPassword = exports.makePassword = exports.parseBoolean = exports.capitalize = void 0;
const fs = require("fs");
const crypto = require("crypto");
const opt_1 = require("../../config/opt");
const jwt = require("jsonwebtoken");
const firebase_admin_1 = require("firebase-admin");
const path = require('path');
/**
 * capitalize
 */
function capitalize(str, lowercaseRest = false) {
    function makeString(object) {
        if (object == null)
            return '';
        return '' + object;
    }
    str = makeString(str);
    const remainingChars = !lowercaseRest ? str.slice(1) : str.slice(1).toLowerCase();
    return str.charAt(0).toUpperCase() + remainingChars;
}
exports.capitalize = capitalize;
/**
 *
 */
function parseBoolean(str) {
    str = str.toLowerCase();
    if (str === '1')
        return true;
    else if (str === 'true')
        return true;
    return false;
}
exports.parseBoolean = parseBoolean;
/**
 * Password - pbkdf2
 */
function makePassword(password) {
    const opt = opt_1.default.password;
    return crypto.pbkdf2Sync(password, opt.salt, opt.iteration, 64, 'sha512').toString('hex');
}
exports.makePassword = makePassword;
function verifyPassword(password, digest) {
    return digest === makePassword(password);
}
exports.verifyPassword = verifyPassword;
/**
 * JWT
 */
function signJWT(payload, expiresIn) {
    const { secret, options } = opt_1.default.JWT.access;
    options.expiresIn = expiresIn || options.expiresIn;
    return jwt.sign(payload, secret, options);
}
exports.signJWT = signJWT;
function verifyJWT(token) {
    const { secret } = opt_1.default.JWT.access;
    return jwt.verify(token, secret);
}
exports.verifyJWT = verifyJWT;
function updateZempieClaims(user, claims) {
    return firebase_admin_1.default.auth().setCustomUserClaims(user.uid, {
        zempie: Object.assign(Object.assign({}, user.zempie), claims)
    });
}
exports.updateZempieClaims = updateZempieClaims;
/**
 * get files
 */
function getFiles(dir, callback) {
    fs.readdirSync(dir)
        .filter((file) => {
        return (file.indexOf('_') !== 0 && file.indexOf('.ts') < 0 && file.indexOf('.js.map') < 0);
    })
        .forEach((file) => {
        const name = path.join(dir, file);
        if (fs.statSync(name).isDirectory()) {
            return getFiles(name, callback);
        }
        else {
            callback(dir, file);
        }
    });
}
exports.getFiles = getFiles;
/*
    expires
 */
function expiresIn(from, expires_in) {
    let t;
    const w = expires_in[expires_in.length - 1];
    if (w === 'd') {
        t = 1000 * 60 * 60 * 24;
    }
}
exports.expiresIn = expiresIn;
/*
    Date
 */
function Today(hour = 0, minutes = 0, seconds = 0, milliseconds = 0) {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minutes, milliseconds);
}
exports.Today = Today;
function Yesterday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
}
exports.Yesterday = Yesterday;
function afterHours(hour) {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + hour);
}
exports.afterHours = afterHours;
function getContentType(file) {
    const ext = path.extname(file);
    if (ext.includes('.html')) {
        return 'text/html';
    }
    else if (ext.includes('.js')) {
        return 'text/javascript';
    }
    else if (ext.includes('.json')) {
        return 'application/json';
    }
    else if (ext.includes('.css')) {
        return 'text/css';
    }
    else if (ext.includes('.jpg')) {
        return 'image/jpeg';
    }
    else if (ext.includes('.png')) {
        return 'image/png';
    }
    else if (ext.includes('.webp')) {
        return 'image/webp';
    }
    else if (ext.includes('.m4a')) {
        return 'audio/x-m4a';
    }
    else if (ext.includes('.mp4')) {
        return 'video/mp4';
    }
    else {
        return undefined;
    }
}
exports.getContentType = getContentType;
//# sourceMappingURL=utils.js.map