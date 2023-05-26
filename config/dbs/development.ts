export default {
    mysql: {
        database: 'zempie',
        username: 'dev',
        password: 'ftred103',
        conn: {
            host: '61.73.7.153',
            port: 23306,
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
        host: '61.73.7.153',
        port: 6379,
        family: 4,
        password: 'ftred103',
        db: 0,
    }
}
