import { Request, Response, Router } from 'express';
import convert from '../controllers/_convert';
import { validateFirebaseIdToken } from './_common';
import UserController from '../controllers/userController'


const apiVer = `/api/v1`;

export default (router: Router) => {

    router.get(`${apiVer}/users/info`,              validateFirebaseIdToken,    convert(UserController.getInfo));
    router.get(`${apiVer}/users/info/:target_uid`,  validateFirebaseIdToken,    convert(UserController.getTargetInfo));


    // social media - DM ( direct message )
    router.post(`${apiVer}/dm/send`);
    router.get(`${apiVer}/dm/list`);


    // social media - follow
    router.post(`${apiVer}/sm/follow`);
    router.post(`${apiVer}/sm/un-follow`);
    router.get(`${apiVer}/sm/following`);
    router.get(`${apiVer}/sm/followers`);
}