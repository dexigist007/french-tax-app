
// Utility for encoding/decoding
const enc = new TextEncoder();
const dec = new TextDecoder();

export interface EncryptionKey {
  key: CryptoKey;
  salt: Uint8Array;
}

/**
 * Generates a secure random salt
 */
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

/**
 * Generates a secure random IV (Initialization Vector)
 */
export function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12)); // 12 bytes for AES-GCM
}

/**
 * Derives a key from a password using PBKDF2
 */
export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false, // key is not exportable
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts data using AES-GCM
 */
export async function encryptData(data: string, key: CryptoKey): Promise<{ cipherText: Uint8Array; iv: Uint8Array }> {
  const iv = generateIV();
  const encodedData = enc.encode(data);

  const cipherTextBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as BufferSource,
    },
    key,
    encodedData
  );

  return {
    cipherText: new Uint8Array(cipherTextBuffer),
    iv: iv,
  };
}

/**
 * Decrypts data using AES-GCM
 */
export async function decryptData(cipherText: Uint8Array, iv: Uint8Array, key: CryptoKey): Promise<string> {
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv as BufferSource,
    },
    key,
    cipherText as BufferSource
  );

  return dec.decode(decryptedBuffer);
}

/**
 * Helper to convert buffer to base64 string for storage
 */
export function bufferToBase64(buffer: Uint8Array): string {
  let binary = '';
  const len = buffer.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary);
}

/**
 * Helper to convert base64 string to buffer
 */
export function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
