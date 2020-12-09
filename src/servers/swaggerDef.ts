import * as swaggerJSDoc from 'swagger-jsdoc'

const swaggerDefinition = {
    swagger: '2.0',
    info: {
        title: 'Zempie APIs',
        version: '1.0.0',
        description: '이거슨 쩸파이 API들이닷',
        termsOfService: '',
        contact: {
            email: 'jw.park@fromthered.com',
        },
        license: {
            name: 'Apache 2.0',
            url: 'http://www.apache.org/licenses/LICENSE-2.0.html',
        }
    },
    host: 'localhost:8280',
    basePath: '/api/v1',
    // basePath: '/',
    schemes: ['http', 'https'],
    securityDefinitions: {
        token: {
            type: 'apiKey',
            in: 'header',
            name: 'Authorization',
        },
        // 'Firebase idToken': {
        //     type: 'apiKey',
        //     name: 'Authorization',
        //     in: 'header'
        // },
        // petstore_auth: {
        //     type: 'oauth2',
        //     authorizationUrl: 'http://',
        //     flow: 'implicit',
        //     scopes: {
        //         'write:pets': "modify pets in your account",
        //         'read:pets': "read your pets"
        //     }
        // }
    },
    externalDocs: {
        description: 'Find out more about swagger',
        url: 'http://swagger.io'
    }
};

const options = {
    swaggerDefinition,
    apis: [ './swagger/*.yaml' ]
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec
