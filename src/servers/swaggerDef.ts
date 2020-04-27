import * as swaggerJSDoc from 'swagger-jsdoc'

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