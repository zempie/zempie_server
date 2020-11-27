"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerDefinition = {
    swagger: '2.0',
    info: {
        title: 'Deploy',
        version: '0.1.1',
        description: 'for Testing',
        termsOfService: '',
        contact: {
            email: 'jw.park@fromthered.com',
        },
        license: {
            name: 'none',
            url: '',
        }
    },
    // host: 'localhost:22525',
    // basePath: '/api/v1',
    basePath: '/',
    schemes: ['http', 'https'],
    securityDefinitions: {
        token: {
            type: 'apiKey',
            in: 'header',
            name: 'Authorization',
        },
    },
    externalDocs: {
        description: 'Find out more about swagger',
        url: 'http://swagger.io'
    }
};
const options = {
    swaggerDefinition,
    apis: ['./swagger/*.yaml']
};
const swaggerSpec = swaggerJSDoc(options);
exports.default = swaggerSpec;
//# sourceMappingURL=swaggerDef.js.map