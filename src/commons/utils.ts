import * as crypto from 'crypto';
import cfgOption from '../../config/opt';
import * as jwt from 'jsonwebtoken';


/**
 * capitalize
 */
export function capitalize(str: string, lowercaseRest: boolean = false) : string {
    function makeString(object: string) {
        if (object == null) return '';
        return '' + object;
    }

    str = makeString(str);
    const remainingChars = !lowercaseRest ? str.slice(1) : str.slice(1).toLowerCase();

    return str.charAt(0).toUpperCase() + remainingChars;
}

/**
 * Password - pbkdf2
 */
export function makePassword(password: string) {
    const opt = cfgOption.password;
    return crypto.pbkdf2Sync(password, opt.salt, opt.iteration, 64, 'sha512').toString('hex');
}
export function verifyPassword(password: string, digest: string) {
    return digest === makePassword(password);
}


/**
 * JWT
 */
export function signJWT(payload: object, expiresIn: string | undefined) {
    const { secret, options } = cfgOption.JWT.access;
    options.expiresIn = expiresIn || options.expiresIn;

    return jwt.sign(payload, secret, options);
}
export function verifyJWT(token: string): any {
    const { secret } = cfgOption.JWT.access;
    return jwt.verify(token, secret);
}



/*
    expires
 */
export function expiresIn(from: string, expires_in: string) {
    let t;
    const w = expires_in[expires_in.length-1];
    if ( w === 'd' ) {
        t = 1000 * 60 * 60* 24;
    }
}


/*
    Date
 */
export function Today(hour = 0, minutes = 0, seconds = 0, milliseconds = 0) {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minutes, milliseconds)
}
export function Yesterday() {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
}
