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
exports.fetchHelper = void 0;
const globals_1 = require("../commons/globals");
function refreshAccessToken() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch('http://localhost:8088/api/v1/refresh-token', {
            headers: {
                Authorization: `Bearer ${globals_1.service.refresh_token}`
            }
        });
        const json = response.json();
        if (json.data && json.data.access_token) {
            globals_1.service.access_token = json.data.access_token;
        }
    });
}
const fetchHelper = (input, init) => __awaiter(void 0, void 0, void 0, function* () {
    const _init = Object.assign({}, {
        headers: {
            Authorization: `Bearer ${globals_1.service.access_token}`
        }
    }, init);
    const response = yield fetch(input, _init);
    const json = yield response.json();
    if (json.error) {
        if (json.error === 'invalid token') {
            yield refreshAccessToken();
            return yield (0, exports.fetchHelper)(input, init);
        }
    }
    return json.error || json.data;
});
exports.fetchHelper = fetchHelper;
//# sourceMappingURL=fetchHelper.js.map