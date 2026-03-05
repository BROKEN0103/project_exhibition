/**
 * Web Crypto API Utility for E2EE
 */

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;

export async function generateKey() {
    return window.crypto.subtle.generateKey(
        { name: ALGORITHM, length: KEY_LENGTH },
        true,
        ["encrypt", "decrypt"]
    );
}

export async function exportKey(key: CryptoKey) {
    const exported = await window.crypto.subtle.exportKey("raw", key);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

export async function importKey(keyData: string) {
    const raw = Uint8Array.from(atob(keyData), (c) => c.charCodeAt(0));
    return window.crypto.subtle.importKey(
        "raw",
        raw,
        ALGORITHM,
        true,
        ["encrypt", "decrypt"]
    );
}

export async function encryptFile(file: File, key: CryptoKey) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const fileData = await file.arrayBuffer();

    const encryptedContent = await window.crypto.subtle.encrypt(
        { name: ALGORITHM, iv },
        key,
        fileData
    );

    return {
        encryptedContent,
        iv: btoa(String.fromCharCode(...iv))
    };
}

export async function decryptFile(encryptedData: ArrayBuffer, key: CryptoKey, ivBase64: string) {
    const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));

    const decryptedContent = await window.crypto.subtle.decrypt(
        { name: ALGORITHM, iv },
        key,
        encryptedData
    );

    return decryptedContent;
}

/**
 * Derives a master key from a password using PBKDF2
 */
export async function deriveMasterKey(password: string, salt: string = "sic-mundus-salt") {
    const encoder = new TextEncoder();
    const baseKey = await window.crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: encoder.encode(salt),
            iterations: 100000,
            hash: "SHA-256"
        },
        baseKey,
        { name: ALGORITHM, length: KEY_LENGTH },
        true,
        ["encrypt", "decrypt"]
    );
}
