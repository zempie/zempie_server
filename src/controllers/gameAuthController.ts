var jwt = require('jsonwebtoken');
import * as _ from "lodash";
import { CreateError, ErrorCodes } from '../commons/errorCodes';
import cfgOption from '../../config/opt';
import { dbs } from "../commons/globals";
import admin from 'firebase-admin';
import DecodedIdToken = admin.auth.DecodedIdToken;
class GameAuthController {
  

  async createUserToken(params: any, { uid }: DecodedIdToken,) {
    const { secret } = cfgOption.JWT.access;
    const user = await dbs.User.getInfo({ uid });

    if (user) {
      const payload = {
        uid: uid,
        created_time: Date.now(),
        email: user.email,
        picture: user.picture,
        name: user.name
      }
      return { token: jwt.sign(payload, secret ) };
    } else {
      throw CreateError(ErrorCodes.UNAUTHORIZED);
    }

  }

  async verifyToken({ token }: { token: any }) {
    const { secret } = cfgOption.JWT.access;

    try {
      return { info: jwt.verify(token, secret) }
    } catch (err) {
      throw CreateError(ErrorCodes.INVALID_TOKEN);
    }

  }

  async getInfo({ token }: { token: any }) {
    const { secret } = cfgOption.JWT.access;

    const result = {user:jwt.verify(token, secret)}
    return result
  }

  async createGameToken({ text }: { text: string }) {
    const { secret } = cfgOption.JWT.access;
    const payload = {
      content: text
    }
    const token = jwt.sign(payload, secret, { expiresIn:'9999 years',  issuer: 'zempie' })

    return { token };

  }

  async verifyGameToken(token: string) {
    const { secret } = cfgOption.JWT.access;

    return { decodedToken: jwt.verify(token, secret) }
  }

}


export default new GameAuthController()