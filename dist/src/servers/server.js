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
const _ = require("lodash");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const ejs = require("ejs");
const getPort = require("get-port");
const admin = require("firebase-admin");
const globals_1 = require("../commons/globals");
const mysql_1 = require("../database/mysql");
const redis_1 = require("../database/redis");
const Pkg = require("../../package.json");
const sequelize_1 = require("sequelize");
const globals_2 = require("../commons/globals");
const opt_1 = require("../../config/opt");
const { CORS } = opt_1.default;
const rpcController_1 = require("../controllers/rpcController");
// graph-ql
const graphql_1 = require("graphql");
const graphqlHTTP = require("express-graphql");
// const { generateSchema } = require('sequelize-graphql-schema')();
// swagger
const swaggerUi = require("swagger-ui-express");
const swaggerDef_1 = require("./swaggerDef");
// colors
const colors = require("colors");
const logger_1 = require("../commons/logger");
const messageQueueService_1 = require("../services/messageQueueService");
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
class Server {
    constructor() {
        this.initialize = (options) => __awaiter(this, void 0, void 0, function* () {
            this.options = options;
            // this.setFirebase();
            // this.setDeployApp();
            //
            this.setExpress(options);
            //
            // await Server.setRDB();
            //
            // // this.setEJS();
            // this.setSwagger();
            // this.setGraphQL();
            // if ( !!this.app ) {
            //     this.routes(this.app);
            // }
        });
        this.initialize2 = (options) => __awaiter(this, void 0, void 0, function* () {
            this.options = options;
            options.firebase && this.setFirebase();
            this.setExpress(options);
            options.rdb && (yield this.setRDB());
            options.mdb && (yield this.setMDB());
            options.ejs && this.setEJS();
            options.swagger && this.setSwagger();
            options.graphql && this.setGraphQL();
        });
        this.start = () => __awaiter(this, void 0, void 0, function* () {
            yield this.beforeStart();
            const port = yield getPort({ port: getPort.makeRange(this.options.port, this.options.port + 100) });
            const errorCallback = (err) => {
                if (err) {
                    console.error(err.stack);
                    return;
                }
                logger_1.logger.info(`Api Server [ver.${Pkg.version}] has started. (port: ${port})`.cyan.bold);
            };
            if (!!this.app) {
                this.app.listen(port, errorCallback);
            }
            yield this.afterStart();
        });
        this.beforeStart = () => __awaiter(this, void 0, void 0, function* () {
        });
        this.afterStart = () => __awaiter(this, void 0, void 0, function* () {
            //
        });
    }
    setEJS() {
        if (!!this.app) {
            this.app.set('views', path.join(__dirname, '..', '..', '/views'));
            this.app.set('view engine', 'ejs');
            this.app.engine('html', ejs.renderFile);
        }
    }
    setSwagger() {
        if (!!this.app && process.env.NODE_ENV !== 'production') {
            const options = {
            // explorer: true
            };
            this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDef_1.default, options));
        }
    }
    setGraphQL() {
        if (!!this.app) {
            const models = {};
            _.forEach(globals_2.dbs, (db) => {
                models[db.name] = db.model;
            });
            const { generateSchema } = require('sequelize-graphql-schema')();
            models.Sequelize = sequelize_1.Sequelize;
            const schema = generateSchema(models);
            const hooker = (req, res, next) => {
                next();
            };
            this.app.use('/graphql', hooker, graphqlHTTP({
                schema: new graphql_1.GraphQLSchema(schema),
                graphiql: true
            }));
        }
    }
    setFirebase() {
        const serviceAccount = require('../../config/firebase/service-account.json');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: 'https://zempie.firebaseio.com'
        });
        globals_1.firebase.admin = admin;
    }
    setDeployApp() {
        // const da = deployApp.initialize({
        //     type: 'service_account',
        //     project_id: 1,
        //     api_key: '5b94uen0k99mxn4t',
        // })
    }
    setMessageQueue(options) {
        return __awaiter(this, void 0, void 0, function* () {
            // await Producer.connect()
            // await Consumer.connect(options.groupId, options.autoCommit, options.onMessage)
            // Consumer.addTopic(options.addTopics);
            yield messageQueueService_1.default.initialize(options.groupId);
            yield messageQueueService_1.default.addTopics(options.addTopics);
            yield messageQueueService_1.default.run(options.eachMessage);
        });
    }
    setExpress(options) {
        this.app = express();
        if (this.app) {
            if (!!options.static_path && options.static_path instanceof Array) {
                options.static_path.forEach((obj) => {
                    if (this.app) {
                        this.app.use(obj.path, express.static(obj.route));
                    }
                });
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
            this.app.use(cors({ credentials: true, origin: CORS.allowedOrigin }));
            this.app.use(bodyParser.json());
            this.app.use(bodyParser.urlencoded({ extended: false }));
            this.routes(this.app);
        }
    }
    setRDB() {
        return __awaiter(this, void 0, void 0, function* () {
            yield mysql_1.default.initialize();
        });
    }
    setMDB() {
        return __awaiter(this, void 0, void 0, function* () {
            yield redis_1.default.initialize();
        });
    }
    routes(app) {
        app.use((req, res, next) => {
            // req.dbs = MySql.getDBS();
            next();
        });
        app.get('/test', (req, res) => {
            res.send('hi');
        });
        const apiVer = '/api/v1';
        app.post(`${apiVer}/rpc`, rpcController_1.default.routeRpc);
    }
}
exports.default = Server;
//# sourceMappingURL=server.js.map