import { Router } from 'express';
import { validateFirebaseIdToken } from './_common';
import convert from '../controllers/_convert';
import RpcController from '../controllers/rpcController';
import ServiceController from '../controllers/serviceController';


const apiVer = `/api/v1`;

export default (router: Router) => {

    router.post(`${apiVer}/qna/q`,      validateFirebaseIdToken,    convert(ServiceController.askQuestion));
    router.get(`${apiVer}/qna/my-q`,    validateFirebaseIdToken,    convert(ServiceController.getMyQuestionList));

    router.get(`${apiVer}/qna/admin/q`,     convert(ServiceController.getAllQuestionList));
    router.post(`${apiVer}/qna/admin/a`,    convert(ServiceController.answer));
}


RpcController.generator('qna-q',        ServiceController.askQuestion, true);
RpcController.generator('qna-myq',      ServiceController.getMyQuestionList, true);



/**
 * 관리자
 */
RpcController.generator('qna-admin-q',      ServiceController.getAllQuestionList);
RpcController.generator('qna-admin-a',      ServiceController.answer);

