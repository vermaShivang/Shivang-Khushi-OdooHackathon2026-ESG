import crypto from 'crypto';

const SESSION_SECRET = 'ecosphere_hackathon_super_secret_key_2026'; // Secret key for AES encryption

// 1. Password Hashing (PBKDF2)
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, originalHash] = storedHash.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}

// 2. AES-256-CBC Session Encryption (Tamper-proof Cookies)
export function encryptSession(data) {
  const text = JSON.stringify(data);
  const iv = crypto.randomBytes(16);
  // Key must be 32 bytes for aes-256-cbc. Hash our secret to guarantee 32 bytes
  const key = crypto.createHash('sha256').update(SESSION_SECRET).digest();
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

export function decryptSession(token) {
  try {
    if (!token || !token.includes(':')) return null;
    const [ivHex, encrypted] = token.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto.createHash('sha256').update(SESSION_SECRET).digest();
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  } catch (err) {
    console.error('Session decryption failed:', err.message);
    return null;
  }
}
