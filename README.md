# zempie_server
node.js express 로 구현되어있습니다.

npm으로 install 해주시면됩니다.


config/dbs/local.ts

```
export default {
    mysql: {
        database: 'zempie',
        username: 'root',
        password: '123',
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


