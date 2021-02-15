"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    mysql: {
        database: 'zempie',
        username: 'root',
        password: 'dlgustjr.123',
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
        password: '',
        db: 0,
    }
};
//# sourceMappingURL=local.js.map