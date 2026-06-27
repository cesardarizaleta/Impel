import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

export type PasswordStrength = 'safe' | 'weak' | 'leaked';

export interface CustomField {
  label: string;
  value: string;
}

export interface Account {
  id: string;
  name: string;
  username: string;
  strength: PasswordStrength;
  logo: 'netflix' | 'google' | 'github' | 'spotify' | 'adobe' | 'epicgames' | 'generic';
  strengthText: string;
  isFavorite?: boolean;
  customFields?: CustomField[];
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
    customFields?: CustomField[]
  ) => void;
  deleteAccount: (id: string) => void;
  fixSingleAccount: (accountId: string) => void;
  isLoggedIn: boolean;
  loginTime: number | null;
  appLogin: () => Promise<boolean>;
  appLogout: () => void;
  setLoginTime: (time: number | null) => void;
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
        promptMessage: 'Ingresar a Impel Down',
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
      prev.map((acc) => (acc.id === id ? { ...acc, isFavorite: !acc.isFavorite } : acc))
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
          return {
            ...acc,
            strength: 'safe' as PasswordStrength,
            strengthText: 'Segura',
          };
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
      prev.map((acc) => ({
        ...acc,
        strength: 'safe' as PasswordStrength,
        strengthText: 'Segura',
      }))
    );
  };

  const addAccount = (
    name: string,
    username: string,
    strength: PasswordStrength,
    strengthText: string,
    customFields?: CustomField[]
  ) => {
    const id = name.toLowerCase().trim().replace(/\s+/g, '');
    const newAcc: Account = {
      id,
      name,
      username,
      strength,
      strengthText,
      logo: (['netflix', 'google', 'github', 'spotify', 'adobe', 'epicgames'].includes(id)
        ? id
        : 'generic') as any,
      customFields,
    };
    setAccounts((prev) => [newAcc, ...prev]);
  };

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== id));
  };

  const fixSingleAccount = (accountId: string) => {
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === accountId
          ? { ...acc, strength: 'safe' as PasswordStrength, strengthText: 'Segura' }
          : acc
      )
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
        fixSingleAccount,
        isLoggedIn,
        loginTime,
        appLogin,
        appLogout,
        setLoginTime,
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
