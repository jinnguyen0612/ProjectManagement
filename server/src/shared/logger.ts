import fs from "fs";
import path from "path";
import { Request } from "express";

const STORES_DIR = path.resolve(__dirname, "../../stores/logs");

const ensureDir = () => {
    if (!fs.existsSync(STORES_DIR)) {
        fs.mkdirSync(STORES_DIR, { recursive: true });
    }
};

const getDateStr = () => {
    const now = new Date();
    return now.toISOString().split("T")[0];
};

const getDateTimeStr = () => {
    return new Date().toISOString().replace("T", " ").substring(0, 19);
};

const getIp = (req?: Request) => {
    if (!req) return "";
    return ` ${req.ip || req.socket.remoteAddress || "unknown"}`;
};

const writeLog = (filename: string, content: string) => {
    ensureDir();
    const filePath = path.join(STORES_DIR, `${filename}-${getDateStr()}.log`);
    fs.appendFileSync(filePath, content + "\n");
};

const formatLog = (level: string, message: string, req?: Request) => {
    const datetime = getDateTimeStr();
    return `[${datetime}]${getIp(req)} [${level}]: ${message}`;
};

// --- Public API ---

export const logError = (message: string, req?: Request) => {
    const line = formatLog("ERROR", message, req);
    console.error(line);
    writeLog("error", line);
};

export const logInfo = (message: string, req?: Request) => {
    const line = formatLog("INFO", message, req);
    console.log(line);
    writeLog("info", line);
};

export const logData = (label: string, data: any, req?: Request) => {
    const json = JSON.stringify(data, null, 2);
    const line = formatLog("DATA", `${label}\n${json}`, req);
    console.log(line);
    writeLog("data", line);
};
