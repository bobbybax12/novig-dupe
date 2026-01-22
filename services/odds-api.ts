const API_KEY = process.env.EXPO_PUBLIC_ODDS_API_KEY || '';
const BASE_URL = 'https://api.the-odds-api.com/v4';

interface ScoreData {
  name: string;
  score: string;
}

interface ScoresAPIGame {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  completed: boolean;
  home_team: string;
  away_team: string;
  scores: ScoreData[] | null;
  last_update: string | null;
}

export interface OddsAPIGame {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
}

interface Bookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: Market[];
}

interface Market {
  key: string;
  outcomes: Outcome[];
}

interface Outcome {
  name: string;
  price: number;
  point?: number;
}

export interface BookmakerOdds {
  key: string;
  title: string;
  moneyline?: { home: string; away: string };
  spread?: { home: string; away: string };
  total?: { over: string; under: string };
}

export interface TransformedGame {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeAbbrev: string;
  awayAbbrev: string;
  commenceTime: string;
  isLive: boolean;
  homeScore?: number;
  awayScore?: number;
  spread: {
    home: { value: string; odds: string };
    away: { value: string; odds: string };
  };
  total: {
    over: { value: string; odds: string };
    under: { value: string; odds: string };
  };
  moneyline: {
    home: { odds: string };
    away: { odds: string };
  };
  tradedVolume: string;
  moreBets: number;
  bookmakerOdds: BookmakerOdds[];
}

const TEAM_ABBREVS: Record<string, string> = {
  // NBA
  'Los Angeles Lakers': 'LAL',
  'Los Angeles Clippers': 'LAC',
  'Golden State Warriors': 'GSW',
  'Boston Celtics': 'BOS',
  'Miami Heat': 'MIA',
  'Milwaukee Bucks': 'MIL',
  'Phoenix Suns': 'PHX',
  'Denver Nuggets': 'DEN',
  'Philadelphia 76ers': 'PHI',
  'Brooklyn Nets': 'BKN',
  'New York Knicks': 'NYK',
  'Chicago Bulls': 'CHI',
  'Dallas Mavericks': 'DAL',
  'Houston Rockets': 'HOU',
  'San Antonio Spurs': 'SAS',
  'Memphis Grizzlies': 'MEM',
  'Minnesota Timberwolves': 'MIN',
  'New Orleans Pelicans': 'NOP',
  'Oklahoma City Thunder': 'OKC',
  'Portland Trail Blazers': 'POR',
  'Sacramento Kings': 'SAC',
  'Toronto Raptors': 'TOR',
  'Utah Jazz': 'UTA',
  'Atlanta Hawks': 'ATL',
  'Charlotte Hornets': 'CHA',
  'Cleveland Cavaliers': 'CLE',
  'Detroit Pistons': 'DET',
  'Indiana Pacers': 'IND',
  'Orlando Magic': 'ORL',
  'Washington Wizards': 'WAS',
  // NFL
  'Kansas City Chiefs': 'KC',
  'Buffalo Bills': 'BUF',
  'Philadelphia Eagles': 'PHI',
  'San Francisco 49ers': 'SF',
  'Dallas Cowboys': 'DAL',
  'Miami Dolphins': 'MIA',
  'Baltimore Ravens': 'BAL',
  'Cincinnati Bengals': 'CIN',
  'Detroit Lions': 'DET',
  'Jacksonville Jaguars': 'JAX',
  'Los Angeles Chargers': 'LAC',
  'New York Jets': 'NYJ',
  'New York Giants': 'NYG',
  'Seattle Seahawks': 'SEA',
  'Cleveland Browns': 'CLE',
  'Minnesota Vikings': 'MIN',
  'Green Bay Packers': 'GB',
  'Las Vegas Raiders': 'LV',
  'Pittsburgh Steelers': 'PIT',
  'New England Patriots': 'NE',
  'Denver Broncos': 'DEN',
  'Los Angeles Rams': 'LAR',
  'Tampa Bay Buccaneers': 'TB',
  'Arizona Cardinals': 'ARI',
  'Atlanta Falcons': 'ATL',
  'Carolina Panthers': 'CAR',
  'Chicago Bears': 'CHI',
  'Houston Texans': 'HOU',
  'Indianapolis Colts': 'IND',
  'New Orleans Saints': 'NO',
  'Tennessee Titans': 'TEN',
  'Washington Commanders': 'WSH',
};

function getAbbrev(teamName: string): string {
  return TEAM_ABBREVS[teamName] || teamName.slice(0, 3).toUpperCase();
}

function formatAmericanOdds(price: number): string {
  return price > 0 ? `+${price}` : String(price);
}

function formatSpread(point: number): string {
  return point > 0 ? `+${point}` : String(point);
}

async function fetchScores(sport: string): Promise<Map<string, ScoresAPIGame>> {
  try {
    const url = `${BASE_URL}/sports/${sport}/scores/?apiKey=${API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Scores API error: ${response.status}`);
    }

    const data: ScoresAPIGame[] = await response.json();

    const scoresMap = new Map<string, ScoresAPIGame>();
    data.forEach(game => {
      scoresMap.set(game.id, game);
    });

    return scoresMap;
  } catch (error) {
    console.error('Error fetching scores:', error);
    return new Map();
  }
}

export async function fetchOdds(sport: string = 'basketball_nba'): Promise<TransformedGame[]> {
  try {
    const oddsUrl = `${BASE_URL}/sports/${sport}/odds/?apiKey=${API_KEY}&regions=us&markets=h2h,spreads,totals&oddsFormat=american&bookmakers=fanduel,draftkings,betmgm,caesars`;

    const [oddsResponse, scoresMap] = await Promise.all([
      fetch(oddsUrl),
      fetchScores(sport),
    ]);

    if (!oddsResponse.ok) {
      throw new Error(`Odds API error: ${oddsResponse.status}`);
    }

    const oddsData: OddsAPIGame[] = await oddsResponse.json();

    return oddsData.map(game => transformGame(game, scoresMap));
  } catch (error) {
    console.error('Error fetching odds:', error);
    throw error;
  }
}

function transformGame(game: OddsAPIGame, scoresMap: Map<string, ScoresAPIGame>): TransformedGame {
  const bookmaker = game.bookmakers[0];

  const h2h = bookmaker?.markets.find(m => m.key === 'h2h');
  const spreads = bookmaker?.markets.find(m => m.key === 'spreads');
  const totals = bookmaker?.markets.find(m => m.key === 'totals');

  const homeH2H = h2h?.outcomes.find(o => o.name === game.home_team);
  const awayH2H = h2h?.outcomes.find(o => o.name === game.away_team);

  const homeSpread = spreads?.outcomes.find(o => o.name === game.home_team);
  const awaySpread = spreads?.outcomes.find(o => o.name === game.away_team);

  const over = totals?.outcomes.find(o => o.name === 'Over');
  const under = totals?.outcomes.find(o => o.name === 'Under');

  const scoresData = scoresMap.get(game.id);
  const homeScoreData = scoresData?.scores?.find(s => s.name === game.home_team);
  const awayScoreData = scoresData?.scores?.find(s => s.name === game.away_team);

  const commenceTime = new Date(game.commence_time);
  const now = new Date();
  const hasStarted = commenceTime <= now;
  const isCompleted = scoresData?.completed ?? false;
  const isLive = hasStarted && !isCompleted && scoresData?.scores !== null;

  const bookmakerOdds: BookmakerOdds[] = game.bookmakers.map(bm => {
    const bmH2H = bm.markets.find(m => m.key === 'h2h');
    const bmSpreads = bm.markets.find(m => m.key === 'spreads');
    const bmTotals = bm.markets.find(m => m.key === 'totals');

    return {
      key: bm.key,
      title: bm.title,
      moneyline: bmH2H ? {
        home: formatAmericanOdds(bmH2H.outcomes.find(o => o.name === game.home_team)?.price ?? 0),
        away: formatAmericanOdds(bmH2H.outcomes.find(o => o.name === game.away_team)?.price ?? 0),
      } : undefined,
      spread: bmSpreads ? {
        home: formatAmericanOdds(bmSpreads.outcomes.find(o => o.name === game.home_team)?.price ?? 0),
        away: formatAmericanOdds(bmSpreads.outcomes.find(o => o.name === game.away_team)?.price ?? 0),
      } : undefined,
      total: bmTotals ? {
        over: formatAmericanOdds(bmTotals.outcomes.find(o => o.name === 'Over')?.price ?? 0),
        under: formatAmericanOdds(bmTotals.outcomes.find(o => o.name === 'Under')?.price ?? 0),
      } : undefined,
    };
  });

  return {
    id: game.id,
    league: game.sport_title,
    homeTeam: game.home_team,
    awayTeam: game.away_team,
    homeAbbrev: getAbbrev(game.home_team),
    awayAbbrev: getAbbrev(game.away_team),
    commenceTime: game.commence_time,
    isLive,
    homeScore: homeScoreData ? parseInt(homeScoreData.score, 10) : undefined,
    awayScore: awayScoreData ? parseInt(awayScoreData.score, 10) : undefined,
    spread: {
      home: {
        value: homeSpread?.point !== undefined ? formatSpread(homeSpread.point) : '-3.5',
        odds: homeSpread?.price !== undefined ? formatAmericanOdds(homeSpread.price) : '-110',
      },
      away: {
        value: awaySpread?.point !== undefined ? formatSpread(awaySpread.point) : '+3.5',
        odds: awaySpread?.price !== undefined ? formatAmericanOdds(awaySpread.price) : '-110',
      },
    },
    total: {
      over: {
        value: over?.point !== undefined ? `O ${over.point}` : 'O 220.5',
        odds: over?.price !== undefined ? formatAmericanOdds(over.price) : '-110',
      },
      under: {
        value: under?.point !== undefined ? `U ${under.point}` : 'U 220.5',
        odds: under?.price !== undefined ? formatAmericanOdds(under.price) : '-110',
      },
    },
    moneyline: {
      home: {
        odds: homeH2H?.price !== undefined ? formatAmericanOdds(homeH2H.price) : '-150',
      },
      away: {
        odds: awayH2H?.price !== undefined ? formatAmericanOdds(awayH2H.price) : '+130',
      },
    },
    tradedVolume: `$${(Math.random() * 500 + 100).toFixed(0)}k`,
    moreBets: Math.floor(Math.random() * 20) + 5,
    bookmakerOdds,
  };
}

