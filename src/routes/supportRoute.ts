import { Router } from 'express';
import convert from '../controllers/_convert';
import { validateFirebaseIdToken } from './_common';
import SupportController from '../controllers/supportController';
import FileManager from '../services/fileManager';


const apiVer = `/api/v1`;

export default (router: Router) => {
    router.get(`${apiVer}/support/notices`,         convert(SupportController.getNotices));
    router.get(`${apiVer}/support/notice/:id`,      convert(SupportController.getNotice));
    // router.get(`${apiVer}/support/faq`,             convert(SupportController.getFaq));

    router.get(`${apiVer}/support/inquiries`,       validateFirebaseIdToken,    convert(SupportController.getMyInquiries));
    router.get(`${apiVer}/support/inquiry/:id`,     validateFirebaseIdToken,    convert(SupportController.getMyInquiry));
    router.post(`${apiVer}/support/inquiry`,        validateFirebaseIdToken,    FileManager.uploadImage2(5, 5), convert(SupportController.askInquiry));


    router.get(`/redirect`,     (req, res) => {
        let bBot = false;
        const userAgent: any = req.headers['User-Agent'];
        if (userAgent.match(/baiduspider|twitterbot|facebookexternalhit|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|slackbot|vkShare|W3C_Validator/i)) {
            bBot = true;
        }

        if ( bBot ) {
            res.status(200).set('Content-Type', 'text/html')
                .write(`<html>
<head>
    <title>@@ Zempie @@</title>
    <meta name="description" content="직접 만든 게임을 업로드하고, 플레이하고, 주변에 공유해 보세요. 개발 방법을 모르는 분들을 위한 템플릿도 준비되어 있습니다.">
    <meta property="og:url" content="https://zempie.com">
    <meta property="og:site_name" content="Zempie">
    <meta property="og:title" content="@@@ 누구나 업로드할 수 있는 게임공유플랫폼 ZEMPIE @@@">
    <meta property="og:description" content="직접 만든 게임을 업로드하고, 플레이하고, 주변에 공유해 보세요. 개발 방법을 모르는 분들을 위한 템플릿도 준비되어 있습니다.">
    <meta property="og:type" content="website">
</head>
</html>`)
        }
        else {
            res.redirect(`https://zempie.com`)
        }
    })
}
