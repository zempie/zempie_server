import { Request, Response, Router } from 'express';
import convert from '../controllers/_convert';
import { validateFirebaseIdToken } from './_common';
import TimelineController from '../controllers/timelineController'
import NoticeController from '../controllers/noticeController'
import SocialMediaController from '../controllers/socialMediaControlller'


const apiVer = `/api/v1`;

export default (router: Router) => {

    router.get(`${apiVer}/timeline`,        validateFirebaseIdToken,    convert(TimelineController.getList));
    router.get(`${apiVer}/notice`,          validateFirebaseIdToken,    convert(NoticeController.getList));


    // social media - follow
    router.post(`${apiVer}/sm/follow`,      validateFirebaseIdToken,    convert(SocialMediaController.follow));
    router.post(`${apiVer}/sm/un-follow`,   validateFirebaseIdToken,    convert(SocialMediaController.unfollow));
    router.get(`${apiVer}/sm/following`,    validateFirebaseIdToken,    convert(SocialMediaController.following));
    router.get(`${apiVer}/sm/followers`,    validateFirebaseIdToken,    convert(SocialMediaController.followers));



    // social media - DM ( direct message )
    router.post(`${apiVer}/dm/send`);
    router.get(`${apiVer}/dm/list`);
}