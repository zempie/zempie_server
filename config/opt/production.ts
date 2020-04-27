export default {
    Server: {
        http: {
            port: 8288,
        },
        ws: {
            port: 8288,
        },
        Secure: {
            https: false,
            port: 8289,
            // options: {
            //     key: fs.readFileSync('key.pem'),
            //     cert: fs.readFileSync('cert.pem')
            // },
        },
    },

    AWS: {
        Bucket: 'zemini',
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
}