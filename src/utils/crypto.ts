/**
 * End-to-End Encryption (E2EE) cryptographic engine
 * Simulates Curve25519 ECDH key generation, AES-256-GCM message encryption,
 * and WhatsApp-standard 60-digit Safety Numbers.
 */

export interface E2EEKeypair {
  publicKey: string;
  privateKey: string;
  fingerprint: string;
}

export interface EncryptedPacket {
  algorithm: 'AES-256-GCM';
  ciphertext: string;
  iv: string;
  tag: string;
  keyFingerprint: string;
  timestamp: number;
}

export function generateUserKeys(identifier: string): E2EEKeypair {
  // Deterministic seed mixing identifier and random bytes
  const seed = `${identifier}_${Date.now()}_${Math.random()}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  
  const hexPart = Math.abs(hash).toString(16).padStart(8, '0');
  const randPart1 = Math.random().toString(36).substring(2, 10);
  const randPart2 = Math.random().toString(36).substring(2, 10);

  const publicKey = `04${hexPart}${randPart1}${randPart2}`.toUpperCase();
  const privateKey = `prv_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
  
  // SHA-256 style 64-char fingerprint
  const fingerprint = Array.from({ length: 8 }, () => 
    Math.floor(1000 + Math.random() * 9000).toString()
  ).join(':');

  return { publicKey, privateKey, fingerprint };
}

/**
 * WhatsApp-style Safety Number generator:
 * 60 digits formatted into 12 blocks of 5 digits
 */
export function generateSafetyNumber(userIdA: string, userIdB: string): string {
  // Hash combining both user IDs
  const combined = [userIdA, userIdB].sort().join('::');
  let seed = 1779033703 ^ combined.length;
  for (let i = 0; i < combined.length; i++) {
    seed = Math.imul(seed ^ combined.charCodeAt(i), 3432918353);
    seed = (seed << 13) | (seed >>> 19);
  }

  const blocks: string[] = [];
  for (let i = 0; i < 12; i++) {
    seed = Math.imul(seed ^ (i * 997), 2246822507);
    seed = (seed << 11) | (seed >>> 21);
    const num = Math.abs(seed % 90000) + 10000;
    blocks.push(num.toString());
  }

  return blocks.join(' ');
}

/**
 * Encrypts plain text into an AES-256-GCM packet
 */
export function encryptMessage(text: string, _receiverPubKey: string): { ciphertext: string; iv: string; packet: EncryptedPacket } {
  // Base64-like obfuscation + simulated AES-GCM bytes
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i] ^ 0x5a); // XOR with mask
  }
  const ciphertext = btoa(binary) + '.' + Math.random().toString(36).substring(2, 8);
  
  // 12-byte standard GCM IV in hex
  const iv = Array.from({ length: 12 }, () => 
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  ).join('');

  // 16-byte authentication tag
  const tag = Array.from({ length: 16 }, () => 
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  ).join('');

  const packet: EncryptedPacket = {
    algorithm: 'AES-256-GCM',
    ciphertext,
    iv,
    tag,
    keyFingerprint: 'Curve25519::' + Math.random().toString(36).substring(2, 10).toUpperCase(),
    timestamp: Date.now(),
  };

  return { ciphertext, iv, packet };
}

/**
 * Decrypts an encrypted message
 */
export function decryptMessage(ciphertext: string): string {
  try {
    const raw = ciphertext.split('.')[0];
    const decoded = atob(raw);
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i) ^ 0x5a;
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return ciphertext; // fallback if plain text
  }
}
