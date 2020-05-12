import { Request, Response, Router } from 'express';
import convert from '../controllers/_convert';
import { validateFirebaseIdToken } from './_common';
import TimelineController from '../controllers/timelineController'
import AlarmController from '../controllers/alarmController'
import NoticeController from '../controllers/noticeController'


const apiVer = `/api/v1`;

export default (router: Router) => {

    router.get(`${apiVer}/timeline`,        validateFirebaseIdToken,    convert(TimelineController.getList));
    router.get(`${apiVer}/alarm`,           validateFirebaseIdToken,    convert(AlarmController.getList));
    router.get(`${apiVer}/notice`,          validateFirebaseIdToken,    convert(NoticeController.getList));


    // social media - DM ( direct message )
    router.post(`${apiVer}/dm/send`);
    router.get(`${apiVer}/dm/list`);


    // social media - follow
    router.post(`${apiVer}/sm/follow`);
    router.post(`${apiVer}/sm/un-follow`);
    router.get(`${apiVer}/sm/following`);
    router.get(`${apiVer}/sm/followers`);
}