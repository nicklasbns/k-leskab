import jsSHA from "jssha";
import * as crypto from "crypto";

export function hash(password: string): string {
    var shaObj = new jsSHA("SHA-512", "TEXT");
    shaObj.update(password);
    return shaObj.getHash("HEX");
}

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
});

export function randomUUID(): string {
    return crypto.randomUUID();
}

export function encrypt(data: string): string {
    const encrypted = crypto.publicEncrypt(publicKey, Buffer.from(data));
    return encrypted.toString("base64");
}

export function decrypt(data: string): string {
    const decrypted = crypto.privateDecrypt(privateKey, Buffer.from(data, "base64"));
    return decrypted.toString();
}

export function pubKey(): string {
    return publicKey.export({type: "pkcs1", format: "pem"}).toString();
}

export function sign(data: string): string {
    const sign = crypto.sign("sha256", Buffer.from(data), privateKey);
    return sign.toString("base64");
}

export function verify(data: string, signature: string): boolean {
    return crypto.verify("sha256", Buffer.from(data), publicKey, Buffer.from(signature, "base64"));
}

export function createSession() {
    return crypto.randomBytes(32).toString("hex");
}