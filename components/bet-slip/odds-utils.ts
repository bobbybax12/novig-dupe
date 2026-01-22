export function americanToDecimal(odds: string): number {
  const num = parseInt(odds, 10);
  if (num > 0) {
    return num / 100 + 1;
  } else {
    return 100 / Math.abs(num) + 1;
  }
}

export function decimalToAmerican(decimal: number): string {
  if (decimal >= 2) {
    return '+' + Math.round((decimal - 1) * 100);
  } else {
    return String(Math.round(-100 / (decimal - 1)));
  }
}

import { Bet } from '@/context/bet-slip-context';

export function calculateTotalOdds(bets: Bet[]): { american: string; decimal: number } {
  if (bets.length === 0) return { american: '+100', decimal: 2 };

  const totalDecimal = bets.reduce((acc, bet) => {
    return acc * americanToDecimal(bet.odds);
  }, 1);

  return {
    american: decimalToAmerican(totalDecimal),
    decimal: totalDecimal,
  };
}

export function calculateVigOdds(noVigOdds: string): string {
  const decimal = americanToDecimal(noVigOdds);
  const vigDecimal = decimal > 2 ? decimal * 0.91 : decimal * 0.95;
  return decimalToAmerican(vigDecimal);
}

export function calculateSavings(noVigOdds: string): number {
  const noVigDecimal = americanToDecimal(noVigOdds);
  const vigDecimal = americanToDecimal(calculateVigOdds(noVigOdds));
  return ((noVigDecimal - vigDecimal) / vigDecimal) * 100;
}

export function generateOrderBookLevels(odds: string, isSelectedSide: boolean) {
  const baseDecimal = americanToDecimal(odds);
  const levels = [];

  const liquidityAmounts = isSelectedSide
    ? [37.51, 1218.18, 5420.00]
    : [125.00, 890.50, 3200.00];

  for (let i = 0; i < 3; i++) {
    const adjustment = isSelectedSide ? (0.02 * i) : (-0.02 * i);
    const decimal = baseDecimal * (1 + adjustment);

    levels.push({
      odds: decimalToAmerican(decimal),
      decimalOdds: decimal,
      liquidity: liquidityAmounts[i],
      cumulativeLiquidity: liquidityAmounts.slice(0, i + 1).reduce((a, b) => a + b, 0),
    });
  }
  return levels;
}

export function getOppositeSide(bet: Bet): string {
  if (bet.type === 'total') {
    if (bet.value.startsWith('O')) {
      return bet.value.replace('O', 'U');
    }
    return bet.value.replace('U', 'O');
  }
  if (bet.type === 'spread') {
    const num = parseFloat(bet.value);
    const opposite = num > 0 ? num * -1 : Math.abs(num);
    return (opposite > 0 ? '+' : '') + opposite.toFixed(1);
  }
  return 'OPP';
}
