import { Request, Response } from "express";
import { IRpcMethod, IRpcBody, IRpcError } from "./_interfaces";
import { CreateError, ErrorCodes } from "../commons/errorCodes";
import * as admin from "firebase-admin";
import { KafkaService } from '../services/kafkaService';


class RpcController {
    private methods: {[key: string]: IRpcMethod} = {};
    private producer?: KafkaService.Producer;

    setMQ = (producer: KafkaService.Producer) => {
        this.producer = producer;
    }

    generator = (name: string, method: Function, auth: boolean = false) => {
        this.methods[name] = { auth, method };
    }

    routeRpc = async (req: Request, res: Response) => {
        const data: IRpcBody = req.body;
        let error: IRpcError;

        if( data.jsonrpc !== '2.0' ) {
            return onError({
                code: -32600,
                message: 'Bad Request. JSON RPC version is invalid or missing',
                data: null
            }, 400);
        }

        res.header({
            'Content-Type': 'application/json',
            'Last-Modified': (new Date()).toUTCString()
        });

        try {
            const rpcMethod = this.methods[data.method];
            if ( !rpcMethod ) {
                return onError({
                    code: -32601,
                    message: 'Method not found: ' + data.method,
                    data: null
                }, 404);
            }

            // if ok
            let user = await this.validateFirebaseIdToken(req);
            if ( rpcMethod.auth && !user ) {
                const e: any = CreateError(ErrorCodes.UNAUTHORIZED);
                return onFailure({
                    code: -32603,
                    message: e.message,
                    data: e
                });
            }

            const result = await rpcMethod.method(data.params, user, { producer: this.producer });
            return onSuccess(result);
        }
        catch( e ) {
            return onError({
                code: -32601,
                message: e.message,
                data: null
            }, 404);
        }


        function onSuccess(result: any) {
            res.status(200).send({
                jsonrpc: '2.0',
                result,
                error,
                id: data.id,
            })
        }

        function onFailure(error: IRpcError) {
            onError(error, 500);
        }

        function onError(error: IRpcError, statusCode: number) {
            res.status(statusCode).send({
                jsonrpc: '2.0',
                error,
                id: data.id,
            });
        }
    }

    private validateFirebaseIdToken = async (req: Request) => {
        let authorization;
        if( typeof req.body.params === "object" ) {
            authorization = req.body.params.authorization;
        }
        else {
            authorization = JSON.parse(req.body.params).authorization;
        }

        if ((!authorization || !authorization.startsWith('Bearer ')) && !(req.cookies && req.cookies.__session)) {
            console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
                'Make sure you authorize your request by providing the following HTTP header:',
                'Authorization: Bearer <Firebase ID Token>',
                'or by passing a "__session" cookie.');
            // throw CreateError(ErrorCodes.UNAUTHORIZED);
            return null
        }

        let idToken;
        if (authorization && authorization.startsWith('Bearer ')) {
            // console.log('Found "Authorization" header');
            // Read the ID Token from the Authorization header.
            idToken = authorization.split('Bearer ')[1];
        } else if(req.cookies) {
            console.log('Found "__session" cookie');
            // Read the ID Token from cookie.
            idToken = req.cookies.__session;
        } else {
            // No cookie
            // throw CreateError(ErrorCodes.UNAUTHORIZED);
            return null
        }

        try {
            const decodedIdToken = await admin.auth().verifyIdToken(idToken);
            // console.log('ID Token correctly decoded', decodedIdToken);
            return decodedIdToken;
        } catch (error) {
            console.error('Error while verifying Firebase ID token:', error);
            // throw CreateError(ErrorCodes.UNAUTHORIZED);
            return null
        }
    }
}

export default new RpcController()
