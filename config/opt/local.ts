export default {
    Server: {
        http: {
            port: 9280,
        },
        ws: {
            port: 8280,
        },
        Secure: {
            // https: false,
            // port: 8281,
            // options: {
            //     key: fs.readFileSync('key.pem'),
            //     cert: fs.readFileSync('cert.pem')
            // },
        },
        studio: {
            port: 8281,
        },
        admin: {
            port: 8299,
        },
        content: {
            port: 8283,
        }
    },

    Url: {
        Host: 'http://192.168.0.196:8280',
        DeployApiV1: 'http://192.168.0.196:8288/api/v1',
        GameClient: 'http://localhost:8080/#/play',
        Redirect: 'http://localhost:8280/game',
        Launcher: 'http://launcher.zempie.com',
    },

    Deploy: {
        url_v1: 'http://192.168.0.196:8288/api/v1',
        api_key: 'xdo1lbgkc5xmxn2'
    },

    AWS: {
        Bucket: 'zemini/newz',
    },

    password: {
        salt : '@#FP)UVuOWJF)@#MJ',
        iteration: 100000
    },

    JWT: {
        access: {
            secret: 'JW@#MJ%Y^Y$U%@$I1f',
            options: {
                algorithm: 'HS256',
                expiresIn: '7d',
                issuer: 'from the red',
            }
        },
        refresh: {
            secret: '*I^H%$HG%#!@GF#%GH@',
            options: {
                algorithm : 'HS256',
                expiresIn : '30d',
                issuer    : 'from the red'
            },
        },
    },

    CORS: {
        allowedOrigin: [
            'http://gtest.fromthered.com',
            'http://zempie.fromthered.com',
        ],
        secure: false,
        domain: '.fromthered.com',
    },

    Kafka: {
        clientId: 'zempie',
        brokers: ['localhost:9092']
    },
}
