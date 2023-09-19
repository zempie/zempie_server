import * as _ from 'lodash';
import * as ws from 'ws';
import * as uniqid from 'uniqid';
import { Request } from 'express';
import { logger } from '../../commons/logger';



export class zWS extends ws {
    uid!: string;
    isAlive: boolean = false;
}


abstract class WSController {
    connected = (ws: zWS, req: Request) => {
        ws.uid = uniqid.time();
        ws.isAlive = true;
        ws.on('pong', () => {
            ws.isAlive = true;
        });
        ws.on('message', (_message: string) => {
            return this.onMessage(ws, _message);
        });

        ws.on('close', () => {
            logger.debug('onClosed');
            return this.onClosed(ws);
        });

        ws.on('error', () => {
            logger.debug('onError');
            return this.onPeerDisconnect(ws);
        });

        this.onConnected(ws,req);
    }


    //@ts-ignore
    protected abstract onConnected = (ws: zWS, req:Request): void => {}
    //@ts-ignore
    protected abstract onMessage = (ws: zWS, message: string): void => {};
    //@ts-ignore
    protected abstract onClosed = (ws: zWS): void => {};
    protected onPeerDisconnect = (ws: zWS) => {
        this.onClosed(ws);
    }
}

export default WSController
