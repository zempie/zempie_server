- npm install -force로 패키지 다운해주세요

- 빌드가 되지 않는 경우 sequelize version support issue가 있을 수 있으므로 버전은 4.7.4로 맞춰주세요

- mariadb 10.4.21

- config/dbs, config/opt 에 local.ts 생성

```
//config/dbs/local.ts
export default {
    mysql: {
        database: 로컬 디비이름('zempie'),
        username: 로컬디비 유저이름,
        password: 로컬디비 비밀번호,
        conn: {
            host: '127.0.0.1',
            port: 3306,
            dialect: 'mysql',
            pool: {
                max: 5,
                min: 0,
                idle: 10000
            },
            // operatorsAliases: {},
            dialectOptions: {
                multipleStatements: true
            },
            // underscored: true
            define: {
                underscored: true,
                freezeTableName: false,
                createdAt: "created_at",
                updatedAt: "updated_at",
                deletedAt: "deleted_at"
            }
        },
    },
    redis: {
        host: 'localhost',
        port: 6379,
        family: 4,
        password: '',
        db: 0,
    }
}

```

```
//config/opt/local.ts
export default {
    Server: {
        http: {
            port: 8280,
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
        Host: 'http://아이피:8280',
        DeployApiV1: 'http://아이피:8288/api/v1',
        GameClient: 'http://아이피:8080/play',
        Redirect: 'http://아이피:8280',
        Launcher: 'http://아이피:8080',
    },

    Deploy: {
        url_v1: 'http://아이피:8288/api/v1',
        api_key: 'xdo1lbgkc5xmxn2'
    },

    AWS: {
        // Bucket: 'dev-zempie/v1',
        Bucket: {
            PublicBase:'dev-zempie',
            Rsc: 'dev-zempie/v1',
            RscPublic: 'dev-zempie/v1',
            Static: 'dev-zempie/static',
        }
    },

    password: {
        salt: '@#FP)UVuOWJF)@#MJ',
        iteration: 100000
    },

    JWT: {
        access: {
            secret: 'jLU@Y#R*LIEJlkf24old',
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
        },
    },

    CORS: {
        allowedOrigin: [
            'http://192.168.0.200:8082',
            'http://gtest.fromthered.com',
            'http://zempie.fromthered.com',
            'http://localhost:8080',
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:8082',
            'http://192.168.0.11:3000'
        ],
        secure: false,
        domain: 'localhost',
    },

    Kafka: {
        clientId: 'zempie',
        brokers: [
            'localhost:9092',
        ]
    },
}

```



- 빌드 후 
  * start : 젬파이 커뮤니티 및 유저 정보 호출 서버 
  * startStudio: 스튜디오 실행 서버
  * startAdmin : 어드민 실행 서버

---
참고사항 
=======
 * 접속시 :  
    * VScode 로 빌드하지 말 것!
    * 반드시 ssh로 접속할 것!
        ```
        ssh -i C:\Users\hongd\.ssh\zempie_community.pem ec2-user@3.38.27.85
        ```
 


