"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const XLSX = require("xlsx");
const path = require("path");
const filename = path.join(__dirname, './badwords.xlsx');
class XlsxLoader {
    constructor() {
        this.doc = [];
        this.colNames = {};
        // this.readFile(filename);
    }
    readFile(filename) {
        // this.doc = [];
        const colNames = {};
        const sheets = {};
        const xlsx = XLSX.readFile(filename);
        // self.sheets = self.xlsx.Sheets;
        xlsx.SheetNames.forEach((sheetName) => {
            const result = [];
            const sheet = xlsx.Sheets[sheetName];
            if (!sheet['!ref']) {
                return;
            }
            const range = XLSX.utils.decode_range(sheet['!ref']);
            for (let r = range.s.r; r <= range.e.r; r++) {
                const row = [];
                for (let c = range.s.c; c <= range.e.c; c++) {
                    const cell = sheet[XLSX.utils.encode_cell({ r: r, c: c })];
                    if (typeof cell !== 'undefined') {
                        if (r === 0) {
                            colNames[cell.w] = c;
                        }
                        else {
                            row.push(cell.w.trim());
                        }
                    }
                    // else {
                    //     row.push(void 0);
                    // }
                }
                if (r !== 0) {
                    result.push(row);
                }
            }
            // self.doc.push(result);
            // this.sheets = this.sheets || {};
            sheets[sheetName] = result;
        });
        return {
            sheetNames: xlsx.SheetNames,
            sheets,
            colNames
        };
    }
}
exports.default = new XlsxLoader();
//# sourceMappingURL=xlsxLoader.js.map