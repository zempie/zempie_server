export default {
    mysql: {
        database: 'platform',
        username: 'loki',
        password: 'wjddnjs',
        conn: {
            host: '192.168.0.10',
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
        host: '192.168.0.10',
        port: 16379,
        family: 4,
        password: 'fromthered2020#!',
        db: 0,
    }
}