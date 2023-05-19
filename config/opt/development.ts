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
        Host: 'http://gtest.fromthered.com:8280',
        DeployApiV1: 'http://gtest.fromthered.com:8288/api/v1',
        GameClient: 'http://localhost:8080/play',
        Redirect: 'http://staging-zempie.s3-website.ap-northeast-2.amazonaws.com/redirect',
        Launcher: 'http://gtest.fromthered.com/zempie/launcher',
        LauncherRedirect: 'http://gtest.fromthered.com/zempie/launcher/redirect',
    },

    Deploy: {
        url_v1: 'http://gtest.fromthered.com:8288/api/v1',
        api_key: 'xdo1lbgkc5xmxn2'
    },

    AWS: {
        Bucket: {
            PublicBase:'dev-zempie',
            Rsc: 'dev-zempie/v1',
            RscPublic: 'dev-zempie/v1',
            Static: 'dev-zempie/static',
        },
        
    },

    password: {
        salt: '@#FP)UVuOWJF)@#MJ',
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
                algorithm: 'HS256',
                expiresIn: '30d',
                issuer: 'from the red'
            },
        }
    },

    CORS: {
        allowedOrigin: [
            'http://gtest.fromthered.com',
            'http://zempie.fromthered.com',
            'http://studio.fromthered.com',
            'http://launcher.fromthered.com',
            'http://staging-zempie.s3-website.ap-northeast-2.amazonaws.com',
            'http://3.38.27.85',
            'http://3.38.27.85:4000',
            'http://dev.zempie.com',
            'https://dev.zempie.com',
            
        ],
        secure: false,
        domain: '.fromthered.com',
    },

    Kafka: {
        clientId: 'zempie',
        brokers: ['localhost:9092']
    },
    PAYMENT: {
        BOOTPAY: {
            application_id: "645b509a3049c8001d9685ee",
            private_key: "RcUW6D6EVSdURCCckOpJckqkoO+01YJdfZwie2ufgW4="
        },
        google_api_service_account_json_key_file: {
            "type": "service_account",
            "project_id": "pc-api-6758046384663055718-556",
            "private_key_id": "f941006fc65af96ab4b07a2448a33efc0baffb73",
            "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCuvGFfsrvqDFZn\np4c8BT1q0m14+eNB+bwMsW7sSvP3GnH5ZqkFAvUoOZFaWWznD+qMF4t6TRwiVyW8\nrOYOskVOOYJkPYG2Sm5vxY8cpwMAeMDurZrKPHAV7doOgexgXrvsEzNJL3MAAOcI\n9x9V5drTsWFdPT+Rz9b4cNkg6pyxUVs/Q5sbES4Mc2XIWwkCC1E+NFGHiW1To90s\nLUAM+9KzqxonP923yeYXoUxIeWxouGgIf+jU894UbNWATP08zkgj0dQIVFUjuT2a\n1+0sp3bdh/FARAU6X5DUBOzbCglBsDuaLmRvpQcn7j2M/PXjo11GwLAUlLWeYtQ0\nyFLJDehTAgMBAAECggEAFq1xL8PZGoeOYTZ/WR1O+sGjnotD4MiiDL2saTNTFVNT\nzmvx7KoVGiraf/DSLuzEYnkdy3odeCF6TtHbq7WcRAo3r33CC1/+lDf+Glhcjd+e\nHnvednfAjkAHyFE5VcqFth5Jzio/0RTM5z93TCUgMNA5FCpCSVDBlA3FSD3apzJy\nM6ktvb5qrf3NVr5c37Krtmbt5VGsunw5IrWciN8Nk8EKw4KJIxkTP+/tfBaGZhYI\njZMIsix+E5n9yHT5JOADpBYtEK3xwzUljO9Xdbv8xjrMRKu08oDqdAGmOoj+9luC\nPftEdjw21OUfqFmI/Uuv9qXdyUlgyS1shfFZ32vaFQKBgQDoJci5vK4lO2h77PyR\n3vrJIFskTKjmYbu8Q68J/pkX92UcgJXiq5Yzcgs++/xl1dDaIZlZ5jM0XhRmyyZx\nCdZEdEV419ZduIt8Z4h0i0u61LkFb+5EapxXKd9nj7YyWsYV03Hdzzt5alvXlhpc\ntQGf+/5DO79ITcFijJ7345sDpwKBgQDAsHxyylRGCf0p62PlAi5U4ycTq06BIZVu\nIIdDa5jY9bZREQl2cjabXZIoFe9mLWaE7fDjj/uaSL2rzveTkArqYpuYq1ZjnfUD\nCahmQMo5gdSzNxNpyprZkEJRS0pnXNM5jRVFpQMVGo+/gduPa57TwA6iv4vZj7XI\nx7FzEmx7dQKBgQDArENpbKD4g9MXL7z8cJ2iejlK6lkwRKNlAKPxXp6/lnQT8OD1\nrUXPUvLkho2YE5rwv/wf8gBDkWXLXwZ7wRdV306dmj3vsTALw34shEQJP26Ehb6y\nh+1UJoulz0//gPlwufqChvGstsqdJpagpRZBKwt/z8HVh7teSKnTwdMxdwKBgQCD\nhnQL7quDe0IBIRl4sfpqGvsLY/0cC45yM2Xg0UrtnRqrTxPEc8VuW3puPjrA5fB6\nf+fTjO5Sq6A76/P2F3Y78r7+gMVhDeq1/huiYEso4cQL6GYp6g+0vdFmqBvLXgMX\n34NLnIz0FMNWFw+FYBJzuz7CPDj7cirFN/mZ8FN4GQKBgQCEL6nbonUOxKH5kPpr\nO6L335LbfpAEgjSXu7NS8ESykPJA7nf/Fpsdj+vCHO4BJ0E/rLxCi7zTjCkHkVd+\nIkxplFbQtOgdO0fFLYtn/csG+eX3ADhTiU0dJZWhMIlsPSdK/kIt+Hnjq3UTvtza\nmak9kvgCzqJm1ajo9mxBFYDG9g==\n-----END PRIVATE KEY-----\n",
            "client_email": "iap-145@pc-api-6758046384663055718-556.iam.gserviceaccount.com",
            "client_id": "114996140312185322461",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/iap-145%40pc-api-6758046384663055718-556.iam.gserviceaccount.com",
            "universe_domain": "googleapis.com"
        }
    },    
}
