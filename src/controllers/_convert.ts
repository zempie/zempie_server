import * as express from 'express';
import * as _ from 'lodash';



export default function convert(func: Function) {

    function response(res: express.Response, result: any) {
        res.setHeader('Last-Modified', (new Date()).toUTCString());

        if( result instanceof Error ) {
            return res.status(400).send({
                // data: result,
                error: result.message,
            });
        }

        return res.status(200).send({
            data: result || {}
        });
    }

    return async (req: any, res: express.Response) => {
        try {
            const params = _.assignIn({}, req.body, req.query, req.params);
            const user = _.assignIn({}, req.user);
            const result = await func(params, user, req.openedFiles);
            response(res, result);
        }
        catch(e) {
            response(res, e);
        }
    }
}