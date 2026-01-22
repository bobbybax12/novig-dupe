import React, { createContext, useContext, useState } from 'react';

const BLUE = '#5AC8FA';
const YELLOW = '#FFD700';

interface ThemeContextType {
  isEnabled: boolean;
  setIsEnabled: (value: boolean) => void;
  activeColor: string;
  balance: string;
  cashBalance: number;
  coinsBalance: number;
  showBalance: boolean;
  setShowBalance: (value: boolean) => void;
  deductBalance: (amount: number, currency: 'usd' | 'btc') => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isEnabled: true,
  setIsEnabled: () => {},
  activeColor: BLUE,
  balance: '$1,250.00',
  cashBalance: 1250,
  coinsBalance: 999,
  showBalance: true,
  setShowBalance: () => {},
  deductBalance: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isEnabled, setIsEnabled] = useState(true);
  const [cashBalance, setCashBalance] = useState(1250);
  const [coinsBalance, setCoinsBalance] = useState(999);
  const [showBalance, setShowBalance] = useState(true);

  const activeColor = isEnabled ? BLUE : YELLOW;

  const formatBalance = (isCash: boolean) => {
    if (!showBalance) return '•••••';
    if (isCash) {
      return '$' + cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 });
    }
    return coinsBalance.toLocaleString();
  };

  const balance = formatBalance(isEnabled);

  const deductBalance = (amount: number, currency: 'usd' | 'btc') => {
    if (currency === 'usd') {
      setCashBalance((prev) => Math.max(0, prev - amount));
    } else {
      setCoinsBalance((prev) => Math.max(0, prev - amount));
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        isEnabled,
        setIsEnabled,
        activeColor,
        balance,
        cashBalance,
        coinsBalance,
        showBalance,
        setShowBalance,
        deductBalance,
      }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
