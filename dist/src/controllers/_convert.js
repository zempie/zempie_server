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
const _ = require("lodash");
function convert(func, middleware = false) {
    function response(res, result) {
        res.header('Last-Modified', (new Date()).toUTCString());
        if (result instanceof Error) {
            return res.status(400).send({
                // data: result,
                error: result.message,
            });
        }
        return res.status(200).send({
            result: result || {}
        });
    }
    return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const params = _.assignIn({}, req.body, req.query, req.params);
            // const user = req.user? _.assignIn({}, req.user) : null
            const result = yield func(params, req.user, { req, res });
            if (middleware) {
                return next();
            }
            response(res, result);
        }
        catch (e) {
            response(res, e);
        }
    });
}
exports.default = convert;
//# sourceMappingURL=_convert.js.map