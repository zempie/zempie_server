import {Router} from 'express';
import convert from '../controllers/_convert';
import CommunityController from '../controllers/communityController';
import {validateFirebaseIdToken} from "./_common";
import StudioController from "../controllers/studio/studioController";

const apiVer = `/api/v1`;

export default (router: Router) => {

    //커뮤니티
    router.get(`${apiVer}/community/project/:id`,          validateFirebaseIdToken,     convert(CommunityController.getProject));
    router.get(`${apiVer}/community/channel/:channel_id`,  validateFirebaseIdToken,     convert(CommunityController.getTargetInfoByChannelId));
    router.get(`${apiVer}/community/user/:user_id`,        validateFirebaseIdToken,     convert(CommunityController.getTargetInfoByUserId));


    router.post(`/gf/survey`,   convert(StudioController.callbackSurvey));

}