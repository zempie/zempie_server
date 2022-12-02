var jwt = require('jsonwebtoken');
import * as _ from "lodash";
import { CreateError, ErrorCodes } from '../commons/errorCodes';
import { dbs } from "../commons/globals";
const crypto = require('crypto');

const SECRET_KEY = crypto.randomBytes(48).toString('hex');
const ALGORITHM = 'aes-256-cbc';
const CRYPTO_KEY = crypto.randomBytes(16).toString('hex');
const IV = crypto.randomBytes(16);
const API_AUTH_KEY = 'zempie2022'


class GameAuthController {

  async createUserToken({ uid }: { uid: string }) {

    const user = await dbs.User.getInfo({ uid });

    if (user) {
      const payload = {
        uid: uid,
        created_time: Date.now(),
        email: user.email,
        picture: user.picture,
        name: user.name
      }
      return { token: jwt.sign(payload, SECRET_KEY) };
    } else {
      throw CreateError(ErrorCodes.UNAUTHORIZED);
    }

  }

  async verifyToken({ token }: { token: any }) {

    try {
      return { info: jwt.verify(token, SECRET_KEY) }

    } catch (err) {
      throw CreateError(ErrorCodes.INVALID_TOKEN);
    }
  }

  async getInfo({ }, { uid }: any) {
    const user = await dbs.User.getInfo({ uid })

    return { user: user }

  }

  async createGameToken({ text }: { text: string }) {

    return { token: jwt.sign(text, SECRET_KEY) };

  }

  async verifyGameToken(token: string) {

    return { decodedToken: jwt.verify(token, SECRET_KEY) }
  }

}


export default new GameAuthController()