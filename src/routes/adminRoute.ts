import { Request, Response, Router } from 'express';
import convert from '../controllers/_convert';
import AdminController from '../controllers/adminController';


const apiVer = `/api/v1`;

export default (router: Router) => {

    async function isAdmin(req: Request, res: Response, next: Function) {
        next();
    }


    router.get(`${apiVer}/admin/projects`,                  isAdmin,        convert(AdminController.getProjects));
    router.get(`${apiVer}/admin/tokens`,                    isAdmin,        convert(AdminController.getAccessTokens));

    router.get(`${apiVer}/admin/games`,     convert(AdminController.getGames));

}