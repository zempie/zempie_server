import { Router } from 'express';
import convert from '../controllers/_convert';
import { validateFirebaseIdToken } from './_common';
import SupportController from '../controllers/supportController';


const apiVer = `/api/v1`;

export default (router: Router) => {
    router.get(`${apiVer}/support/notices`,         convert(SupportController.getNotices));
    router.get(`${apiVer}/support/qna`,             convert(SupportController.getQna));

    router.get(`${apiVer}/support/inquiries`,       validateFirebaseIdToken,    convert(SupportController.getMyInquiries));
    router.post(`${apiVer}/support/inquiry`,        validateFirebaseIdToken,    convert(SupportController.askInquiry));
}
