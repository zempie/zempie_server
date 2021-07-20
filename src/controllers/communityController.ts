import * as fs from 'fs';
import * as path from 'path';
import * as uniqid from 'uniqid';
import * as FileType from 'file-type';
import { IRoute } from './_interfaces';
import { CreateError, ErrorCodes } from '../commons/errorCodes';
import admin from 'firebase-admin';
import DecodedIdToken = admin.auth.DecodedIdToken;
import FileManager from "../services/fileManager";
import Opt from '../../config/opt';
const { AWS } = Opt;
const replaceExt = require('replace-ext');
// const FileType = require('file-type');


class CommunityController {
    uploadImage = async (params: any, {uid}: DecodedIdToken, {req: {files: {file}}}: IRoute) => {
        if ( !file ) {
            throw CreateError(ErrorCodes.INVALID_PARAMS);
        }

        const webp = await FileManager.convertToWebp(file, 80);
        const key = replaceExt(uniqid(), '.webp');
        const data: any = await FileManager.s3upload({
            bucket: AWS.Bucket.Rsc,
            key,
            filePath: webp[0].destinationPath,
            uid,
            subDir: 'c/i',
        });

        return {
            url: data.Location,
        }
    }


    uploadFile = async (params: any, {uid}: DecodedIdToken, {req: {files: {file}}}: IRoute) => {
        if ( !file ) {
            throw CreateError(ErrorCodes.INVALID_PARAMS);
        }

        let Key = uniqid();
        let filePath = file.path;
        let subDir = 'c';
        const Body = fs.createReadStream(file.path);
        const { fileType }: any = await FileType.stream(Body);
        switch (fileType.mime) {
            case 'image/jpeg':
            case 'image/png':
                const webp = await FileManager.convertToWebp(file, 80);
                Key = replaceExt(uniqid(), '.webp');
                filePath = webp[0].destinationPath;
                subDir = 'c/i';
                break;

            case 'image/webp':
                Key = replaceExt(uniqid(), '.webp');
                subDir = 'c/i';
                break;

            case 'audio/x-m4a':
            case 'audio/mp4':
                Key = replaceExt(uniqid(), `.${fileType.ext}`);
                subDir = 'c/a';
                break;

            case 'video/mp4':
                Key = replaceExt(uniqid(), `.${fileType.ext}`);
                subDir = 'c/v';
                break;

            default:
                fs.unlink(file.path, () => {
                    throw CreateError(ErrorCodes.INVALID_FILE_TYPE);
                });
        }

        const s3params = {
            Bucket: path.join(AWS.Bucket.Rsc, uid, subDir).replace(/\\/g, '/'),
            Key,
            ContentType: fileType.ext,
            Body,
        }
        const data: any = await FileManager.s3upload4(s3params, file.path);

        return {
            url: data.Location,
        }
    }
}


export default new CommunityController()
