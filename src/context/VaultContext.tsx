'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';
import toast from 'react-hot-toast';

// Types
export interface CardType {
  id: string;
  cardName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardType: string;
  createdAt: string;
  userId: string;
}

export interface PasswordType {
  id: string;
  website: string;
  username: string;
  password: string;
  lastUpdated: string;
  userId: string;
}

export interface FileType {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  description: string;
  uploadDate: string;
  userId: string;
}

type CardInput = Omit<CardType, 'id' | 'createdAt' | 'userId'>;
type PasswordInput = Omit<PasswordType, 'id' | 'lastUpdated' | 'userId'>;

interface VaultContextType {
  cards: CardType[];
  passwords: PasswordType[];
  files: FileType[];
  addCard: (card: CardInput) => Promise<void>;
  updateCard: (id: string, card: CardInput) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  addPassword: (password: PasswordInput) => Promise<void>;
  updatePassword: (id: string, password: PasswordInput) => Promise<void>;
  deletePassword: (id: string) => Promise<void>;
  addFile: (file: File, description: string) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  isLoading: boolean;
}

const MAX_FILE_BYTES = 4 * 1024 * 1024;

const VaultContext = createContext<VaultContextType | undefined>(undefined);

// Small fetch wrapper: sends JSON (or FormData as-is) and turns error
// responses into Errors carrying the server's message.
async function api<T>(url: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (typeof init.body === 'string') headers['Content-Type'] = 'application/json';
  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    let message = 'Something went wrong. Please try again.';
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      /* keep the default message */
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

// ---- One-time move of data saved in this browser before the app had a backend ----

function readLocalList(key: string): any[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeLocalList(key: string, list: any[]) {
  if (list.length === 0) localStorage.removeItem(key);
  else localStorage.setItem(key, JSON.stringify(list));
}

async function importLocalData(userId: string): Promise<{ moved: number; left: number }> {
  const keys = {
    cards: `vault_cards_${userId}`,
    passwords: `vault_passwords_${userId}`,
    files: `vault_files_${userId}`,
  };
  const cards = readLocalList(keys.cards);
  const passwords = readLocalList(keys.passwords);
  const files = readLocalList(keys.files);
  let moved = 0;
  let left = 0;

  if (cards.length || passwords.length) {
    const result = await api<{ cards: number[]; passwords: number[]; skipped: number }>('/api/import', {
      method: 'POST',
      body: JSON.stringify({ cards, passwords }),
    });
    // Remove only what the server saved; anything it rejected stays so nothing is lost.
    writeLocalList(keys.cards, cards.filter((_, i) => !result.cards.includes(i)));
    writeLocalList(keys.passwords, passwords.filter((_, i) => !result.passwords.includes(i)));
    moved += result.cards.length + result.passwords.length;
    left += result.skipped;
  }

  if (files.length) {
    const remaining: any[] = [];
    for (const f of files) {
      try {
        const blob = await (await fetch(f.fileData)).blob();
        if (blob.size > MAX_FILE_BYTES) throw new Error('too large');
        const form = new FormData();
        form.append('file', new File([blob], f.fileName, { type: f.fileType }));
        form.append('description', f.description ?? '');
        await api('/api/files', { method: 'POST', body: form });
        moved++;
      } catch {
        remaining.push(f);
        left++;
      }
    }
    writeLocalList(keys.files, remaining);
  }

  return { moved, left };
}

export function VaultProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser();
  const [cards, setCards] = useState<CardType[]>([]);
  const [passwords, setPasswords] = useState<PasswordType[]>([]);
  const [files, setFiles] = useState<FileType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const importedFor = useRef<string | null>(null);

  const userId = user?.id ?? null;

  const loadAll = useCallback(async () => {
    const [c, p, f] = await Promise.all([
      api<CardType[]>('/api/cards'),
      api<PasswordType[]>('/api/passwords'),
      api<FileType[]>('/api/files'),
    ]);
    setCards(c);
    setPasswords(p);
    setFiles(f);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    if (!userId) {
      setCards([]);
      setPasswords([]);
      setFiles([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        if (importedFor.current !== userId) {
          importedFor.current = userId;
          try {
            const { moved, left } = await importLocalData(userId);
            if (!cancelled && moved > 0) toast.success(`Moved ${moved} saved item${moved === 1 ? '' : 's'} from this browser into your vault`);
            if (!cancelled && left > 0) toast.error(`${left} item${left === 1 ? '' : 's'} could not be moved and ${left === 1 ? 'is' : 'are'} still stored only in this browser`);
          } catch (error) {
            console.error('Could not import local data:', error);
          }
        }
        await loadAll();
      } catch (error) {
        console.error('Error loading vault:', error);
        if (!cancelled) toast.error('Could not load your vault. Please refresh the page.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, isLoaded, loadAll]);

  // Card operations
  const addCard = async (card: CardInput) => {
    const created = await api<CardType>('/api/cards', { method: 'POST', body: JSON.stringify(card) });
    setCards((prev) => [...prev, created]);
  };

  const updateCard = async (id: string, card: CardInput) => {
    const updated = await api<CardType>(`/api/cards/${id}`, { method: 'PUT', body: JSON.stringify(card) });
    setCards((prev) => prev.map((c) => (c.id === id ? updated : c)));
  };

  const deleteCard = async (id: string) => {
    await api(`/api/cards/${id}`, { method: 'DELETE' });
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  // Password operations
  const addPassword = async (password: PasswordInput) => {
    const created = await api<PasswordType>('/api/passwords', { method: 'POST', body: JSON.stringify(password) });
    setPasswords((prev) => [...prev, created]);
  };

  const updatePassword = async (id: string, password: PasswordInput) => {
    const updated = await api<PasswordType>(`/api/passwords/${id}`, { method: 'PUT', body: JSON.stringify(password) });
    setPasswords((prev) => prev.map((p) => (p.id === id ? updated : p)));
  };

  const deletePassword = async (id: string) => {
    await api(`/api/passwords/${id}`, { method: 'DELETE' });
    setPasswords((prev) => prev.filter((p) => p.id !== id));
  };

  // File operations
  const addFile = async (file: File, description: string) => {
    if (file.size > MAX_FILE_BYTES) throw new Error('File size must be less than 4MB');
    const form = new FormData();
    form.append('file', file);
    form.append('description', description);
    const created = await api<FileType>('/api/files', { method: 'POST', body: form });
    setFiles((prev) => [...prev, created]);
  };

  const deleteFile = async (id: string) => {
    await api(`/api/files/${id}`, { method: 'DELETE' });
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <VaultContext.Provider
      value={{
        cards,
        passwords,
        files,
        addCard,
        updateCard,
        deleteCard,
        addPassword,
        updatePassword,
        deletePassword,
        addFile,
        deleteFile,
        isLoading,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const context = useContext(VaultContext);
  if (context === undefined) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
}
