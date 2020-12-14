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
const host = `http://localhost:8088`;
const api_version = `api/v1`;
class DeployApp {
    initialize(options) {
        this.options = options;
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            this._game = new Game(options);
        }));
    }
    get game() {
        if (this._game) {
            return this._game;
        }
    }
}
exports.default = new DeployApp();
class Game {
    constructor(options) {
        this.options = options;
    }
    getList() {
        return __awaiter(this, void 0, void 0, function* () {
            const input = `${host}/${api_version}`;
            yield fetch(input, {});
        });
    }
}
//# sourceMappingURL=deployApp.js.map