import {Request, Response, Router} from 'express';
import convert from '../controllers/_convert';
import CommunityController from '../controllers/communityController';
import {isAuthenticated, validateFirebaseIdToken} from "./_common";
import UserController from "../controllers/user/userController";

const apiVer = `/api/v1`;

export default (router: Router) => {

    //커뮤니티
    router.get(`${apiVer}/community/project/:id`, convert(CommunityController.getProject));
    // router.get(`${apiVer}/community/channel/:channel_id`, validateFirebaseIdToken, convert(UserController.getTargetInfoByChannelId));
    router.get(`${apiVer}/community/channel/:channel_id`, convert(CommunityController.getTargetInfoByChannelId));
    router.get(`${apiVer}/community/user/:user_id`, convert(CommunityController.getTargetInfoByUserId));
}