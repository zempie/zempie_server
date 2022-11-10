"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const { BigQuery } = require('@google-cloud/bigquery');
class BigQueryController {
    test() {
        return __awaiter(this, void 0, void 0, function* () {
            const bigqueryClient = new BigQuery({
                'projectId': 'workhistory'
            });
            // The SQL query to run
            const sqlQuery = `SELECT
        *
        FROM \`zempie.analytics_252255633.events_20211130\`
        LIMIT 10`;
            const options = {
                query: sqlQuery,
                // Location must match that of the dataset(s) referenced in the query.
                location: 'asia-northeast3',
            };
            // Run the query
            const [rows] = yield bigqueryClient.query(options);
            console.log('Query Results:');
            rows.forEach((row) => {
                const url = row['url'];
                const viewCount = row['event_name'];
                console.log(`url: ${url}, ${viewCount} views`);
            });
            return rows;
        });
    }
}
exports.default = new BigQueryController();
//# sourceMappingURL=bigQueryController.js.map