import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface SecurityContextType {
  isLocked: boolean;
  hasPin: boolean;
  unlock: (pin: string) => Promise<boolean>;
  setupPin: (pin: string) => Promise<void>;
  lock: () => void;
  encrypt: (data: any) => Promise<string>;
  decrypt: (encrypted: string) => Promise<any>;
}

const SecurityContext = createContext<SecurityContextType | null>(null);

const CONFIG = {
  ITER: 100000,
  KEY_LEN: 256,
  SALT_LEN: 16,
  IV_LEN: 12,
  TAG_LEN: 128,
  PREFIX: '6s_sec_',
};

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLocked, setIsLocked] = useState(true);
  const [hasPin, setHasPin] = useState(false);
  const [key, setKey] = useState<CryptoKey | null>(null);

  useEffect(() => {
    if (!window.crypto || !window.crypto.subtle) {
      console.warn('Crypto Subtle is not available. This environment may not be secure or is running as a local file.');
    }
    const pinExists = localStorage.getItem('6s_auth_ok') === 'true';
    setHasPin(pinExists);
  }, []);

  const b64 = (buf: ArrayBuffer) => {
    const b = new Uint8Array(buf);
    let s = '';
    for (let i = 0; i < b.byteLength; i++) s += String.fromCharCode(b[i]);
    return btoa(s);
  };

  const unb64 = (s: string) => {
    const b = atob(s);
    const a = new Uint8Array(b.length);
    for (let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i);
    return a;
  };

  const deriveKey = async (pin: string, salt: Uint8Array) => {
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error('Crypto Subtle is not available in this environment.');
    }
    const encoder = new TextEncoder();
    const km = await crypto.subtle.importKey(
      'raw',
      encoder.encode(pin),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: CONFIG.ITER, hash: 'SHA-256' },
      km,
      { name: 'AES-GCM', length: CONFIG.KEY_LEN },
      false,
      ['encrypt', 'decrypt']
    );
  };

  const setupPin = async (pin: string) => {
    if (!window.crypto || !window.crypto.subtle) {
      localStorage.setItem('6s_auth_ok', 'true');
      setIsLocked(false);
      setHasPin(true);
      return;
    }
    const salt = crypto.getRandomValues(new Uint8Array(CONFIG.SALT_LEN));
    const derivedKey = await deriveKey(pin, salt);
    
    const iv = crypto.getRandomValues(new Uint8Array(CONFIG.IV_LEN));
    const encoder = new TextEncoder();
    const vfData = encoder.encode(JSON.stringify({ v: '6S_V2' }));
    const ct = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv, tagLength: CONFIG.TAG_LEN },
      derivedKey,
      vfData
    );

    localStorage.setItem('6s_auth_salt', b64(salt));
    localStorage.setItem('6s_auth_vf', JSON.stringify({
      iv: b64(iv),
      data: b64(ct)
    }));
    localStorage.setItem('6s_auth_ok', 'true');
    
    setKey(derivedKey);
    setIsLocked(false);
    setHasPin(true);
  };

  const unlock = async (pin: string) => {
    if (!window.crypto || !window.crypto.subtle) {
      setIsLocked(false);
      return true;
    }
    try {
      const saltStr = localStorage.getItem('6s_auth_salt');
      const vfStr = localStorage.getItem('6s_auth_vf');
      if (!saltStr || !vfStr) return false;

      const salt = unb64(saltStr);
      const vf = JSON.parse(vfStr);
      const derivedKey = await deriveKey(pin, salt);
      
      const iv = unb64(vf.iv);
      const data = unb64(vf.data);
      const pt = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv, tagLength: CONFIG.TAG_LEN },
        derivedKey,
        data
      );

      const res = JSON.parse(new TextDecoder().decode(pt));
      if (res.v === '6S_V2') {
        setKey(derivedKey);
        setIsLocked(false);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Unlock failed', e);
      return false;
    }
  };

  const lock = useCallback(() => {
    setKey(null);
    setIsLocked(true);
  }, []);

  const encrypt = async (data: any) => {
    if (!window.crypto || !window.crypto.subtle) return JSON.stringify(data);
    if (!key) throw new Error('Locked');
    const iv = crypto.getRandomValues(new Uint8Array(CONFIG.IV_LEN));
    const encoder = new TextEncoder();
    const ct = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv, tagLength: CONFIG.TAG_LEN },
      key,
      encoder.encode(JSON.stringify(data))
    );
    return JSON.stringify({ iv: b64(iv), data: b64(ct) });
  };

  const decrypt = async (encrypted: string) => {
    if (!window.crypto || !window.crypto.subtle) {
      try { return JSON.parse(encrypted); } catch { return encrypted; }
    }
    if (!key) throw new Error('Locked');
    const obj = JSON.parse(encrypted);
    const iv = unb64(obj.iv);
    const data = unb64(obj.data);
    const pt = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv, tagLength: CONFIG.TAG_LEN },
      key,
      data
    );
    return JSON.parse(new TextDecoder().decode(pt));
  };

  return (
    <SecurityContext.Provider value={{ isLocked, hasPin, unlock, setupPin, lock, encrypt, decrypt }}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) throw new Error('useSecurity must be used within SecurityProvider');
  return context;
};
