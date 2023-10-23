import { Router } from 'express';
import convert from '../controllers/_convert';
import { checkUserDenied, isAuthenticated, validateFirebaseIdToken, isIdVerified } from './_common';
import UserController from '../controllers/user/userController';
import UserContentController from '../controllers/user/userContentController';
import UserPlaylistController from '../controllers/user/userPlaylistController';
import AlarmController from '../controllers/alarmController';
import ContentController from '../controllers/contentController';
import FileManager from '../services/fileManager';
import PublishingController from '../controllers/publishingController';
import ShopController from '../controllers/shopController';
import PaymentController from '../controllers/paymentController';
import CoinController from '../controllers/coinController';



const apiVer = `/api/v1`;

export default (router: Router) => {
    router.get(`${apiVer}/__cookie`,                                          convert(UserController.setCookie))
    router.get(`${apiVer}/user/verify-session`,                               convert(UserController.getCustomToken));
    router.post(`${apiVer}/user/sign-up`,            validateFirebaseIdToken, convert(UserController.signUp));
    router.post(`${apiVer}/user/sign-out`,           validateFirebaseIdToken, convert(UserController.signOut));
    router.post(`${apiVer}/user/leave-zempie`,       validateFirebaseIdToken, convert(UserController.leaveZempie))
    router.post(`${apiVer}/user/verify-email`,       validateFirebaseIdToken, convert(UserController.verifyEmail));
    router.post(`${apiVer}/user/verify-channel`,     validateFirebaseIdToken, convert(UserController.verifyChannelId));
    router.post(`${apiVer}/user/has-email`,          validateFirebaseIdToken, convert(UserController.hasEmail));
    router.post(`${apiVer}/user/has-nickname`,       validateFirebaseIdToken, convert(UserController.hasNickname));
    //본인인증
    router.post(`${apiVer}/user/verify-id`,          validateFirebaseIdToken, convert(UserController.verifyIdentification))


    router.post(`${apiVer}/user/update/info`,       validateFirebaseIdToken, FileManager.uploadImage2(1, 2), convert(UserController.setInfo));
    router.post(`${apiVer}/user/update/banner`,     validateFirebaseIdToken, FileManager.uploadImage2(10, 10), convert(UserController.setBanner));
    router.post(`${apiVer}/user/update/setting`,    validateFirebaseIdToken, convert(UserController.updateSetting));
    router.post(`${apiVer}/user/update/e-link`,     validateFirebaseIdToken, convert(UserController.updateExternalLink));
    router.post(`${apiVer}/user/delete/e-link`,     validateFirebaseIdToken, convert(UserController.deleteExternalLink));

    router.get(`${apiVer}/user/filter/bad-word`,    validateFirebaseIdToken, convert(UserController.filterBadWord));

    router.get(`${apiVer}/user/info`,               validateFirebaseIdToken, isAuthenticated, convert(UserController.getInfo));
    router.get(`${apiVer}/user/:nickname`,          validateFirebaseIdToken, convert(UserController.getTargetInfoByNickname));
    router.get(`${apiVer}/channel/:channel_id`,     validateFirebaseIdToken, convert(UserController.getTargetInfoByChannelId));
    router.get(`${apiVer}/user/info/:user_id`,      validateFirebaseIdToken, convert(UserController.getTargetInfoById));



    router.get(`${apiVer}/user/mails`,              validateFirebaseIdToken, isAuthenticated, convert(UserContentController.getMailbox));
    router.get(`${apiVer}/user/mail/:id`,           validateFirebaseIdToken, isAuthenticated, convert(UserContentController.readMail));
    router.post(`${apiVer}/user/mail/d`,            validateFirebaseIdToken, isAuthenticated, convert(UserContentController.deleteMail));


    router.get(`${apiVer}/playlists`,               validateFirebaseIdToken, convert(UserPlaylistController.getPlaylists));
    router.get(`${apiVer}/playlist/:uid`,           validateFirebaseIdToken, convert(UserPlaylistController.getPlaylist));
    router.post(`${apiVer}/playlist/c`,             validateFirebaseIdToken, isAuthenticated, FileManager.uploadImage, convert(UserPlaylistController.createPlaylist));
    router.post(`${apiVer}/playlist/u`,             validateFirebaseIdToken, isAuthenticated, FileManager.uploadImage, convert(UserPlaylistController.updatePlaylist));
    router.post(`${apiVer}/playlist/d`,             validateFirebaseIdToken, isAuthenticated, convert(UserPlaylistController.deletePlaylist));

    router.post(`${apiVer}/playlist/game/c`,        validateFirebaseIdToken, isAuthenticated, convert(UserPlaylistController.addGame));
    router.post(`${apiVer}/playlist/game/u`,        validateFirebaseIdToken, isAuthenticated, convert(UserPlaylistController.sortGame));
    router.post(`${apiVer}/playlist/game/d`,        validateFirebaseIdToken, isAuthenticated, convert(UserPlaylistController.delGame));
    router.post(`${apiVer}/playlist/game/s`,        validateFirebaseIdToken, isAuthenticated, convert(UserPlaylistController.sortGame));

    router.post(`${apiVer}/report/game`,            validateFirebaseIdToken, isAuthenticated, FileManager.uploadImage2(1, 2), convert(ContentController.reportGame));
    router.post(`${apiVer}/report/user`,            validateFirebaseIdToken, isAuthenticated, FileManager.uploadImage2(1, 2), convert(ContentController.reportUser));

    router.get(`${apiVer}/user/search`,             validateFirebaseIdToken, convert(UserController.searchUser));
    router.get(`${apiVer}/user/alarm`,              validateFirebaseIdToken, convert(AlarmController.getList));
    router.get(`${apiVer}/user/publishing`,         validateFirebaseIdToken, convert(PublishingController.getList));
    router.put(`${apiVer}/user/alarm`,              validateFirebaseIdToken, isAuthenticated, convert(UserController.updateAlarmStatus));


    // 결제 관련
    router.get(`${apiVer}/items`,                   validateFirebaseIdToken, convert(ShopController.getRefItemsAndShopItems));
    router.get(`${apiVer}/items/:store_type`,       validateFirebaseIdToken, convert(ShopController.getRefItemsAndShopItems));
    
    router.post(`${apiVer}/payment/iap`,            validateFirebaseIdToken, convert(PaymentController.validateReceiptIAP));
    router.post(`${apiVer}/payment/web`,            validateFirebaseIdToken, convert(PaymentController.validateReceiptBootpay));
    router.get(`${apiVer}/payment/log`,             validateFirebaseIdToken, isAuthenticated, convert(PaymentController.getPaymentList));
    
    
    router.get(`${apiVer}/coin/usage/list`,         validateFirebaseIdToken, convert(CoinController.coinUsageList))
    router.get(`${apiVer}/coin/profit/list`,        validateFirebaseIdToken, convert(CoinController.coinProfitList))

    // 젬 도네이션
    router.post(`${apiVer}/coin/transfer`,          validateFirebaseIdToken, convert(CoinController.transferCoin))
    // 환전
    router.post(`${apiVer}/coin/redemption`,        validateFirebaseIdToken, isIdVerified, convert(CoinController.reqRedeemCoin) )
    router.get(`${apiVer}/coin/redemptions`,        validateFirebaseIdToken, convert(CoinController.reqRedeemCoinList))

    
    // 유저 계좌
    router.post(`${apiVer}/user/bank/account`,      validateFirebaseIdToken, convert(UserController.registerBankAccount))
    router.get(`${apiVer}/user/bank/accounts`,      validateFirebaseIdToken, convert(UserController.getBankAccounts))
    router.delete(`${apiVer}/user/bank/account`,    validateFirebaseIdToken, convert(UserController.deleteBankAccount))

    // for testing
    // router.get(`${apiVer}/test-mongo`, convert(UserController.testMongo));
    router.post(`${apiVer}/test-claim`, validateFirebaseIdToken, checkUserDenied('reply'), convert(UserController.testClaim));


}
