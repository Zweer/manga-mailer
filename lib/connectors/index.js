"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectors = void 0;
const manga_park_1 = require("./manga-park");
exports.connectors = {
    mangapark: new manga_park_1.MangaParkConnector(),
};
