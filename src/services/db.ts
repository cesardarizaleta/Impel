import { Platform } from 'react-native';
import { Account, Message } from '@/hooks/use-vault';

export interface DatabaseService {
  init(): Promise<void>;
  getAccounts(): Promise<Account[]>;
  saveAccount(account: Account): Promise<void>;
  deleteAccount(id: string): Promise<void>;
  updateAccount(account: Account): Promise<void>;
  getMessages(): Promise<Message[]>;
  saveMessage(message: Message): Promise<void>;
  clearMessages(): Promise<void>;
}

// 1. Web LocalStorage Implementation
class LocalStorageDB implements DatabaseService {
  async init() {
    // LocalStorage doesn't require schema initialization
  }

  async getAccounts(): Promise<Account[]> {
    try {
      const data = localStorage.getItem('impel_accounts');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async saveAccount(account: Account): Promise<void> {
    const accounts = await this.getAccounts();
    const index = accounts.findIndex(a => a.id === account.id);
    if (index >= 0) {
      accounts[index] = account;
    } else {
      accounts.push(account);
    }
    localStorage.setItem('impel_accounts', JSON.stringify(accounts));
  }

  async deleteAccount(id: string): Promise<void> {
    const accounts = await this.getAccounts();
    const filtered = accounts.filter(a => a.id !== id);
    localStorage.setItem('impel_accounts', JSON.stringify(filtered));
  }

  async updateAccount(account: Account): Promise<void> {
    await this.saveAccount(account);
  }

  async getMessages(): Promise<Message[]> {
    try {
      const data = localStorage.getItem('impel_chat_messages');
      if (data) {
        const parsed = JSON.parse(data);
        return parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }));
      }
      return [];
    } catch {
      return [];
    }
  }

  async saveMessage(message: Message): Promise<void> {
    const messages = await this.getMessages();
    messages.push(message);
    localStorage.setItem('impel_chat_messages', JSON.stringify(messages));
  }

  async clearMessages(): Promise<void> {
    localStorage.removeItem('impel_chat_messages');
  }
}

// 2. Native SQLite Implementation
class SQLiteDB implements DatabaseService {
  private db: any = null;

  async init() {
    if (this.db) return;
    const SQLite = require('expo-sqlite');
    this.db = SQLite.openDatabaseSync('impel.db');

    // Create tables
    await this.db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        username TEXT NOT NULL,
        password TEXT,
        strength TEXT NOT NULL,
        logo TEXT NOT NULL,
        strengthText TEXT NOT NULL,
        isFavorite INTEGER DEFAULT 0,
        customFields TEXT,
        logoUrl TEXT
      );
      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY NOT NULL,
        sender TEXT NOT NULL,
        text TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        suggestions TEXT,
        accountId TEXT
      );
    `);
    
    // Add column if it doesn't exist
    try {
      await this.db.execAsync('ALTER TABLE accounts ADD COLUMN logoUrl TEXT;');
    } catch {
      // Ignore if column already exists
    }
  }

  async getAccounts(): Promise<Account[]> {
    if (!this.db) await this.init();
    const rows = await this.db.getAllAsync('SELECT * FROM accounts');
    return rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      username: row.username,
      password: row.password || undefined,
      strength: row.strength,
      logo: row.logo,
      strengthText: row.strengthText,
      isFavorite: row.isFavorite === 1,
      customFields: row.customFields ? JSON.parse(row.customFields) : undefined,
      logoUrl: row.logoUrl || undefined,
    }));
  }

  async saveAccount(account: Account): Promise<void> {
    if (!this.db) await this.init();
    await this.db.runAsync(
      `INSERT OR REPLACE INTO accounts (id, name, username, password, strength, logo, strengthText, isFavorite, customFields, logoUrl)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        account.id,
        account.name,
        account.username,
        account.password || null,
        account.strength,
        account.logo,
        account.strengthText,
        account.isFavorite ? 1 : 0,
        account.customFields ? JSON.stringify(account.customFields) : null,
        account.logoUrl || null,
      ]
    );
  }

  async deleteAccount(id: string): Promise<void> {
    if (!this.db) await this.init();
    await this.db.runAsync('DELETE FROM accounts WHERE id = ?', [id]);
  }

  async updateAccount(account: Account): Promise<void> {
    await this.saveAccount(account);
  }

  async getMessages(): Promise<Message[]> {
    if (!this.db) await this.init();
    const rows = await this.db.getAllAsync('SELECT * FROM chat_messages ORDER BY timestamp ASC');
    return rows.map((row: any) => ({
      id: row.id,
      sender: row.sender,
      text: row.text,
      timestamp: new Date(row.timestamp),
      suggestions: row.suggestions ? JSON.parse(row.suggestions) : undefined,
      accountId: row.accountId || undefined,
    }));
  }

  async saveMessage(message: Message): Promise<void> {
    if (!this.db) await this.init();
    await this.db.runAsync(
      `INSERT OR REPLACE INTO chat_messages (id, sender, text, timestamp, suggestions, accountId)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        message.id,
        message.sender,
        message.text,
        message.timestamp.getTime(),
        message.suggestions ? JSON.stringify(message.suggestions) : null,
        message.accountId || null,
      ]
    );
  }

  async clearMessages(): Promise<void> {
    if (!this.db) await this.init();
    await this.db.runAsync('DELETE FROM chat_messages');
  }
}

// Export the singleton service based on platform
export const db: DatabaseService = Platform.OS === 'web' ? new LocalStorageDB() : new SQLiteDB();
