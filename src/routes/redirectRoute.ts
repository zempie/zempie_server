import { Router } from 'express';
import convert from '../controllers/_convert';
import RedirectController from '../controllers/redirectController';

export default (router: Router) => {
    router.get(`/redirect/play/:pathname`, RedirectController.play);
    // router.get(`/redirect/game/:pathname`, RedirectController.game);
    // router.get(`/redirect/battle/:battle_uid`, RedirectController.battle);
    // router.get(`/redirect/shared/:shared_uid`, RedirectController.shared);
}
