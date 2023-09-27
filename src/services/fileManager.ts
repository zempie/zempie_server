import { NextFunction, Request, Response } from 'express';
import * as _ from 'lodash';
import * as path from 'path';
import * as fs from 'fs';
import * as AWS from 'aws-sdk';
import * as formidable from 'formidable';
import * as imagemin from 'imagemin';
import * as imageminWebp from 'imagemin-webp';
import { Fields, Files, IncomingForm } from 'formidable';
import Opt from '../../config/opt';
import { getContentType } from "../commons/utils";
import { ManagedUpload } from 'aws-sdk/lib/s3/managed_upload';
import SendData = ManagedUpload.SendData;
import { logger } from '../commons/logger';
import { IS3Upload } from '../controllers/_interfaces';
import { CreateError, ErrorCodes } from '../commons/errorCodes';
import { responseError } from '../controllers/_convert';
import imageManager from './imageManager';
import * as sharp from 'sharp'
import * as exifr from 'exifr'

AWS.config.loadFromPath('config/aws/credentials.json');
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

class FileManager {
    uploadImage = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // const { user } = req;
            const { fields, files }: any = await this.formidable(req, 2000, 2000);
            req.params = { ...req.params, ...fields };
            req.files = files;
            next();
        }
        catch(e : any) {
            responseError(res, e);
        }
    }
    uploadImage2 = (maxFileSizeMB = 100, maxFieldsSizeMB = 20) => {
        return this.uploadFiles(maxFileSizeMB, maxFieldsSizeMB);
    }
    uploadFiles = (maxFileSizeMB = 100, maxFieldsSizeMB = 20) => {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {

                const { err, fields, files }: any = await this.formidable(req, maxFileSizeMB, maxFieldsSizeMB);
                if ( err ) {
                    if ( err.message.includes('maxFileSize') ) {
                        responseError(res, CreateError(ErrorCodes.MAX_FILE_SIZE_EXCEEDED));
                    }
                    else if ( err.message.includes('maxFieldsSize') ) {
                        responseError(res, CreateError(ErrorCodes.MAX_FIELDS_SIZE_EXCEEDED));
                    }
                }
                else {
                    req.params = { ...req.params, ...fields };
                    req.files = files;
                    next();
                }
            }
            catch(e: any) {
                responseError(res, e);
            }
        }
    }


    private formidable = (req: Request, maxFileSizeMB = 100, maxFieldsSizeMB = 20) => {
        const uploadDir = path.join(__dirname, '..', '..', 'upload');
        if( !fs.existsSync(uploadDir) ) {
            fs.mkdirSync(uploadDir);
        }

        return new Promise((resolve, reject) => {
            const form = new IncomingForm({
                encoding: 'utf-8',
                uploadDir,
                keepExtensions: true,
                maxFileSize: 1024 * 1024 * maxFileSizeMB,
                maxFieldsSize: 1024 * 1024 * maxFieldsSizeMB,
                multiples: true,

            } as any);

            form.parse(req, async (err: any, fields: Fields, files: Files) => {
                logger.debug('fields:', fields);

                // const webps = await this.convertToWebp(_.map(files), 80);

                resolve({
                    err,
                    fields,
                    files
                });
            })
        })
    }

    convertToWebp = async (file: any, quality = 100, del = true) => {
        const uploadDir = path.join(__dirname, '..', '..', 'upload');
        if( !fs.existsSync(uploadDir) ) {
            fs.mkdirSync(uploadDir);
        }
        const _filePath = file.path.replace(/\\/gi, '/')
        const webp = await imagemin([_filePath], {
            destination: uploadDir,
            plugins: [
                imageminWebp({ quality })
            ]
        });
        if ( del ) {
            fs.unlink(file.path, (err) => {
                logger.debug('.jpg 삭제');
            })
        }
        return webp;
    }


    // 안쓰는 거 같음..
    s3upload3 = ({ key, filePath, uid, bucket }: IS3Upload) => {
        return new Promise((resolve, reject) => {
            const params = {
                Bucket: `${Opt.AWS.Bucket}/${uid}${bucket}`,
                Key: key,
                // ACL: 'public-read',
                ContentType: getContentType(filePath),
                Body: fs.createReadStream(filePath),
            };

            s3.upload(params, (err: Error, data: SendData) => {
                fs.unlink(filePath, (err) => {
                    logger.debug(`${filePath} 삭제`);
                });

                if (err) {
                    logger.error(err);
                    return reject(err);
                }
                resolve(data);
            })
        })
    }


    s3upload = ({ bucket, key, filePath, uid, subDir }: IS3Upload) => {
        return new Promise((resolve, reject) => {
            const params = {
                // Bucket: `${bucket}/${uid}${subDir}`,
                Bucket: path.join(bucket, uid, subDir).replace(/\\/g, '/'),
                Key: key,
                // ACL: 'public-read',
                ContentType: getContentType(filePath),
                Body: fs.createReadStream(filePath),
            };
            s3.upload(params, (err: Error, data: SendData) => {
                fs.unlink(filePath, (err) => {
                    logger.debug(`${filePath} 삭제`);
                });

                if (err) {
                    logger.error(err);
                    return reject(err);
                }
                resolve(data);
            })

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
        })
    }

    s3upload2 = (Key: string, filePath: string, uid: string, versionPath : string ) => {
        return new Promise((resolve, reject) => {
            const params = {
                Bucket: `${Opt.AWS.Bucket}/${uid}/p/${versionPath}`,
                Key,
                ContentType: getContentType( filePath ),
                // ACL: 'public-read',
                Body: fs.createReadStream(filePath),
            };
            const upload = new AWS.S3.ManagedUpload({ service: s3, params });
            upload.send((err, data) => {
                fs.unlink(filePath, (err) => {
                    console.log('.webp 삭제')
                });

                if (err) {
                    console.error(err);
                    return reject(err);
                }
                resolve(data);
            })
        })
    }

    getS3Img = async () => {
        const bucketName =  Opt.AWS.Bucket.PublicBase
        const prefix = 'v1/img/'

        const params = {
            Bucket: bucketName,
            Prefix: prefix
        };
        
        const result = await s3.listObjectsV2(params).promise();
        const objects = result.Contents
        if(objects){
            const urls = objects
            .map((image) => {
                return {
                    name:image.Key?.replace(prefix, ''),
                    url:`https://${bucketName}.s3.amazonaws.com/${image.Key}`
                }}
            );
                return urls
        }
    }


    getBucketList = async (bucketName : string, prefix: string ) => {
        let params : any = {
            Bucket: bucketName,
            Prefix: prefix,
            Delimiter: '/'
        };

        let result : any
        let objects : any = [];

        try {
                result = await s3.listObjectsV2(params).promise();
                    for (const dir of result.CommonPrefixes) {
                        const uploadDir = '/Users/hyeonjeonglee/projects/zempie/platform-api-server/aws/';
                        params.Prefix = dir.Prefix
                        

                        const dirObj :any = await s3.listObjectsV2(params).promise();
                       
                       const uidDir = path.join(uploadDir + dir.Prefix)

                        if( !fs.existsSync(uidDir ) ) {
                            fs.mkdirSync( uidDir);
                        }

                        for (const dir of dirObj.CommonPrefixes) {
                            if(dir.Prefix?.includes('/c/')){
                                params.Prefix = dir.Prefix

                                const comObj :any = await s3.listObjectsV2(params).promise();
                                const cDir = path.join(uidDir + '/c')

                                if( !fs.existsSync( cDir )) {
                                    fs.mkdirSync( cDir );
                                }

                            for (const dir of comObj.CommonPrefixes) {
                                params.Prefix = dir.Prefix
                                if(dir.Prefix?.includes('/i/')){

                                    const comObj : any = await s3.listObjectsV2(params).promise();
                                    const iDir = path.join(cDir + '/i')

                                    if( !fs.existsSync( iDir )) {
                                        fs.mkdirSync( iDir );
                                    }
                                    for (const obj of comObj.Contents) {

                                        await this.downloadFile(path.join(uploadDir + '/v1/'), params.Bucket, obj.Key)      
                                    }
                                }
                            }

                            }

                        }
                       
                        // await this.downloadFile(params.Bucket, object.Key)
                    }

                objects = objects.concat(result.Contents.slice(1));
                
               
            return objects;
          } catch (error) {
            console.error(error);
            return false;
          }


 
    }

    downloadFile = async (downloadPath: string, bucketName: string, objectKey: string) => {
        await s3.getObject({ Bucket: bucketName, Key: objectKey }, async (err, data) => {
            if (err) {
              console.error('S3 객체 다운로드 오류:', err);
            } else {
              // 다운로드된 데이터를 로컬 파일에 저장


            const fileName = objectKey.replace('v1/', '');
            const localPath = path.join(downloadPath + fileName)

            const image = {
                name: fileName,
                buffer: data.Body
            }
            const resizedImage = await imageManager.resizeImage(image)
            
              fs.writeFile(localPath, resizedImage, (err) => {
                if (err) {
                  console.error('파일 저장 오류:', err);
                } else {
                  console.log('S3 객체 다운로드 완료');
                }
              });
            }
          }).promise();
    }

    orientationToZero = async (file: any) => {
        try{
            const orientation = await exifr.orientation(file.path)
            let rotatedBuffer = null
            switch(orientation) {
                case 2:
                     rotatedBuffer = await sharp(file.path)
                    .flop(true)
                    .toBuffer()
                    break;
                case 3:
                    rotatedBuffer = await sharp(file.path)
                    .rotate(-180)
                    .toBuffer()
                    break;
                case 4:
                    rotatedBuffer = await sharp(file.path)
                    .flip(true)
                    .toBuffer()
                    break;
                case 5:
                    rotatedBuffer = await sharp(file.path)
                    .flop(true)
                    .rotate(270)
                    .toBuffer()
                    break;
                case 6:
                    rotatedBuffer = await sharp(file.path)
                    .rotate(90)
                    .toBuffer()
                    break;
                case 7:
                    rotatedBuffer = await sharp(file.path)
                    .flop(true)
                    .rotate(90)
                    .toBuffer()
                    break;
                case 8:
                    rotatedBuffer = await sharp(file.path)
                    .rotate(270)
                    .toBuffer()
                    break;
            }

            fs.writeFile(file.path, rotatedBuffer, (err) => {
                if (err) {
                  console.error('파일 저장 오류:', err);
                } else {
                  console.log('rotated file 저장');
                }
              });
           
            

      return await exifr.orientation(file.path)

        }catch(err){
            console.log(err)
        }

        
    }

}


export default new FileManager()
