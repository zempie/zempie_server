"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const AWS = require("aws-sdk");
const imagemin = require("imagemin");
const imageminWebp = require("imagemin-webp");
const formidable_1 = require("formidable");
const opt_1 = require("../../config/opt");
const utils_1 = require("../commons/utils");
const logger_1 = require("../commons/logger");
AWS.config.loadFromPath('config/aws/credentials.json');
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
class FileManager {
    constructor() {
        this.uploadImage = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                // const { user } = req;
                const { params, files } = yield this.formidable(req);
                req.params = params;
                req.files = files;
                next();
            }
            catch (e) {
                console.error(e);
            }
        });
        this.formidable = (req) => {
            const uploadDir = path.join(__dirname, '..', '..', 'upload');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir);
            }
            return new Promise((resolve, reject) => {
                const form = new formidable_1.IncomingForm({
                    encoding: 'utf-8',
                    uploadDir,
                    keepExtensions: true,
                    maxFileSize: 1024 * 1024 * 10,
                    multiples: false,
                });
                form.parse(req, (err, fields, files) => __awaiter(this, void 0, void 0, function* () {
                    logger_1.logger.debug('fields:', fields);
                    // const webps = await this.convertToWebp(_.map(files), 80);
                    resolve({
                        params: fields,
                        files
                    });
                }));
            });
        };
        this.convertToWebp = (file, quality = 100) => __awaiter(this, void 0, void 0, function* () {
            const uploadDir = path.join(__dirname, '..', '..', 'upload');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir);
            }
            const _filePath = file.path.replace(/\\/gi, '/');
            const webp = yield imagemin([_filePath], {
                destination: uploadDir,
                plugins: [
                    imageminWebp({ quality })
                ]
            });
            fs.unlink(file.path, (err) => {
                logger_1.logger.debug('.jpg 삭제');
            });
            return webp;
        });
        this.s3upload = (Key, filePath, uid) => {
            return new Promise((resolve, reject) => {
                const params = {
                    Bucket: `${opt_1.default.AWS.Bucket}/${uid}/p`,
                    Key,
                    // ACL: 'public-read',
                    ContentType: utils_1.getContentType(filePath),
                    Body: fs.createReadStream(filePath),
                };
                s3.upload(params, (err, data) => {
                    fs.unlink(filePath, (err) => {
                        logger_1.logger.debug('.webp 삭제');
                    });
                    if (err) {
                        console.error(err);
                        return reject(err);
                    }
                    resolve(data);
                });
                // const upload = new AWS.S3.ManagedUpload({ service: s3, params });
                // upload.send((err, data) => {
                //     fs.unlink(filePath, (err) => {
                //         console.log('.webp 삭제')
                //     });
                //
                //     if (err) {
                //         console.error(err);
                //         return reject(err);
                //     }
                //     resolve(data);
                // })
            });
        };
        this.s3upload2 = (Key, filePath, uid, versionPath) => {
            return new Promise((resolve, reject) => {
                const params = {
                    Bucket: `${opt_1.default.AWS.Bucket}/${uid}/p/${versionPath}`,
                    Key,
                    ContentType: utils_1.getContentType(filePath),
                    // ACL: 'public-read',
                    Body: fs.createReadStream(filePath),
                };
                const upload = new AWS.S3.ManagedUpload({ service: s3, params });
                upload.send((err, data) => {
                    fs.unlink(filePath, (err) => {
                        console.log('.webp 삭제');
                    });
                    if (err) {
                        console.error(err);
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        };
    }
}
exports.default = new FileManager();
//# sourceMappingURL=fileManager.js.map