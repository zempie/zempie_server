import * as fs from "fs";
import * as path from 'path';
// import * as MYSQL from 'mysql';
const MYSQL = require('mysql2/promise');
import { Sequelize } from 'sequelize';
import { dbs } from "../../commons/globals";
import Model from './model';
import { capitalize } from '../../commons/utils';
import cfgDbs from '../../../config/dbs';
const DBCfg = cfgDbs.mysql;


class MySql {
    private db: Sequelize | undefined;

    public async initialize() {
        try {
            const connection = await MYSQL.createConnection({
                host:       DBCfg.conn.host,
                port:       DBCfg.conn.port,
                user:       DBCfg.username,
                password:   DBCfg.password,
            });

            // await connection.query(`CREATE DATABASE IF NOT EXISTS ${DBCfg.database} CHARACTER SET utf8 COLLATE utf8_general_ci;`);
            await connection.execute(`CREATE DATABASE IF NOT EXISTS ${DBCfg.database} CHARACTER SET utf8 COLLATE utf8_general_ci;`);

            this.db = new Sequelize(DBCfg.database, DBCfg.username, DBCfg.password, DBCfg.conn);

            await this.db.authenticate();
            await this.syncDefine();
        }
        catch (e) {
            console.error(e.stack);
        }
    }


    private async syncDefine() {
        const models: any = {};
        const dir = path.join(__dirname, '/models/');

        getFiles(dir, (dir: string, file: string) => {
            const seq = this.db;
            if ( !!seq ) {
                const model: any = seq.import(path.join(dir, file));
                models[capitalize(model.getName())] = model;
            }
        });

        if ( !!this.db ) {
            await this.db.sync();
        }

        // @ts-ignore
        dbs = Object.assign(dbs, models);

        for( const i in dbs) {
            if( dbs.hasOwnProperty(i) ) {
                const db = dbs[i];
                if( db instanceof Model ) {
                    await db.afterSync();
                }
            }
        }

        // @ts-ignore
        console.log(`[${DBCfg.conn.dialect}] connected.`.verbose);
    }

}


export default new MySql();


function getFiles(dir: string, callback: Function) {
    fs.readdirSync(dir)
        .filter((file) => {
            return ( file.indexOf('_') !== 0 && file.indexOf('.ts') < 0 && file.indexOf('.js.map') < 0 );
        })
        .forEach((file) => {
            const name = path.join(dir, file);
            if( fs.statSync(name).isDirectory() ) {
                return getFiles(name, callback);
            }
            else {
                callback(dir, file);
            }
        });
}
