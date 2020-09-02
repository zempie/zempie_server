import { Request, Response, Router } from 'express';
import RpcController from '../controllers/rpcController';
import {validateFirebaseIdToken} from "./_common";
import FileManager from "../services/fileManager";
import convert from "../controllers/_convert";
import UserController from "../controllers/userController";
import StudioController  from '../controllers/studioController';


const apiVer = `/api/v1`;

export default (router: Router) => {
    // RpcController.generator('sign-out',         UserController.signOut, true);
    // RpcController.generator('set-user-info',    UserController.setInfo, true);
    // RpcController.generator('get-user-info',    UserController.getInfo, true);
    // RpcController.generator('get-target-info',  UserController.getTargetInfo, true);
    // RpcController.generator('get-search-user',  UserController.searchUser, true);
    // RpcController.generator('set-user-setting', UserController.updateSetting, true);
    // RpcController.generator('get-publishing',   UserController.getPublishing, true);
    // RpcController.generator('get-alarms',       AlarmController.getList, true);


    router.post(`${apiVer}/studio/version`,   validateFirebaseIdToken, FileManager.uploadImage, convert(StudioController.createVersion));
    router.post(`${apiVer}/studio/project`,   validateFirebaseIdToken, FileManager.uploadImage, convert(StudioController.updateProject));
    router.post(`${apiVer}/studio/developer`,   validateFirebaseIdToken, FileManager.uploadImage, convert(StudioController.updateDeveloper));

}


RpcController.generator('get-user-info',    UserController.getInfo, true);

RpcController.generator( 'get-developer', StudioController.getDeveloper, true );
RpcController.generator( 'create-developer', StudioController.createDeveloper, true );
RpcController.generator( 'set-developer', StudioController.updateDeveloper, true );

RpcController.generator( 'get-projects', StudioController.getProjects, true );
RpcController.generator( 'get-project', StudioController.getProject, true );
RpcController.generator( 'create-project', StudioController.createProject, true );
RpcController.generator( 'set-project', StudioController.updateProject, true );
RpcController.generator( 'delete-project', StudioController.deleteProject, true );

RpcController.generator( 'get-versions', StudioController.getVersions, true );
RpcController.generator( 'get-version', StudioController.getVersion, true );
RpcController.generator( 'create-version', StudioController.createVersion, true );
RpcController.generator( 'set-version', StudioController.updateVersion, true );

RpcController.generator( 'admin-get-versions', StudioController.adminGetVersions, true );
RpcController.generator( 'admin-get-version', StudioController.adminGetVersion, true );
RpcController.generator( 'admin-set-version', StudioController.adminSetVersion, true );


// RpcController.generator( 'delete-version', StudioController.deleteProject, true );
