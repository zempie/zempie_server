import { Router } from 'express';
import convert from '../controllers/_convert';
import CommunityController from '../controllers/communityController';
import GoogleController from '../controllers/googleController'
import { validateFirebaseIdToken } from "./_common";
import gameController from '../controllers/game/gameController';
import FileManager from "../services/fileManager";
import MetaController from '../controllers/metaController';

const apiVer = `/api/v1`;

export default (router: Router) => {

    //커뮤니티
    router.get(`${apiVer}/community/project/:id`,           validateFirebaseIdToken, convert(CommunityController.getProject));
    router.get(`${apiVer}/community/channel/:channel_id`,   validateFirebaseIdToken, convert(CommunityController.getTargetInfoByChannelId));
    router.get(`${apiVer}/community/user/:user_id`,         validateFirebaseIdToken, convert(CommunityController.getTargetInfoByUserId));

    //번역
    router.post(`${apiVer}/translate`,      convert(GoogleController.translateText))
    router.post(`${apiVer}/detect-lang`,    convert(GoogleController.detectLanguage))

    //게임 페이지
    router.post(`${apiVer}/game/banner`,        validateFirebaseIdToken, FileManager.uploadFiles(40, 40), convert(gameController.setBanner))
    router.put(`${apiVer}/game/banner`,         validateFirebaseIdToken, FileManager.uploadFiles(40, 40), convert(gameController.updateBanner))
    router.delete(`${apiVer}/game/banner`,      validateFirebaseIdToken, convert(gameController.deleteBanner))


    //meta-tag
    router.get(`${apiVer}/og-tag`,      convert(CommunityController.getOgTag));

    //init meta
    router.get(`${apiVer}/init`,        convert(MetaController.getInfo))



}