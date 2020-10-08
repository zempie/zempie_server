import { Router } from 'express';
import RpcController from '../controllers/rpcController';
import LauncherController from '../controllers/launcherController';


export default (router: Router) => {

}


RpcController.generator('launcher-game',        LauncherController.getGame);
RpcController.generator('launcher-battle',      LauncherController.getBattleGame);
RpcController.generator('launcher-share',       LauncherController.getSharedGame);
