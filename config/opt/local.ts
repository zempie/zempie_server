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
            port: 8281,
            // options: {
            //     key: fs.readFileSync('key.pem'),
            //     cert: fs.readFileSync('cert.pem')
            // },
        },
    },

    Url: {
        Host: 'http://192.168.0.196:8280',
        DeployApiV1: 'http://192.168.0.196:8288/api/v1',
    },

    Deploy: {
        url_v1: 'http://192.168.0.196:8288/api/v1',
        api_key: '5b94uen0k99mxn4t'
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
        }
    },
}
