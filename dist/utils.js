"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.post = exports.doesAnyPatternMatch = exports.split_message = void 0;
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
function split_message(files) {
    files = files || "";
    let n = files.includes('\n') || files.includes('\r');
    files = files.trim();
    let res = [];
    if (files) {
        if (n) {
            res = files.split(/[\r\n]/);
        }
        else {
            res = files.split(",");
        }
    }
    return res.map(str => str.trim()).filter(item => item !== null && item !== undefined && item !== "");
}
exports.split_message = split_message;
function doesAnyPatternMatch(patterns, str) {
    // 遍历正则表达式数组
    return patterns.some(pattern => {
        // 创建正则表达式对象，匹配模式
        const regex = new RegExp(pattern);
        // 测试字符串是否与正则表达式匹配
        return regex.test(str);
    });
}
exports.doesAnyPatternMatch = doesAnyPatternMatch;
/**
 * post data
 * @param url url
 * @param body post data
 * @param header post header
 * @param json is json res
 */
async function post({ url, body, header, json }) {
    return new Promise((resolve, reject) => {
        json = typeof json === "boolean" ? json : true;
        const data = typeof body === "string" ? body : JSON.stringify(body);
        let url_ = new URL(url);
        header = header || {};
        header['Content-Type'] = header['Content-Type'] || 'application/json';
        header['Content-Length'] = Buffer.byteLength(data);
        const options = {
            hostname: url_.hostname,
            path: url_.pathname + (url_.search || ''),
            method: 'POST',
            headers: header
        };
        // noinspection DuplicatedCode
        const req = (url_.protocol === "http:" ? http_1.default : https_1.default).request(options, (res) => {
            let responseBody = '';
            // !!! 添加这一行来显式设置响应编码 !!!
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                responseBody += chunk;
            });
            res.on('end', () => {
                console.log("--- [Action Debug] Received full response body ---");
                console.log(responseBody);
                console.log("--- [Action Debug] End of response body sample ---");
                try {
                    if (json) {
                        resolve(JSON.parse(responseBody));
                    }
                    else {
                        resolve(responseBody);
                    }
                }
                catch (error) {
                    console.error("--- [Action Debug] JSON Parse Error ---");
                    console.error("Error message:", error.message);
                    // 打印导致失败的响应体片段
                    console.error("Response body that failed parsing (first 1000 chars):", responseBody);
                    reject(new Error('Failed to parse JSON response'));
                }
            });
        });
        req.on('error', (error) => {
            reject(new Error(`Request failed: ${error.message}`));
        });
        req.write(data);
        req.end();
    });
}
exports.post = post;
