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
const errorCodes_1 = require("../commons/errorCodes");
const _convert_1 = require("../controllers/_convert");
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
                _convert_1.responseError(res, e);
            }
        });
        this.uploadImage2 = (maxFileSizeMB = 100, maxFieldsSizeMB = 20) => {
            return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const { err, params, files } = yield this.formidable(req, maxFileSizeMB, maxFieldsSizeMB);
                    if (err) {
                        if (err.message.includes('maxFileSize')) {
                            _convert_1.responseError(res, errorCodes_1.CreateError(errorCodes_1.ErrorCodes.MAX_FILE_SIZE_EXCEEDED));
                        }
                        else if (err.message.includes('maxFieldsSize')) {
                            _convert_1.responseError(res, errorCodes_1.CreateError(errorCodes_1.ErrorCodes.MAX_FIELDS_SIZE_EXCEEDED));
                        }
                    }
                    else {
                        req.params = params;
                        req.files = files;
                        next();
                    }
                }
                catch (e) {
                    _convert_1.responseError(res, e);
                }
            });
        };
        this.formidable = (req, maxFileSizeMB = 100, maxFieldsSizeMB = 20) => {
            const uploadDir = path.join(__dirname, '..', '..', 'upload');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir);
            }
            return new Promise((resolve, reject) => {
                const form = new formidable_1.IncomingForm({
                    encoding: 'utf-8',
                    uploadDir,
                    keepExtensions: true,
                    maxFileSize: 1024 * 1024 * maxFileSizeMB,
                    maxFieldsSize: 1024 * 1024 * maxFieldsSizeMB,
                    multiples: false,
                });
                form.parse(req, (err, fields, files) => __awaiter(this, void 0, void 0, function* () {
                    logger_1.logger.debug('fields:', fields);
                    // const webps = await this.convertToWebp(_.map(files), 80);
                    resolve({
                        err,
                        params: fields,
                        files
                    });
                }));
            });
        };
        this.convertToWebp = (file, quality = 100, del = true) => __awaiter(this, void 0, void 0, function* () {
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
            if (del) {
                fs.unlink(file.path, (err) => {
                    logger_1.logger.debug('.jpg 삭제');
                });
            }
            return webp;
        });
        this.s3upload3 = ({ key, filePath, uid, bucket }) => {
            return new Promise((resolve, reject) => {
                const params = {
                    Bucket: `${opt_1.default.AWS.Bucket}/${uid}${bucket}`,
                    Key: key,
                    // ACL: 'public-read',
                    ContentType: utils_1.getContentType(filePath),
                    Body: fs.createReadStream(filePath),
                };
                s3.upload(params, (err, data) => {
                    fs.unlink(filePath, (err) => {
                        logger_1.logger.debug(`${filePath} 삭제`);
                    });
                    if (err) {
                        logger_1.logger.error(err);
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        };
        this.s3upload = ({ bucket, key, filePath, uid, subDir }) => {
            return new Promise((resolve, reject) => {
                const params = {
                    // Bucket: `${bucket}/${uid}${subDir}`,
                    Bucket: path.join(bucket, uid, subDir).replace(/\\/g, '/'),
                    Key: key,
                    // ACL: 'public-read',
                    ContentType: utils_1.getContentType(filePath),
                    Body: fs.createReadStream(filePath),
                };
                s3.upload(params, (err, data) => {
                    fs.unlink(filePath, (err) => {
                        logger_1.logger.debug(`${filePath} 삭제`);
                    });
                    if (err) {
                        logger_1.logger.error(err);
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