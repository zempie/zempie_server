"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const collection_1 = require("../collection");
class Sample2Collection extends collection_1.default {
    initialize() {
        this.name = 'sample2';
        this.attributes = {
            name: { type: String },
            text: { type: String },
        };
    }
}
exports.default = new Sample2Collection();
//# sourceMappingURL=sample2.js.map