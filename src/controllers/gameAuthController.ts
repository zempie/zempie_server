
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
      return { token: jwt.sign(payload, SECRET_KEY, { expiresIn: 60 * 60, issuer: 'zempie' }) };
    } else {
      throw CreateError(ErrorCodes.UNAUTHORIZED);
    }

  }

  async verifyToken({ token }: { token: string }) {

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


    let cipher = crypto.createCipheriv(
      ALGORITHM, Buffer.from(CRYPTO_KEY), IV);

    // Updating text
    let encrypted = cipher.update(text);

    // Using concatenation
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // Returning iv and encrypted data
    return { encryptedData: encrypted.toString('hex') }


  }

  async verifyGameToken(key: any) {

    const decipher = crypto.createDecipheriv(ALGORITHM, CRYPTO_KEY, Buffer.from(IV, 'hex'))

    const decrpyted = Buffer.concat([decipher.update(Buffer.from(key, 'hex')), decipher.final()])


    return API_AUTH_KEY === decrpyted.toString()
  }

}


export default new GameAuthController()
