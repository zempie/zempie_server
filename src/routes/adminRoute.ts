import { Request, Response, Router } from 'express';
import convert from '../controllers/_convert';
import AdminController from '../controllers/adminController/adminController';
import AdminUserController from '../controllers/adminController/adminUserController';
import AdminSupportController from '../controllers/adminController/adminSupportController';
import AdminStudioController from '../controllers/adminController/adminStudioController';
import { adminTracking, validateAdminIdToken } from './_common';


const apiVer = `/api/v1`;

export default (router: Router) => {
    router.post(`${apiVer}/admin/login`,        convert(AdminController.login));
    router.post(`${apiVer}/admin/logout`,       validateAdminIdToken,   convert(AdminController.logout));
    router.post(`${apiVer}/admin/token`,        convert(AdminController.getAccessTokens));
    router.get(`${apiVer}/admin/verify`,        validateAdminIdToken,   convert(AdminController.verifyToken));


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
    router.get(`${apiVer}/admin/user/list`,         validateAdminIdToken,   convert(AdminUserController.getUsers));
    router.get(`${apiVer}/admin/user/profile`,      validateAdminIdToken,   convert(AdminUserController.getUserProfile));
    router.post(`${apiVer}/admin/user/ban`,         validateAdminIdToken,   adminTracking,  convert(AdminUserController.banUser));


    /**
     * 고객지원
     */
    /**
     * 1:1 문의
     */
    router.get(`${apiVer}/admin/support/inquiries`,     validateAdminIdToken,   convert(AdminSupportController.getUserInquiries));
    router.post(`${apiVer}/admin/support/response`,     validateAdminIdToken,   adminTracking,  convert(AdminSupportController.respondInquiry))


    /**
     * 공지사항
     */
    router.get(`${apiVer}/admin/support/notices`,       validateAdminIdToken,   convert(AdminSupportController.getNotices));
    router.post(`${apiVer}/admin/support/notice`,       validateAdminIdToken,   adminTracking,  convert(AdminSupportController.createNotice));
    router.post(`${apiVer}/admin/support/notice/mod`,   validateAdminIdToken,   adminTracking,  convert(AdminSupportController.updateNotice));
    router.post(`${apiVer}/admin/support/notice/del`,   validateAdminIdToken,   adminTracking,  convert(AdminSupportController.deleteNotice));


    /**
     * 게임
     */
    // router.get(`${apiVer}/admin/game/list`,     validateAdminIdToken,    convert(AdminController.getGames));

    // router.get(`${apiVer}/admin/projects`,      validateAdminIdToken,   convert(AdminController.getProjects));


    /**
     *
     */
    // router.post(`${apiVer}/admin/notify`,   validateAdminIdToken,    convert(AdminController.notify));


    /**
     * 스튜디오
     *
     */

    router.get(`${apiVer}/admin/studio/version`,       validateAdminIdToken,   convert(AdminStudioController.getVersion));
    router.get(`${apiVer}/admin/studio/versions`,       validateAdminIdToken,   convert(AdminStudioController.getVersions));
    router.post(`${apiVer}/admin/studio/version`,       validateAdminIdToken,   convert(AdminStudioController.setVersion));
}
