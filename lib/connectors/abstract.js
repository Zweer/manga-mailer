"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Connector = void 0;
const axios_1 = __importDefault(require("axios"));
class Connector {
    request = axios_1.default.create();
}
exports.Connector = Connector;
