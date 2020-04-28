export default {
    mysql: {
        database: 'platform',
        username: 'loki',
        password: 'wjddnjs',
        conn: {
            host: 'localhost',
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
        password: null,
        db: 0,
    }
}