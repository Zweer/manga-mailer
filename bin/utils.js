"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReadMangas = getReadMangas;
exports.putReadMangas = putReadMangas;
const fs_1 = require("fs");
const path_1 = require("path");
const mangasPath = (0, path_1.join)(__dirname, '..', 'data', 'mangas.json');
function getReadMangas() {
    const readMangasStr = (0, fs_1.readFileSync)(mangasPath, 'utf8');
    return JSON.parse(readMangasStr);
}
function putReadMangas(readMangas) {
    (0, fs_1.writeFileSync)(mangasPath, JSON.stringify(readMangas, null, 2));
}
