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
const path = require("path");
const logger_1 = require("../../commons/logger");
const sequelize_1 = require("sequelize");
const globals_1 = require("../../commons/globals");
const model_1 = require("./model");
const utils_1 = require("../../commons/utils");
const dbs_1 = require("../../../config/dbs");
const mysqlOpt = dbs_1.default.mysql;
const MYSQL = require('mysql2/promise');
class MySql {
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const connection = yield MYSQL.createConnection({
                    host: mysqlOpt.conn.host,
                    port: mysqlOpt.conn.port,
                    user: mysqlOpt.username,
                    password: mysqlOpt.password,
                });
                yield connection.execute(`CREATE DATABASE IF NOT EXISTS ${mysqlOpt.database} CHARACTER SET utf8 COLLATE utf8_general_ci;`);
                this.db = new sequelize_1.Sequelize(mysqlOpt.database, mysqlOpt.username, mysqlOpt.password, Object.assign(Object.assign({}, mysqlOpt.conn), { logging: msg => logger_1.logger.debug(msg) }));
                yield this.db.authenticate();
                yield this.syncDefine();
                logger_1.logger.info('mysql is ready.'.cyan);
            }
            catch (e) {
                console.error(e.stack);
            }
        });
    }
    syncDefine() {
        return __awaiter(this, void 0, void 0, function* () {
            const models = {};
            const dir = path.join(__dirname, '/models/');
            utils_1.getFiles(dir, (dir, file) => {
                if (!!this.db) {
                    const model = this.db.import(path.join(dir, file));
                    models[utils_1.capitalize(model.getName())] = model;
                }
            });
            if (!!this.db) {
                yield this.db.sync();
            }
            // @ts-ignore
            globals_1.dbs = Object.assign(globals_1.dbs, models);
            for (const i in globals_1.dbs) {
                if (globals_1.dbs.hasOwnProperty(i)) {
                    const db = globals_1.dbs[i];
                    if (db instanceof model_1.default) {
                        yield db.afterSync();
                    }
                }
            }
        });
    }
}
exports.default = new MySql();
// function getFiles(dir: string, callback: Function) {
//     fs.readdirSync(dir)
//         .filter((file) => {
//             return ( file.indexOf('_') !== 0 && file.indexOf('.ts') < 0 && file.indexOf('.js.map') < 0 );
//         })
//         .forEach((file) => {
//             const name = path.join(dir, file);
//             if( fs.statSync(name).isDirectory() ) {
//                 return getFiles(name, callback);
//             }
//             else {
//                 callback(dir, file);
//             }
//         });
// }
//# sourceMappingURL=index.js.map