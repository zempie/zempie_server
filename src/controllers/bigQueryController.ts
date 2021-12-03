const {BigQuery} = require('@google-cloud/bigquery');

class BigQueryController {

    async test() {
        const bigqueryClient = new BigQuery({
            'projectId':'workhistory'
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
        const [rows] = await bigqueryClient.query(options);

        console.log('Query Results:');
        rows.forEach((row: any) => {
            const url = row['url'];
            const viewCount = row['event_name'];
            console.log(`url: ${url}, ${viewCount} views`);
        });

        return rows;


    }

}

export default new BigQueryController()