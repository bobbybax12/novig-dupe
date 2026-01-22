import React, { createContext, useContext, useState } from 'react';

export interface BookmakerOddsForBet {
  key: string;
  title: string;
  odds: string;
}

export interface Bet {
  id: string;
  gameId: string;
  team: string;
  type: 'spread' | 'total' | 'moneyline';
  value: string;
  odds: string;
  league?: string;
  gameTime?: string;
  commenceTime?: string;
  opponent?: string;
  oppositeValue?: string;
  oppositeOdds?: string;
  bookmakerOdds?: BookmakerOddsForBet[];
}

export interface PlacedBet {
  id: string;
  bets: Bet[];
  wager: number;
  totalOdds: string;
  potentialPayout: number;
  placedAt: Date;
  status: 'active' | 'won' | 'lost';
  result?: number;
  currency: 'usd' | 'btc';
}

interface BetSlipContextType {
  bets: Bet[];
  addBet: (bet: Bet) => void;
  removeBet: (betId: string) => void;
  clearBets: () => void;
  isBetSelected: (betId: string) => boolean;
  toggleBet: (bet: Bet) => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  placedBets: PlacedBet[];
  placeBet: (wager: number, totalOdds: string, potentialPayout: number, currency: 'usd' | 'btc') => void;
  settleBet: (betId: string, won: boolean) => void;
  showConfirmation: boolean;
  confirmationType: 'pick' | 'parlay';
  hideConfirmation: () => void;
}

const BetSlipContext = createContext<BetSlipContextType>({
  bets: [],
  addBet: () => {},
  removeBet: () => {},
  clearBets: () => {},
  isBetSelected: () => false,
  toggleBet: () => {},
  isExpanded: false,
  setIsExpanded: () => {},
  placedBets: [],
  placeBet: () => {},
  settleBet: () => {},
  showConfirmation: false,
  confirmationType: 'pick',
  hideConfirmation: () => {},
});

export function BetSlipProvider({ children }: { children: React.ReactNode }) {
  const [bets, setBets] = useState<Bet[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [placedBets, setPlacedBets] = useState<PlacedBet[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationType, setConfirmationType] = useState<'pick' | 'parlay'>('pick');

  const addBet = (bet: Bet) => {
    setBets((prev) => [...prev, bet]);
  };

  const removeBet = (betId: string) => {
    setBets((prev) => prev.filter((b) => b.id !== betId));
  };

  const clearBets = () => {
    setBets([]);
  };

  const isBetSelected = (betId: string) => {
    return bets.some((b) => b.id === betId);
  };

  const toggleBet = (bet: Bet) => {
    if (isBetSelected(bet.id)) {
      removeBet(bet.id);
    } else {
      addBet(bet);
    }
  };

  const placeBet = (wager: number, totalOdds: string, potentialPayout: number, currency: 'usd' | 'btc') => {
    const isParlay = bets.length > 1;
    const newPlacedBet: PlacedBet = {
      id: `placed-${Date.now()}`,
      bets: [...bets],
      wager,
      totalOdds,
      potentialPayout,
      placedAt: new Date(),
      status: 'active',
      currency,
    };
    setPlacedBets((prev) => [newPlacedBet, ...prev]);
    setConfirmationType(isParlay ? 'parlay' : 'pick');
    setShowConfirmation(true);
    clearBets();
    setIsExpanded(false);
  };

  const hideConfirmation = () => {
    setShowConfirmation(false);
  };

  const settleBet = (betId: string, won: boolean) => {
    setPlacedBets((prev) =>
      prev.map((bet) =>
        bet.id === betId
          ? {
              ...bet,
              status: won ? 'won' : 'lost',
              result: won ? bet.potentialPayout : 0,
            }
          : bet
      )
    );
  };

  return (
    <BetSlipContext.Provider
      value={{
        bets,
        addBet,
        removeBet,
        clearBets,
        isBetSelected,
        toggleBet,
        isExpanded,
        setIsExpanded,
        placedBets,
        placeBet,
        settleBet,
        showConfirmation,
        confirmationType,
        hideConfirmation,
      }}>
      {children}
    </BetSlipContext.Provider>
  );
}

export function useBetSlip() {
  return useContext(BetSlipContext);
}
