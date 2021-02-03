"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const collection_1 = require("../collection");
class SampleCollection extends collection_1.default {
    initialize() {
        this.name = 'sample';
        this.attributes = {
            name: { type: String },
            text: { type: String },
        };
    }
}
exports.default = new SampleCollection();
//# sourceMappingURL=sample.js.map