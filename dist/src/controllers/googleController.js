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
const path = require('path');
const { TranslationServiceClient } = require('@google-cloud/translate');
const projectId = 'zempie-dev';
const location = 'global';
class GoogleController {
    constructor() {
        this.detectLanguage = (text) => __awaiter(this, void 0, void 0, function* () {
            const translationClient = new TranslationServiceClient();
            const request = {
                parent: `projects/${projectId}/locations/${location}`,
                content: text,
            };
            const [response] = yield translationClient.detectLanguage(request);
            return response.languages;
        });
        this.translateText = (params) => __awaiter(this, void 0, void 0, function* () {
            const translationClient = new TranslationServiceClient();
            const { languageCode, confidence } = yield this.detectLanguage(params.text);
            const request = {
                parent: `projects/${projectId}/locations/${location}`,
                contents: [params.text],
                mimeType: 'text/html',
                sourceLanguageCode: languageCode,
                targetLanguageCode: params.target,
            };
            const [response] = yield translationClient.translateText(request);
            for (const translation of response.translations) {
                console.log(`Translation: ${translation.translatedText}`);
            }
            return response;
        });
    }
}
exports.default = new GoogleController();
//# sourceMappingURL=googleController.js.map