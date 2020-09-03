import { Request, Response, Router } from 'express';
import convert from '../controllers/_convert';
import AdminController from '../controllers/adminController/contentAdminController';
import RpcController from '../controllers/rpcController';
import StudioAdminController from '../controllers/adminController/studioAdminController';


const apiVer = `/api/v1`;

export default (router: Router) => {

    async function isAdmin(req: Request, res: Response, next: Function) {
        next();
    }


    router.get(`${apiVer}/admin/projects`,                  isAdmin,        convert(AdminController.getProjects));
    router.get(`${apiVer}/admin/tokens`,                    isAdmin,        convert(AdminController.getAccessTokens));

    router.get(`${apiVer}/admin/users`,     isAdmin,    convert(AdminController.getUsers));
    router.get(`${apiVer}/admin/games`,     isAdmin,    convert(AdminController.getGames));


    router.post(`${apiVer}/admin/notify`,   isAdmin,    convert(AdminController.notify));
}

RpcController.generator('admin-get-projects',   AdminController.getProjects);
RpcController.generator('admin-get-tokens',     AdminController.getProjects);
RpcController.generator('admin-get-users',      AdminController.getUsers);
RpcController.generator('admin-get-games',      AdminController.getGames);
RpcController.generator('admin-notify',         AdminController.notify);



RpcController.generator( 'admin-get-versions', StudioAdminController.getVersions, true );
RpcController.generator( 'admin-get-version', StudioAdminController.getVersion, true );
RpcController.generator( 'admin-set-version', StudioAdminController.setVersion, true );
