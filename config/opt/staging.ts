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
