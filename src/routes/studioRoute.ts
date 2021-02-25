import { Request, Response, Router } from 'express';
import RpcController from '../controllers/rpcController';
import { isAuthenticated, isDeveloper, validateFirebaseIdToken } from './_common';
import FileManager from "../services/fileManager";
import convert from "../controllers/_convert";
import UserController from "../controllers/user/userController";
import StudioController  from '../controllers/studio/studioController';
import AdminStudioController from '../controllers/adminController/adminStudioController';


const apiVer = `/api/v1`;

export default (router: Router) => {
    // router.post(`${apiVer}/studio/developer`,   validateFirebaseIdToken, FileManager.uploadImage, convert(StudioController.createDeveloper));
    // router.patch(`${apiVer}/studio/developer`,    validateFirebaseIdToken, FileManager.uploadImage, convert(StudioController.updateDeveloper));
    // router.get( `${apiVer}/studio/developer`, validateFirebaseIdToken, convert(StudioController.getDeveloper) );

    router.post(`${apiVer}/studio/developer`,    validateFirebaseIdToken,   isAuthenticated,    convert(StudioController.signupDeveloper));

    router.post(`${apiVer}/studio/project`,     validateFirebaseIdToken,    isAuthenticated,    isDeveloper,    FileManager.uploadImage, convert(StudioController.createProject));
    router.get( `${apiVer}/studio/project`,     validateFirebaseIdToken,    isAuthenticated,    convert(StudioController.getProjects));
    router.get( `${apiVer}/studio/project/:id`, validateFirebaseIdToken,    isAuthenticated,    isDeveloper,    convert(StudioController.isAuthenticatedProject, true),   convert(StudioController.getProject));
    router.post( `${apiVer}/studio/project/:id`, validateFirebaseIdToken,   isAuthenticated,    isDeveloper,    convert(StudioController.isAuthenticatedProject, true),   FileManager.uploadImage, convert(StudioController.updateProject));
    router.delete( `${apiVer}/studio/project/:id`, validateFirebaseIdToken, isAuthenticated,    isDeveloper,    convert(StudioController.isAuthenticatedProject, true),   convert(StudioController.deleteProject));

    router.post(`${apiVer}/studio/version`,     validateFirebaseIdToken,    isAuthenticated,    isDeveloper,    FileManager.uploadImage,    convert(StudioController.isAuthenticatedProject, true), convert(StudioController.createVersion));
    router.delete(`${apiVer}/studio/version/:id`, validateFirebaseIdToken,  isAuthenticated,    isDeveloper,    convert(StudioController.isAuthenticatedProjectVersion, true),    convert(StudioController.deleteVersion));

    router.get( `${apiVer}/studio/verify-pathname/:pathname`, validateFirebaseIdToken, isAuthenticated, isDeveloper, convert(StudioController.verifyGamePathname) );

    // 설문조사
    router.post(`/gf/survey`,   convert(StudioController.callbackSurvey));
    router.get(`${apiVer}/studio/survey`,   validateFirebaseIdToken, isAuthenticated, isDeveloper, convert(StudioController.getCurrentSurveyResult));
}

// RpcController.generator( 'get-developer', StudioController.getDeveloper, true );
// RpcController.generator( 'set-developer', StudioController.updateDeveloper, true );

// RpcController.generator( 'get-projects', StudioController.getProjects, true );
// RpcController.generator( 'get-project', StudioController.getProject, true );
// RpcController.generator( 'verify-pathname', StudioController.verifyGamePathname, true );
// RpcController.generator( 'set-project', StudioController.updateProject, true );
// RpcController.generator( 'delete-project', StudioController.deleteProject, true );

// RpcController.generator( 'get-versions', StudioController.getVersions, true );
// RpcController.generator( 'get-version', StudioController.getVersion, true );
// RpcController.generator( 'create-version', StudioController.createVersion, true );
// RpcController.generator( 'set-version', StudioController.updateVersion, true );

RpcController.generator( 'admin-get-versions', AdminStudioController.getVersions, true );
RpcController.generator( 'admin-get-version', AdminStudioController.getVersion, true );
RpcController.generator( 'admin-set-version', AdminStudioController.setVersion, true );


// RpcController.generator( 'delete-version', StudioController.deleteProject, true );
