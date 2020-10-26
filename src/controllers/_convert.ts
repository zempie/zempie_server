import { Response } from 'express';
import * as _ from 'lodash';
import { IUser } from './_interfaces';



export default function convert(func: Function, middleware: boolean = false) {
    function response(res: Response, result: any) {
        res.header('Last-Modified', (new Date()).toUTCString());

        if( result instanceof Error ) {
            return res.status(400).send({
                // data: result,
                error: result.message,
            });
        }

        return res.status(200).send({
            result: result || {}
        });
    }

    return async (req: any, res: Response, next: Function) => {
        try {
            const params = _.assignIn({}, req.body, req.query, req.params);
            const user: IUser = _.assignIn({}, req.user);
            const result = await func(params, user, req.files);
            if ( middleware ) {
                return next();
            }
            response(res, result);
        }
        catch(e) {
            response(res, e);
        }
    }
}
