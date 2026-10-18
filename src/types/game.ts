/**
 * AR360X — Ultimate Livestock & Business Empire Simulator
 * Core Game Types & Interfaces
 */

export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'drought' | 'storm' | 'perfect' | 'foggy' | 'windy';

export interface WeatherCondition {
  id: WeatherType;
  icon: string;
  name: string;
  desc: string;
  milkMult: number;
  cropMult: number;
  color: string;
}

export type LivestockKind = 'Cow' | 'Goat' | 'Sheep' | 'Chicken';

export interface LivestockData {
  count: number;
  health: number; // 0 - 100
  prod: number;   // base daily units
  basePrice: number;
  dailyFeedCost: number;
}

export interface BankAccount {
  id: string;
  bankId: string;
  name: string;
  balance: number;
  openedDay: number;
  interestEarned: number;
}

export interface BankConfig {
  id: string;
  name: string;
  short: string;
  emoji: string;
  color: string;
  savingsRate: number; // daily rate
  fdRate: number;      // annual rate
  minBalance: number;
  openFee: number;
  minCibilScore: number;
  maxLoanMultiplier: number;
  maxLoansAllowed: number;
  desc: string;
  perks: string[];
}

export interface ActiveLoan {
  id: number;
  amount: number;
  bankId: string;
  purpose: string;
  startDay: number;
  daysUnpaid: number;
  interestAccrued: number;
}

export interface LoanApplication {
  id: number;
  amount: number;
  purpose: string;
  appliedDay: number;
  approveDue: number;
  status: 'pending' | 'approved' | 'rejected';
  bankId: string;
}

export interface CreditCard {
  id: number;
  catalogId: string;
  active: boolean;
  limit: number;
  outstanding: number;
  billingDay: number;
  transactions: { day: number; desc: string; amount: number; type: 'spend' | 'cashback' | 'payment' }[];
  minDue: number;
  appliedDay: number;
  approvePending: boolean;
  cashbackEarned: number;
}

export interface CreditCardConfig {
  id: string;
  bankId: string;
  name: string;
  tier: 'Classic' | 'Gold' | 'Platinum' | 'Black';
  emoji: string;
  bg: string;
  minScore: number;
  annualFee: number;
  interestRate: number;
  limitMult: number;
  perks: string[];
  desc: string;
}

export interface FixedDeposit {
  id: string;
  amount: number;
  daysLeft: number;
  totalDays: number;
  fdRate: number;
  bankId: string;
}

export interface Commodity {
  name: string;
  price: number;
  basePrice: number;
  holding: number;
  history: number[];
  dailyVol: number;
  meanRev: number;
  unit: string;
}

export interface Stock {
  id: string;
  name: string;
  sector: string;
  price: number;
  basePrice: number;
  history: number[];
  holding: number;
  avgBuy: number;
  dividendYield?: number;
}

export interface LimitOrder {
  id: number;
  assetId: string;
  assetType: 'stock' | 'crypto';
  orderType: 'buy' | 'sell';
  qty: number;
  limitPrice: number;
}

export interface CryptoCoin {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  price: number;
  basePrice: number;
  holding: number;
  avgBuy: number;
  history: number[];
  vol: number;
  color: string;
}

export interface MutualFund {
  id: string;
  name: string;
  cat: string;
  risk: 'Low' | 'Med' | 'High';
  nav: number;
  history: number[];
  units: number;
  avgNav: number;
  annualReturn: number;
  volatility: number;
  icon: string;
}

export interface MutualFundSIP {
  fundId: string | null;
  amount: number;
  nextDue: number;
}

export interface HouseItem {
  id: string;
  type: 'hut' | 'villa' | 'bungalow' | 'guesthouse' | 'palace';
  sqft: number;
  buildCost: number;
  dailyRent: number;
  builtDay: number;
}

export interface BusinessEnterprise {
  id: number;
  catalogId: string;
  tier: number; // 1: Starter, 2: Medium, 3: Chain
  reputation: number; // 1.0 - 5.0
  daysOpen: number;
  dailyRevEarned: number;
  qty: number;
  extraInvestment: number;
  partners: { partnerId: string; amount: number; startDay: number }[];
  investHistory: { day: number; amount: number; type: 'inject' | 'withdraw' }[];
}

export interface BusinessConfig {
  id: string;
  name: string;
  icon: string;
  openCost: number;
  dailyRev: number;
  dailyExp: number;
  staff: number;
  maxTier: number;
  tierUpCost: number[];
  tierRevMult: number[];
  desc: string;
  category: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  maxQty: number;
}

export interface PartnerConfig {
  id: string;
  name: string;
  avatar: string;
  title: string;
  desc: string;
  reqCategories: string[] | null;
  reqMinTier: number;
  reqMinRep: number;
  reqMinDays: number;
  investMin: number;
  investMax: number;
  revSharePct: number;
  perks: string[];
  icon: string;
}

export interface RestaurantOutlet {
  id: number;
  tierId: 'dhaba' | 'cafe' | 'restaurant' | 'chain';
  name: string;
  location: string;
  level: number;
  dailyRevEarned: number;
  menuItems: { name: string; price: number; dailySales: number }[];
  openedDay: number;
}

export interface HospitalFacility {
  id: number;
  typeId: 'clinic' | 'hospital' | 'multispec';
  level: number;
  specs: string[];
  dailyPatients: number;
  dailyRevEarned: number;
  openedDay: number;
}

export interface EquipmentUnit {
  id: number;
  equipId: string;
  status: 'available' | 'rented' | 'maintenance';
  rentedTill: number;
  dailyRent: number;
  totalEarned: number;
  purchasedDay: number;
}

export interface RentalRequest {
  id: number;
  equipId: string;
  equipName: string;
  equipIcon: string;
  renterName: string;
  days: number;
  dailyRate: number;
  premium: string;
  expiresDay: number;
}

export interface Worker {
  id: string;
  name: string;
  emoji: string;
  role: string;
  cost: number;
  bonus: string;
  desc: string;
}

export interface SkillNode {
  id: string;
  name: string;
  desc: string;
  cost: number;
  requires: string | null;
  bonus: string;
  category: 'dairy' | 'agri' | 'finance' | 'real';
}

export interface Mission {
  id: string;
  icon: string;
  name: string;
  desc: string;
  reward: number;
  rewardXp: number;
  check: (state: GameState) => boolean;
}

export interface Milestone {
  id: string;
  name: string;
  icon: string;
  desc: string;
  check: (state: GameState) => boolean;
}

export interface InsurancePolicy {
  active: boolean;
  daysLeft: number;
  premium: number;
}

export interface AuctionItem {
  id: number;
  name: string;
  category: 'livestock' | 'commodity' | 'bonus' | 'seeds' | 'skill' | 'property';
  basePrice: number;
  currentBid: number;
  minBid: number;
  highestBidder: string;
  daysLeft: number;
  description: string;
  rewardData: { type: string; qty: number; value?: number };
}

export interface CountryTravel {
  id: string;
  name: string;
  flag: string;
  region: string;
  cost: number;
  isHome?: boolean;
  desc: string;
  currency: string;
  currencyRate: number;
  cashBonus?: number;
  creditBonus?: number;
  skillBonus?: number;
  animalHealthBonus?: number;
  bonuses: { icon: string; label: string; val: string }[];
}

export interface ActiveBoost {
  type: string;
  value: number;
  daysLeft: number;
  desc: string;
}

export interface ExportCountryConfig {
  id: string;
  flag: string;
  name: string;
  premium: number;
  currency: string;
  focus: string[];
  minRep: number;
  quota: number;
}

export interface NPCTraderConfig {
  id: string;
  avatar: string;
  name: string;
  role: string;
  desc: string;
  buys: { key: string; price: number; minQty: number }[];
  sells?: { key: string; price: number; minQty: number }[];
  trustReward: number;
  trustThreshold: number;
}

export interface NPCTradeOffer {
  id: number;
  npcId: string;
  npcName: string;
  key: string;
  qty: number;
  price: number;
  bonus: string;
  expiresDay: number;
}

export interface IPOOffer {
  id: number;
  catalogId: string;
  name: string;
  sector: string;
  issuePrice: number;
  lotSize: number;
  openDay: number;
  closeDay: number;
  lotsApplied: number;
  status: 'open' | 'applied' | 'listed' | 'expired';
  listPrice: number;
  desc: string;
}

export interface FOContract {
  id: number;
  stockId: string;
  type: 'call' | 'put';
  strikePrice: number;
  qty: number;
  premium: number;
  totalPremium: number;
  boughtDay: number;
  expiryDay: number;
  status: 'active' | 'profit' | 'loss' | 'expired';
  pnl: number;
}

export interface EventLogItem {
  id: string;
  day: number;
  time: string;
  msg: string;
  type: 'info' | 'warn' | 'danger' | 'success';
}

export interface GameState {
  version: number;
  player: {
    name: string;
    level: number;
    xp: number;
    nextLevelXp: number;
    skillPoints: number;
  };
  clock: {
    dayCount: number;
    simMinutes: number;
    simDate: { day: number; month: number; year: number };
    speedMultiplier: number;
    isPaused: boolean;
  };
  finances: {
    cash: number;
    bankLegacy: number;
    bonds: number;
    sip: number;
    fixedDeposits: FixedDeposit[];
    creditScore: number;
    loanRepaidCount: number;
    loanDefaultCount: number;
    taxableBase: number;
    lastTaxPaidDay: number;
    allTimeTaxPaid: number;
  };
  bankAccounts: BankAccount[];
  selectedBankAcctId: string | null;
  activeLoans: ActiveLoan[];
  loanApplications: LoanApplication[];
  creditCards: CreditCard[];
  selectedCcId: number | null;
  
  // Livestock
  livestock: Record<LivestockKind, LivestockData>;
  
  // Raw inventory & products
  inventory: {
    milk: number;
    eggs: number;
    skins: number;
    dung: number;
    ghee: number;
    ice: number;
    face: number;
    cheese: number;
    eggSingle: number;
    eggHalf: number;
    eggDozen: number;
    leather: number;
    biogas: number;
    soapBeauty: number;
    soapOrganic: number;
    soapDetergent: number;
  };

  // Agriculture
  agriculture: {
    landOwned: number; // in acres
    wheatArea: number;
    paddyArea: number;
    treeCount: number;
    coconutCount: number;
    wheatGrowDays: number;
    paddyGrowDays: number;
  };

  // Real estate
  realEstate: {
    farms: number;
    houses: HouseItem[];
    rentAccumulated: number;
  };

  // Markets
  commodities: Commodity[];
  stocks: Stock[];
  cryptoCoins: CryptoCoin[];
  mutualFunds: MutualFund[];
  mfSip: MutualFundSIP;
  limitOrders: LimitOrder[];

  // Enterprises & Ventures
  businesses: BusinessEnterprise[];
  bizAllTimeEarned: number;
  restaurants: RestaurantOutlet[];
  restAllTimeEarned: number;
  hospitals: HospitalFacility[];
  hospAllTimeEarned: number;
  equipmentFleet: EquipmentUnit[];
  rentalRequests: RentalRequest[];

  // Workforce & Automation allocations
  workers: Worker[];
  allocations: {
    managerHired: boolean;
    managerAutoRebalance: boolean;
    managerAlloc: { bonds: number; sip: number; gold: number; real: number; reserve: number };
    dairyProcessor: { ghee: number; ice: number; face: number; cheese: number; autoSell: boolean };
    livestockBuyer: { Cow: number; Goat: number; Sheep: number; Chicken: number; budgetCap: number; enabled: boolean };
    eggFactory: { single: number; half: number; dozen: number; autoSell: boolean };
    bioGasMaker: { biogasPct: number; beautyPct: number; organicPct: number; detergentPct: number; autoSell: boolean };
    leatherCraftsman: { convertPct: number; autoSell: boolean };
  };

  // Skills
  unlockedSkills: string[];

  // Weather & Events
  weather: {
    current: WeatherType;
    forecast: WeatherType[];
    daysLeft: number;
  };
  insurance: Record<string, InsurancePolicy>;

  // Global & World
  travel: {
    currentCountry: string;
    visitedCountries: string[];
    travelHistory: { countryId: string; day: number; cost: number }[];
    activeBoosts: ActiveBoost[];
  };
  exports: {
    reputation: Record<string, number>;
    deals: { id: number; day: number; country: string; product: string; qty: number; revenue: number; shippingFee: number }[];
    totalExported: number;
    totalRevenue: number;
  };
  npcTrade: {
    relationships: Record<string, { trust: number; tradeCount: number; lastTrade: number }>;
    pendingOffers: NPCTradeOffer[];
    tradeLog: { day: number; npc: string; direction: string; product: string; qty: number; amount: number }[];
  };

  // Advanced Finance
  advancedFinance: {
    ipos: IPOOffer[];
    foContracts: FOContract[];
    dividendLog: { day: number; stock: string; amount: number }[];
    lastDividendDay: Record<string, number>;
  };

  // Lottery & Mini-games
  lottery: {
    ticketsBought: number;
    scratchCards: { id: number; prize: { label: string; amount: number; color: string }; revealed: boolean }[];
    jackpotPool: number;
    weeklyNumbers: number[];
    userNumbers: number[];
    wins: number;
    totalSpent: number;
    totalWon: number;
  };
  miniGames: {
    gamesPlayed: number;
    totalWon: number;
    totalLost: number;
    bestStreak: number;
    winStreak: number;
    history: { game: string; result: 'Win' | 'Lose'; amount: number; day: number }[];
  };

  // Auctions
  auctionItems: AuctionItem[];
  auctionHistory: { day: number; name: string; paid: number }[];

  // Progress, Stats & Milestones
  completedMissions: string[];
  achievedMilestones: string[];
  stats: {
    milkProduced: number;
    eggsProduced: number;
    cropsHarvested: number;
    totalRevenue: number;
    daysPlayed: number;
    loansRepaid: number;
    stormsWeathered: number;
    auctionsWon: number;
    perfectDays: number;
    patientsTreated: number;
  };
  history: {
    netWorth: number[];
    cashFlow: { day: number; income: number; expense: number }[];
  };
  eventLog: EventLogItem[];
}
