export default {
    Server: {
        http: {
            port: 8280,
        },
        ws: {
            port: 8280,
        },
        Secure: {
            https: false,
            port: 8289,
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
    },

    AWS: {
        Bucket: 'zempie-rsc/v1',
    },

    password: {
        salt : '@#FE)UFIOWJF)@#J',
        iteration: 100000
    },

    JWT: {
        access: {
            secret: 'ASDF#%Y^Y$U%@$I1f',
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
        }
    },

    CORS: {
        allowedOrigin: [
            'http://www.zempie.com', 'https://www.zempie.com',
            'http://launcher.zempie.com', 'https://launcher.zempie.com',
            'http://studio.zempie.com', 'https://studio.zempie.com',
            'http://support.zempie.com', 'https://support.zempie.com',
        ],
        secure: false,
        domain: '.zempie.com',
    },

    Kafka: {
        clientId: 'zempie',
        brokers: ['localhost:9092']
    },
}
