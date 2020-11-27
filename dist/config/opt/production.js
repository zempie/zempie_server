"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
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
        },
        studio: {
            port: 8281,
        },
        admin: {
            port: 8299,
        },
    },
    Url: {
        Host: 'https://zempie.com',
        GameClient: 'http://zempie.com/#/play',
        Redirect: 'https://zempie.com/share',
        Launcher: 'https://launcher.zempie.com/#',
    },
    AWS: {
        Bucket: 'zempie-rsc/v1',
    },
    password: {
        salt: '@#FE)UFIOWJF)@#J',
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
                algorithm: 'HS256',
                expiresIn: '30d',
                issuer: 'from the red'
            },
        }
    },
    CORS: {
        allowedOrigin: [
            'http://zempie.com', 'https://zempie.com',
            'http://launcher.zempie.com', 'https://launcher.zempie.com',
            'http://studio.zempie.com', 'https://studio.zempie.com',
            'http://support.zempie.com', 'https://support.zempie.com',
            'http://admin.zempie.com', 'https://admin.zempie.com',
        ],
        secure: false,
        domain: '.zempie.com',
    },
    Kafka: {
        clientId: 'zempie',
        brokers: ['localhost:9092']
    },
};
//# sourceMappingURL=production.js.map