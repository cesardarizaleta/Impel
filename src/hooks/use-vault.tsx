import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { db } from '@/services/db';

export type PasswordStrength = 'safe' | 'weak' | 'leaked';

export interface CustomField {
  label: string;
  value: string;
}

export interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
  suggestions?: string[];
  accountId?: string;
}

export interface Account {
  id: string;
  name: string;
  username: string;
  password?: string;
  strength: PasswordStrength;
  logo: 'netflix' | 'google' | 'github' | 'spotify' | 'adobe' | 'epicgames' | 'generic';
  strengthText: string;
  isFavorite?: boolean;
  customFields?: CustomField[];
  logoUrl?: string;
}

export interface AuditFinding {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium';
  remedy: string;
  affectedAccounts: string[]; // Account IDs
  isFixed: boolean;
}

interface VaultContextType {
  isUnlocked: boolean;
  isUnlocking: boolean;
  searchQuery: string;
  selectedFilter: 'All' | 'Leaked' | 'Weak' | 'Safe';
  accounts: Account[];
  findings: AuditFinding[];
  activeTab: 'unlock' | 'vault' | 'audit';
  securityScore: number;
  isAddOpen: boolean;
  unlock: () => Promise<boolean>;
  lock: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedFilter: (filter: 'All' | 'Leaked' | 'Weak' | 'Safe') => void;
  setActiveTab: (tab: 'unlock' | 'vault' | 'audit') => void;
  toggleFavorite: (id: string) => void;
  fixAllRisks: () => Promise<void>;
  fixSingleFinding: (findingId: string) => Promise<void>;
  setIsAddOpen: (isOpen: boolean) => void;
  addAccount: (
    name: string,
    username: string,
    strength: PasswordStrength,
    strengthText: string,
    customFields?: CustomField[],
    password?: string
  ) => void;
  deleteAccount: (id: string) => void;
  updateAccount: (account: Account) => Promise<void>;
  fixSingleAccount: (accountId: string) => void;
  isLoggedIn: boolean;
  loginTime: number | null;
  appLogin: () => Promise<boolean>;
  appLogout: () => void;
  setLoginTime: (time: number | null) => void;
  chatMessages: Message[];
  setChatMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  selectedDetailAccount: Account | null;
  setSelectedDetailAccount: (account: Account | null) => void;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

const INITIAL_ACCOUNTS: Account[] = [];

const INITIAL_FINDINGS: AuditFinding[] = [];

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Leaked' | 'Weak' | 'Safe'>('All');
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [findings, setFindings] = useState<AuditFinding[]>(INITIAL_FINDINGS);
  const [activeTab, setActiveTab] = useState<'unlock' | 'vault' | 'audit'>('unlock');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginTime, setLoginTime] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: '¡Hola! Soy tu asistente de Impel. ¿Qué credencial estás buscando hoy? Escribe el nombre de la plataforma (ej. "mercantil" o "netflix").',
      timestamp: new Date(),
      suggestions: ['netflix', 'google', 'spotify'],
    },
  ]);
  const [selectedDetailAccount, setSelectedDetailAccount] = useState<Account | null>(null);

  // Load persisted database data on mount
  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        await db.init();
        const loadedAccounts = await db.getAccounts();
        setAccounts(loadedAccounts);

        const loadedMessages = await db.getMessages();
        if (loadedMessages.length === 0) {
          const welcomeMsg: Message = {
            id: 'welcome',
            sender: 'bot',
            text: '¡Hola! Soy tu asistente de Impel. ¿Qué credencial estás buscando hoy? Escribe el nombre de la plataforma (ej. "mercantil" o "netflix").',
            timestamp: new Date(),
            suggestions: ['netflix', 'google', 'spotify'],
          };
          await db.saveMessage(welcomeMsg);
          setChatMessages([welcomeMsg]);
        } else {
          setChatMessages(loadedMessages);
        }
      } catch (error) {
        console.error('Error loading database data:', error);
      }
    };

    loadPersistedData();
  }, []);

  const setChatMessagesWrapper = (
    value: React.SetStateAction<Message[]>
  ) => {
    setChatMessages((prev) => {
      const nextMessages = typeof value === 'function' ? (value as any)(prev) : value;
      if (nextMessages.length === 0) {
        db.clearMessages();
      } else {
        const newMessages = nextMessages.filter(
          (nextMsg: Message) => !prev.some((prevMsg) => prevMsg.id === nextMsg.id)
        );
        newMessages.forEach((msg: Message) => {
          db.saveMessage(msg);
        });
      }
      return nextMessages;
    });
  };

  // Background timer to invalidate the 12-hour session
  useEffect(() => {
    const interval = setInterval(() => {
      if (isLoggedIn && loginTime) {
        const twelveHoursMs = 12 * 60 * 60 * 1000;
        if (Date.now() - loginTime > twelveHoursMs) {
          setIsLoggedIn(false);
          setLoginTime(null);
          setIsUnlocked(false);
        }
      }
    }, 30000); // Checks every 30 seconds

    return () => clearInterval(interval);
  }, [isLoggedIn, loginTime]);

  const appLogin = async (): Promise<boolean> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        setIsLoggedIn(true);
        setLoginTime(Date.now());
        return true;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Ingresar a Impel',
        fallbackLabel: 'Usar contraseña del dispositivo',
        disableDeviceFallback: false,
      });

      if (result.success) {
        setIsLoggedIn(true);
        setLoginTime(Date.now());
        return true;
      }
      return false;
    } catch {
      // Fallback
      setIsLoggedIn(true);
      setLoginTime(Date.now());
      return true;
    }
  };

  const appLogout = () => {
    setIsLoggedIn(false);
    setLoginTime(null);
    setIsUnlocked(false);
  };

  const unlock = async (): Promise<boolean> => {
    setIsUnlocking(true);
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Desbloquear Bóveda Impel',
          fallbackLabel: 'Ingresar código de seguridad',
          disableDeviceFallback: false,
        });

        if (result.success) {
          setIsUnlocked(true);
          setIsUnlocking(false);
          setActiveTab('vault');
          return true;
        } else {
          setIsUnlocking(false);
          return false;
        }
      } else {
        // Fallback for Web/Simulators (simulated scan animation)
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsUnlocked(true);
        setIsUnlocking(false);
        setActiveTab('vault');
        return true;
      }
    } catch (e) {
      console.warn('Authentication error, falling back to simulation:', e);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsUnlocked(true);
      setIsUnlocking(false);
      setActiveTab('vault');
      return true;
    }
  };

  const lock = () => {
    setIsUnlocked(false);
    setActiveTab('unlock');
  };

  const toggleFavorite = (id: string) => {
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === id) {
          const updated = { ...acc, isFavorite: !acc.isFavorite };
          db.saveAccount(updated);
          return updated;
        }
        return acc;
      })
    );
  };

  const fixSingleFinding = async (findingId: string) => {
    // Simulate updating specific accounts associated with this finding
    await new Promise((resolve) => setTimeout(resolve, 800));
    const finding = findings.find((f) => f.id === findingId);
    if (!finding) return;

    setFindings((prev) =>
      prev.map((f) => (f.id === findingId ? { ...f, isFixed: true } : f))
    );

    setAccounts((prev) =>
      prev.map((acc) => {
        if (finding.affectedAccounts.includes(acc.id)) {
          const updated = {
            ...acc,
            strength: 'safe' as PasswordStrength,
            strengthText: 'Segura',
          };
          db.saveAccount(updated);
          return updated;
        }
        return acc;
      })
    );
  };

  const fixAllRisks = async () => {
    // Simulate batch operations to change passwords
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setFindings((prev) => prev.map((f) => ({ ...f, isFixed: true })));
    setAccounts((prev) =>
      prev.map((acc) => {
        const updated = {
          ...acc,
          strength: 'safe' as PasswordStrength,
          strengthText: 'Segura',
        };
        db.saveAccount(updated);
        return updated;
      })
    );
  };

  const addAccount = (
    name: string,
    username: string,
    strength: PasswordStrength,
    strengthText: string,
    customFields?: CustomField[],
    password?: string
  ) => {
    // Generate a completely unique random ID
    const id = Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    const cleanName = name.trim();
    const logoBase = cleanName.toLowerCase().replace(/\s+/g, '');

    const newAcc: Account = {
      id,
      name: cleanName,
      username,
      password,
      strength,
      strengthText,
      logo: (['netflix', 'google', 'github', 'spotify', 'adobe', 'epicgames'].includes(logoBase)
        ? logoBase
        : 'generic') as any,
      customFields,
    };
    db.saveAccount(newAcc);
    setAccounts((prev) => [newAcc, ...prev]);

    // Fetch the SVGL logo asynchronously in the background
    (async () => {
      try {
        const response = await fetch(`https://api.svgl.app?search=${encodeURIComponent(logoBase)}`);
        if (response.ok) {
          const results = await response.json();
          if (results && results.length > 0) {
            // Find a perfect match or take the first match
            const match = results.find(
              (r: any) => r.title.toLowerCase() === cleanName.toLowerCase()
            ) || results[0];
            
            let logoUrl: string | undefined = undefined;
            if (typeof match.route === 'object' && match.route !== null) {
              logoUrl = match.route.light || match.route.dark;
            } else if (typeof match.route === 'string') {
              logoUrl = match.route;
            }

            if (logoUrl) {
              const updatedAcc = { ...newAcc, logoUrl };
              await db.saveAccount(updatedAcc);
              setAccounts((prev) =>
                prev.map((acc) => (acc.id === id ? updatedAcc : acc))
              );
            }
          }
        }
      } catch (e) {
        console.warn('SVGL logo fetch background error:', e);
      }
    })();
  };

  const deleteAccount = (id: string) => {
    db.deleteAccount(id);
    setAccounts((prev) => prev.filter((acc) => acc.id !== id));
  };

  const updateAccount = async (updatedAcc: Account) => {
    let strength: PasswordStrength = 'safe';
    let strengthText = 'Segura';
    if (updatedAcc.password !== undefined) {
      if (updatedAcc.password.length < 8) {
        strength = 'leaked';
        strengthText = 'Filtrada';
      } else if (updatedAcc.password.length < 12) {
        strength = 'weak';
        strengthText = 'Débil';
      }
    }

    const finalAcc = {
      ...updatedAcc,
      strength,
      strengthText,
    };

    await db.saveAccount(finalAcc);
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === finalAcc.id ? finalAcc : acc))
    );

    if (selectedDetailAccount && selectedDetailAccount.id === finalAcc.id) {
      setSelectedDetailAccount(finalAcc);
    }
  };

  const fixSingleAccount = (accountId: string) => {
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === accountId) {
          const updated = { ...acc, strength: 'safe' as PasswordStrength, strengthText: 'Segura' };
          db.saveAccount(updated);
          return updated;
        }
        return acc;
      })
    );
    // Automatically flag matching findings as fixed if all their affected accounts are safe
    setFindings((prev) =>
      prev.map((f) => {
        if (f.affectedAccounts.includes(accountId)) {
          const otherAccounts = f.affectedAccounts.filter((id) => id !== accountId);
          // If all other affected accounts are already safe, this finding is resolved!
          const allOthersSafe = otherAccounts.every((id) => {
            const acc = accounts.find((a) => a.id === id);
            return acc ? acc.strength === 'safe' : true;
          });
          if (allOthersSafe) {
            return { ...f, isFixed: true };
          }
        }
        return f;
      })
    );
  };

  const securityScore = useMemo(() => {
    // Calculate score out of 100 based on accounts strength
    const safeCount = accounts.filter((a) => a.strength === 'safe').length;
    const totalCount = accounts.length;
    if (totalCount === 0) return 100;
    return Math.round((safeCount / totalCount) * 100);
  }, [accounts]);

  return (
    <VaultContext.Provider
      value={{
        isUnlocked,
        isUnlocking,
        searchQuery,
        selectedFilter,
        accounts,
        findings,
        activeTab,
        securityScore,
        isAddOpen,
        unlock,
        lock,
        setSearchQuery,
        setSelectedFilter,
        setActiveTab,
        toggleFavorite,
        fixAllRisks,
        fixSingleFinding,
        setIsAddOpen,
        addAccount,
        deleteAccount,
        updateAccount,
        fixSingleAccount,
        isLoggedIn,
        loginTime,
        appLogin,
        appLogout,
        setLoginTime,
        chatMessages,
        setChatMessages: setChatMessagesWrapper,
        selectedDetailAccount,
        setSelectedDetailAccount,
      }}>
      {children}
    </VaultContext.Provider>
  );
}

export const useVault = () => {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
};
