import { Request, Response, Router } from 'express';
import convert from '../controllers/_convert';
import AdminController from '../controllers/adminController/contentAdminController';
import RpcController from '../controllers/rpcController';
import StudioAdminController from '../controllers/adminController/studioAdminController';
import { adminTracking, validateAdminIdToken } from './_common';

const apiVer = `/api/v1`;

export default (router: Router) => {
    router.post(`${apiVer}/admin/login`,        convert(AdminController.login));
    router.post(`${apiVer}/admin/logout`,       validateAdminIdToken,   convert(AdminController.logout));
    router.post(`${apiVer}/admin/token`,        convert(AdminController.getAccessTokens));


    /**
     * 관리자
     */
    router.get(`${apiVer}/admin/admin/logs`,    validateAdminIdToken,   convert(AdminController.getAdminLogs));
    router.get(`${apiVer}/admin/admin/list`,    validateAdminIdToken,   convert(AdminController.getAdmins));
    router.post(`${apiVer}/admin/admin/add`,    validateAdminIdToken,   adminTracking,  convert(AdminController.addAdmin));
    router.post(`${apiVer}/admin/admin/mod`,    validateAdminIdToken,   adminTracking,  convert(AdminController.updateAdmin));


    /**
     * 사용자
     */
    router.get(`${apiVer}/admin/user/list`,         validateAdminIdToken,   convert(AdminController.getUsers));
    router.get(`${apiVer}/admin/user/profile`,      validateAdminIdToken,   convert(AdminController.getUserProfile));
    router.post(`${apiVer}/admin/user/ban`,         validateAdminIdToken,   adminTracking,  convert(AdminController.banUser));
    router.get(`${apiVer}/admin/user/questions`,    validateAdminIdToken,   convert(AdminController.getUserQuestions));
    router.post(`${apiVer}/admin/user/answer`,      validateAdminIdToken,   adminTracking,  convert(AdminController.answerQuestion))


    /**
     * 고객지원
     */
    router.get(`${apiVer}/admin/support/questions`,     validateAdminIdToken,   convert(AdminController.getSupportQuestions));


    /**
     * 공지사항
     */
    router.get(`${apiVer}/admin/support/notices`,       validateAdminIdToken,   convert(AdminController.getNotices));
    router.post(`${apiVer}/admin/support/notice`,       validateAdminIdToken,   adminTracking,  convert(AdminController.createNotice));
    router.post(`${apiVer}/admin/support/notice/mod`,   validateAdminIdToken,   adminTracking,  convert(AdminController.updateNotice));
    router.post(`${apiVer}/admin/support/notice/del`,   validateAdminIdToken,   adminTracking,  convert(AdminController.deleteNotice));


    /**
     * 게임
     */
    router.get(`${apiVer}/admin/game/list`,     validateAdminIdToken,    convert(AdminController.getGames));

    // router.get(`${apiVer}/admin/projects`,      validateAdminIdToken,   convert(AdminController.getProjects));


    /**
     *
     */
    router.post(`${apiVer}/admin/notify`,   validateAdminIdToken,    convert(AdminController.notify));
}

RpcController.generator('admin-login',          AdminController.login);
RpcController.generator('admin-logout',         AdminController.logout, true, true);
RpcController.generator('admin-refresh-token',  AdminController.getAccessTokens);

// 관리자
// RpcController.generator('admin-get-admins',     AdminController.getAdmins, true, true);
// RpcController.generator('admin-add-admin',      AdminController.addAdmin, true, true);
// RpcController.generator('admin-mod-admin',      AdminController.updateAdmin, true, true);


RpcController.generator('admin-get-projects',   AdminController.getProjects);
RpcController.generator('admin-get-users',      AdminController.getUsers);
RpcController.generator('admin-get-games',      AdminController.getGames);
RpcController.generator('admin-notify',         AdminController.notify);



RpcController.generator( 'admin-get-versions', StudioAdminController.getVersions, true );
RpcController.generator( 'admin-get-version', StudioAdminController.getVersion, true );
RpcController.generator( 'admin-set-version', StudioAdminController.setVersion, true );
