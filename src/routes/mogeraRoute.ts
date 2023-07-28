import { Router } from 'express';
import convert from '../controllers/_convert';
import { validateGameToken, isAuthenticated, validateFirebaseIdToken } from './_common';
import UserController from '../controllers/user/userController';
import MogeraController from '../controllers/mogera/mogeraController';
import gameAuthController from '../controllers/gameAuthController';
import FileManager from "../services/fileManager";

const apiVer = `/api/v1`;

export default (router: Router) => {
    router.post(`${apiVer}/mogera/game-file`,       validateFirebaseIdToken, FileManager.uploadImage, convert(MogeraController.createGameFile));
    router.get(`${apiVer}/mogera/game-file`,        validateFirebaseIdToken, convert(MogeraController.getGameFile));
}
