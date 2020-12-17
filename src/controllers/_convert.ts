import { NextFunction, Response } from 'express';
import * as _ from 'lodash';



export const responseError = (res: Response, error: Error) => {
    res.status(400).send({
        error: error.message
    })
};

export default function convert(func: Function, middleware: boolean = false) {
    function response(res: Response, result: any) {
        res.header('Last-Modified', (new Date()).toUTCString());

        if( result instanceof Error ) {
            return responseError(res, result);
        }

        return res.status(200).send({
            result: result || {}
        });
    }

    return async (req: any, res: Response, next: NextFunction) => {
        try {
            const params = _.assignIn({}, req.body, req.query, req.params);
            // const user = req.user? _.assignIn({}, req.user) : null
            const result = await func(params, req.user, { req, res });
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
