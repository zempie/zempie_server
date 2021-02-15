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
const mongoose = require("mongoose");
const mongoose_1 = require("mongoose");
class Collection {
    // private db!: Db;
    constructor() {
        this.attributes = {};
        this.initialize();
        this.attributes.deleted_at = { type: String };
        this.schema = new mongoose_1.Schema(this.attributes, { versionKey: false, timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
        this.model = mongoose.model(this.name, this.schema);
    }
    getName() { return this.name; }
    afterSync() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    getTransaction(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            // const session = await this.model.startSession();
            // await session.withTransaction(async () => {
            //     await callback(session);
            // })
            const session = yield mongoose.startSession();
            session.startTransaction();
            yield callback(session);
            session.endSession();
        });
    }
    create(query, session) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model.create([query], { session });
        });
    }
    findOne(query, options) {
        return __awaiter(this, void 0, void 0, function* () { query.deleted_at = null; return this.model.findOne(query, null, options); });
    }
    findAll(query, options) {
        return __awaiter(this, void 0, void 0, function* () { query.deleted_at = null; return this.model.find(query, null, options); });
    }
    destroy(query) {
        return __awaiter(this, void 0, void 0, function* () { yield this.model.updateOne(query, { deleted_at: Date.now() }); });
    }
    bulkCreate(bulk, options) {
        return __awaiter(this, void 0, void 0, function* () { yield this.model.insertMany(bulk); });
    }
}
exports.default = Collection;
//# sourceMappingURL=collection.js.map