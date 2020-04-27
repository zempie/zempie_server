import * as _ from 'lodash';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as path from 'path';
import * as fs from 'fs';
import * as ejs from 'ejs';
import * as getPort from 'get-port';

import * as admin from 'firebase-admin';
import { firebase } from '../commons/globals';

import MySql from '../database/mysql';
import { IServerOptions } from '../commons/interfaces';
import * as Pkg from '../../package.json';
import deployApp from "../services/deployApp";

// graph-ql
import { GraphQLSchema } from 'graphql';
import * as graphqlHTTP from 'express-graphql';
import { Sequelize } from 'sequelize';
import { dbs } from '../commons/globals';
import { Response } from 'express';
import cfgOption from '../../config/opt';

// swagger
import * as swaggerUi from 'swagger-ui-express'
import swaggerDef from './swaggerDef';

// colors
import * as colors from 'colors';
colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});


export default class Server {

    private app?: express.Application;
    private wss: any;



    public async initialize(options : IServerOptions) {

        this.setFirebase();
        this.setDeployApp();

        this.setExpress(options);

        await Server.setRDB();

        // this.setEJS();
        this.setSwagger();
        this.setGraphQL();
        
        if ( !!this.app ) {
            this.routes(this.app);
        }
    }


    protected setEJS() {
        if ( !!this.app ) {
            this.app.set('views', path.join(__dirname, '..', '..', '/views'));
            this.app.set('view engine', 'ejs');
            this.app.engine('html', ejs.renderFile);
        }
    }


    protected setSwagger() {
        if ( !!this.app && process.env.NODE_ENV !== 'production' ) {
            const options = {
                // explorer: true
            };
            this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDef, options));
        }
    }


    protected setGraphQL() {
        if ( !!this.app ) {
            const models: any = {};
            _.forEach(dbs, (db: any) => {
                models[db.name] = db.model;
            });
            const { generateSchema } = require('sequelize-graphql-schema')();

            models.Sequelize = Sequelize;
            const schema = generateSchema(models);
            const hooker: any = (req: Request, res: Response, next: any) => {
                next();
            };
            this.app.use('/graphql', hooker, graphqlHTTP({
                schema: new GraphQLSchema(schema),
                graphiql: true
            }));
        }
    }


    protected setFirebase() {
        const serviceAccount = require('../../config/firebase/service-account.json');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: 'https://zemini.firebaseio.com'
        });

        firebase.admin = admin;
    }

    protected setDeployApp() {
        // const da = deployApp.initialize({
        //     type: 'service_account',
        //     project_id: 1,
        //     api_key: '5b94uen0k99mxn4t',
        // })
    }



    private setExpress(options : IServerOptions) : void {
        this.app = express();
        if( this.app ) {
            if( !!options.static_path && options.static_path instanceof Array ) {
                options.static_path.forEach((obj: any) => {
                    if( this.app ) {
                        this.app.use(obj.path, express.static(obj.route));
                    }
                })
            }

            // const whiteList: any = ['http://localhost:8444'];
            // const corsOptions: any = {
            //     origin: (origin: any, callback: Function) => {
            //         if ( whiteList.indexOf(origin) !== -1 ) {
            //             callback(null, true);
            //         }
            //         else {
            //             callback(new Error('not allowed by CORS'))
            //         }
            //     },
            //     // origin: 'http://localhost:8443'
            // };

            this.app.use(cors());
            this.app.use(bodyParser.json());
            this.app.use(bodyParser.urlencoded({extended:false}));
        }
    }



    private static async setRDB() {
        await MySql.initialize();
        console.log('completed rdb');
    }



    protected routes(app: express.Router) {
        app.use((req, res, next) => {
            // req.dbs = MySql.getDBS();
            next();
        });

        app.get('/test', (req, res) => {
            res.send('hi');
        });
    }



    public async start(srvOpt : IServerOptions, _port : number = cfgOption.Server.http.port) : Promise<void> {
        await this.beforeStart();

        const port = await getPort({ port: getPort.makeRange(_port, _port+100)});
        const errorCallback: any = (err: Error) => {
            if( err ) {
                console.error(err.stack);
                return
            }

            // @ts-ignore
            console.log(`Api Server [ver.${Pkg.version}] has started. (port: ${port})`.info.bold);
        };

        if ( !!this.app ) {
            this.app.listen(port, errorCallback);
        }

        await this.afterStart();
    }

    protected async beforeStart() {

    }
    protected async afterStart() {

    }
}