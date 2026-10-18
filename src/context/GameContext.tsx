/**
 * AR360X — Game Context & Central State Manager
 */
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { GameState, LivestockKind } from '../types/game';
import {
  INITIAL_GAME_STATE,
  BANK_CATALOG,
  CREDIT_CARD_CATALOG,
  BUSINESS_CATALOG,
  PARTNER_CATALOG,
  WORKER_CATALOG,
  SKILL_TREE_NODES,
  COUNTRIES_TRAVEL_CATALOG,
  EXPORT_COUNTRIES_CATALOG,
  NPC_TRADERS_CATALOG,
} from '../constants/initialState';
import { simulateDayTick, calculateNetWorth, soundFx } from '../services/simulation';

interface GameContextType {
  state: GameState;
  netWorthData: ReturnType<typeof calculateNetWorth>;
  isPaused: boolean;
  speed: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  show3DModal: boolean;
  setShow3DModal: (show: boolean) => void;
  
  // Actions
  buyLivestock: (kind: LivestockKind, qty: number) => boolean;
  sellLivestock: (kind: LivestockKind, qty: number) => boolean;
  feedLivestock: (kind: LivestockKind) => boolean;
  consultVet: () => boolean;
  
  convertDairy: (product: 'ghee' | 'ice' | 'face' | 'cheese', batches: number) => boolean;
  packEggs: (type: 'single' | 'half' | 'dozen', batches: number) => boolean;
  convertLeather: (qty: number) => boolean;
  convertBioGas: (dungQty: number) => boolean;
  craftSoap: (type: 'beauty' | 'organic' | 'detergent', qty: number) => boolean;
  sellInventoryItem: (key: keyof GameState['inventory'], qty: number, unitPrice: number) => boolean;
  
  plantCrop: (crop: 'wheat' | 'paddy' | 'tree' | 'coconut', amount: number) => boolean;
  buyLand: (acres: number) => boolean;
  sellLand: (acres: number) => boolean;
  buyFarm: (qty: number) => boolean;
  sellFarm: (qty: number) => boolean;
  buildHouse: (type: 'hut' | 'villa' | 'bungalow' | 'guesthouse' | 'palace', sqft: number, qty: number) => boolean;
  sellHouse: (id: string) => boolean;
  
  openBankAccount: (bankId: string) => boolean;
  depositBank: (acctId: string, amount: number) => boolean;
  withdrawBank: (acctId: string, amount: number) => boolean;
  transferBank: (fromId: string, toId: string, amount: number) => boolean;
  createFixedDeposit: (bankId: string, amount: number, days: number) => boolean;
  buyBonds: (amount: number) => boolean;
  sellBonds: (amount: number) => boolean;
  investSip: (amount: number) => boolean;
  withdrawSip: (amount: number) => boolean;
  
  applyLoan: (bankId: string, amount: number, purpose: string) => boolean;
  repayLoan: (loanId: number, amount: number) => boolean;
  applyCreditCard: (catalogId: string) => boolean;
  spendCreditCard: (cardId: number, amount: number, category: string) => boolean;
  payCreditCard: (cardId: number, amount: number) => boolean;
  
  buyStock: (stockId: string, qty: number) => boolean;
  sellStock: (stockId: string, qty: number) => boolean;
  placeLimitOrder: (assetId: string, assetType: 'stock' | 'crypto', orderType: 'buy' | 'sell', qty: number, limitPrice: number) => boolean;
  cancelLimitOrder: (orderId: number) => boolean;
  applyIPO: (ipoId: number, lots: number) => boolean;
  buyOption: (stockId: string, type: 'call' | 'put', strike: number, qty: number, premium: number) => boolean;
  
  buyCrypto: (coinId: string, inrAmount: number) => boolean;
  sellCrypto: (coinId: string, coinQty: number) => boolean;
  
  investMutualFund: (fundId: string, inrAmount: number) => boolean;
  redeemMutualFund: (fundId: string, units: number) => boolean;
  setMutualFundSIP: (fundId: string, amount: number) => boolean;
  stopMutualFundSIP: () => void;
  
  openBusiness: (catalogId: string, qty: number) => boolean;
  upgradeBusiness: (bizId: number) => boolean;
  injectBusinessCapital: (bizId: number, amount: number) => boolean;
  partnerBusiness: (bizId: number, partnerId: string, amount: number) => boolean;
  closeBusiness: (bizId: number) => boolean;
  
  openRestaurant: (tierId: 'dhaba' | 'cafe' | 'restaurant' | 'chain') => boolean;
  upgradeRestaurant: (outletId: number) => boolean;
  closeRestaurant: (outletId: number) => boolean;
  
  openHospital: (typeId: 'clinic' | 'hospital' | 'multispec') => boolean;
  upgradeHospital: (facilityId: number) => boolean;
  unlockHospitalSpec: (facilityId: number, specId: string) => boolean;
  
  buyEquipment: (equipId: string) => boolean;
  acceptRental: (reqId: number) => boolean;
  serviceEquipment: (unitId: number) => boolean;
  
  exportGoods: (countryId: string, productKey: string, qty: number) => boolean;
  tradeNpc: (npcId: string, direction: 'buy' | 'sell', productKey: string, qty: number) => boolean;
  travelToCountry: (countryId: string) => boolean;
  
  buyLotteryTicket: (type: 'daily' | 'weekly' | 'instant') => boolean;
  scratchCard: (cardId: number) => void;
  recordMiniGameResult: (game: string, result: 'Win' | 'Lose', amount: number) => void;
  
  hireWorker: (workerId: string) => boolean;
  fireWorker: (workerId: string) => boolean;
  updateWorkerAllocations: (key: keyof GameState['allocations'], values: unknown) => void;
  unlockSkill: (skillId: string) => boolean;
  buyInsurance: (category: string, premium: number, duration: number) => boolean;
  placeBid: (auctionId: number, bidAmount: number) => boolean;
  
  setSpeed: (speed: number) => void;
  togglePause: () => void;
  advanceDayManually: () => void;
  manualSave: () => void;
  exportSaveJson: () => string;
  importSaveJson: (json: string) => boolean;
  resetGame: () => void;
}

const STORAGE_KEY = 'ar360x_save_v21';

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GameState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.version >= 20) {
            return parsed;
          }
        }
      } catch (err) {
        console.error('Failed to parse saved game:', err);
      }
    }
    return INITIAL_GAME_STATE;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [show3DModal, setShow3DModal] = useState<boolean>(false);

  // Auto-Save whenever important milestones occur or periodic
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage quota or error safe guard
    }
  }, [state]);

  // Main Simulation Interval Loop
  useEffect(() => {
    if (state.clock.isPaused) return;

    // Simulation day speed
    const dayIntervalMs = Math.max(1000, 30000 / state.clock.speedMultiplier);

    const timer = setInterval(() => {
      setState((prev) => simulateDayTick(prev));
    }, dayIntervalMs);

    return () => clearInterval(timer);
  }, [state.clock.isPaused, state.clock.speedMultiplier]);

  // Sim Clock minute ticker (smooth clock hand)
  useEffect(() => {
    if (state.clock.isPaused) return;
    const minuteTick = setInterval(() => {
      setState((prev) => {
        const simMinutes = (prev.clock.simMinutes + 12 * prev.clock.speedMultiplier) % (24 * 60);
        return {
          ...prev,
          clock: {
            ...prev.clock,
            simMinutes,
          },
        };
      });
    }, 1000);

    return () => clearInterval(minuteTick);
  }, [state.clock.isPaused, state.clock.speedMultiplier]);

  // Net Worth computation
  const netWorthData = calculateNetWorth(state);

  // Helper push log
  const pushLog = (msg: string, type: 'info' | 'warn' | 'danger' | 'success') => {
    const hh = String(Math.floor(state.clock.simMinutes / 60)).padStart(2, '0');
    const mm = String(state.clock.simMinutes % 60).padStart(2, '0');
    state.eventLog.unshift({
      id: `ev_${Date.now()}_${Math.random()}`,
      day: state.clock.dayCount,
      time: `${hh}:${mm}`,
      msg,
      type,
    });
  };

  // --------------------------------------------------------------------------
  // LIVESTOCK ACTIONS
  // --------------------------------------------------------------------------
  const buyLivestock = (kind: LivestockKind, qty: number): boolean => {
    if (qty <= 0) return false;
    const cost = state.livestock[kind].basePrice * qty;
    if (state.finances.cash < cost) return false;

    setState((prev) => {
      const next = { ...prev };
      next.finances.cash -= cost;
      next.livestock[kind].count += qty;
      return next;
    });
    soundFx.playCashRegister();
    pushLog(`Purchased ${qty}× ${kind} for ₹${cost.toLocaleString()}`, 'success');
    return true;
  };

  const sellLivestock = (kind: LivestockKind, qty: number): boolean => {
    if (qty <= 0 || state.livestock[kind].count < qty) return false;
    const rev = Math.round(state.livestock[kind].basePrice * qty * 0.85);

    setState((prev) => {
      const next = { ...prev };
      next.livestock[kind].count -= qty;
      next.finances.cash += rev;
      return next;
    });
    soundFx.playCoin();
    pushLog(`Sold ${qty}× ${kind} for ₹${rev.toLocaleString()}`, 'info');
    return true;
  };

  const feedLivestock = (kind: LivestockKind): boolean => {
    const cost = 25 * Math.max(1, state.livestock[kind].count);
    if (state.finances.cash < cost) return false;

    setState((prev) => {
      const next = { ...prev };
      next.finances.cash -= cost;
      next.livestock[kind].health = Math.min(100, next.livestock[kind].health + 15);
      return next;
    });
    soundFx.playCoin();
    pushLog(`Fed ${kind} herd (+15 HP)`, 'success');
    return true;
  };

  const consultVet = (): boolean => {
    const cost = 800;
    if (state.finances.cash < cost) return false;

    setState((prev) => {
      const next = { ...prev };
      next.finances.cash -= cost;
      (Object.keys(next.livestock) as LivestockKind[]).forEach((k) => {
        next.livestock[k].health = Math.min(100, next.livestock[k].health + 25);
      });
      return next;
    });
    soundFx.playSuccess();
    pushLog(`Veterinary consultation complete! All animal herds healed +25 HP`, 'success');
    return true;
  };

  // --------------------------------------------------------------------------
  // FACTORY ACTIONS
  // --------------------------------------------------------------------------
  const convertDairy = (product: 'ghee' | 'ice' | 'face' | 'cheese', batches: number): boolean => {
    const ratios = { ghee: 4, ice: 6, face: 10, cheese: 5 };
    const requiredMilk = ratios[product] * batches;
    if (state.inventory.milk < requiredMilk || batches <= 0) return false;

    setState((prev) => {
      const next = { ...prev };
      next.inventory.milk -= requiredMilk;
      next.inventory[product] += batches;
      return next;
    });
    soundFx.playCoin();
    pushLog(`Dairy Factory: Processed ${requiredMilk}L Milk → ${batches} ${product.toUpperCase()}`, 'success');
    return true;
  };

  const packEggs = (type: 'single' | 'half' | 'dozen', batches: number): boolean => {
    const counts = { single: 1, half: 6, dozen: 12 };
    const requiredEggs = counts[type] * batches;
    if (state.inventory.eggs < requiredEggs || batches <= 0) return false;

    setState((prev) => {
      const next = { ...prev };
      next.inventory.eggs -= requiredEggs;
      if (type === 'single') next.inventory.eggSingle += batches;
      if (type === 'half') next.inventory.eggHalf += batches;
      if (type === 'dozen') next.inventory.eggDozen += batches;
      return next;
    });
    soundFx.playCoin();
    pushLog(`Egg Factory: Packed ${batches} ${type} egg cartons`, 'success');
    return true;
  };

  const convertLeather = (qty: number): boolean => {
    if (state.inventory.skins < qty || qty <= 0) return false;
    setState((prev) => {
      const next = { ...prev };
      next.inventory.skins -= qty;
      next.inventory.leather += qty;
      return next;
    });
    soundFx.playCoin();
    pushLog(`Leather Tannery: Converted ${qty} raw skins into cured leather`, 'success');
    return true;
  };

  const convertBioGas = (dungQty: number): boolean => {
    if (state.inventory.dung < dungQty || dungQty <= 0) return false;
    setState((prev) => {
      const next = { ...prev };
      next.inventory.dung -= dungQty;
      next.inventory.biogas += dungQty;
      return next;
    });
    soundFx.playCoin();
    pushLog(`BioGas Refinery: Digested ${dungQty} dung into clean biogas fuel`, 'success');
    return true;
  };

  const craftSoap = (type: 'beauty' | 'organic' | 'detergent', qty: number): boolean => {
    if (qty <= 0) return false;
    if (type === 'beauty' && state.inventory.milk < qty) return false;
    if (type === 'organic' && state.inventory.dung < qty) return false;
    if (type === 'detergent' && state.inventory.biogas < qty) return false;

    setState((prev) => {
      const next = { ...prev };
      if (type === 'beauty') {
        next.inventory.milk -= qty;
        next.inventory.soapBeauty += qty;
      } else if (type === 'organic') {
        next.inventory.dung -= qty;
        next.inventory.soapOrganic += qty;
      } else {
        next.inventory.biogas -= qty;
        next.inventory.soapDetergent += qty;
      }
      return next;
    });
    soundFx.playCoin();
    pushLog(`Crafted ${qty} ${type} soaps`, 'success');
    return true;
  };

  const sellInventoryItem = (key: keyof GameState['inventory'], qty: number, unitPrice: number): boolean => {
    if (state.inventory[key] < qty || qty <= 0) return false;
    const totalRev = qty * unitPrice;

    setState((prev) => {
      const next = { ...prev };
      next.inventory[key] -= qty;
      next.finances.cash += totalRev;
      next.stats.totalRevenue += totalRev;
      return next;
    });
    soundFx.playCashRegister();
    pushLog(`Sold ${qty}× ${key} for ₹${totalRev.toLocaleString()}`, 'success');
    return true;
  };

  // --------------------------------------------------------------------------
  // AGRICULTURE & REAL ESTATE
  // --------------------------------------------------------------------------
  const plantCrop = (crop: 'wheat' | 'paddy' | 'tree' | 'coconut', amount: number): boolean => {
    const costs = { wheat: 500, paddy: 800, tree: 100, coconut: 250 };
    const totalCost = costs[crop] * amount;
    if (state.finances.cash < totalCost || amount <= 0) return false;

    setState((prev) => {
      const next = { ...prev };
      next.finances.cash -= totalCost;
      if (crop === 'wheat') next.agriculture.wheatArea += amount;
      if (crop === 'paddy') next.agriculture.paddyArea += amount;
      if (crop === 'tree') next.agriculture.treeCount += amount;
      if (crop === 'coconut') next.agriculture.coconutCount += amount;
      return next;
    });
    soundFx.playCoin();
    pushLog(`Planted ${amount} units of ${crop} for ₹${totalCost.toLocaleString()}`, 'success');
    return true;
  };

  const buyLand = (acres: number): boolean => {
    const cost = acres * 1000;
    if (state.finances.cash < cost || acres <= 0) return false;
    setState((prev) => {
      const next = { ...prev };
      next.finances.cash -= cost;
      next.agriculture.landOwned += acres;
      return next;
    });
    soundFx.playCashRegister();
    pushLog(`Acquired ${acres} acres of Farmland for ₹${cost.toLocaleString()}`, 'success');
    return true;
  };

  const sellLand = (acres: number): boolean => {
    if (state.agriculture.landOwned < acres || acres <= 0) return false;
    const rev = Math.round(acres * 1000 * 0.9);
    setState((prev) => {
      const next = { ...prev };
      next.agriculture.landOwned -= acres;
      next.finances.cash += rev;
      return next;
    });
    soundFx.playCoin();
    pushLog(`Sold ${acres} acres of Farmland for ₹${rev.toLocaleString()}`, 'info');
    return true;
  };

  const buyFarm = (qty: number): boolean => {
    const cost = qty * 5000;
    if (state.finances.cash < cost || qty <= 0) return false;
    setState((prev) => {
      const next = { ...prev };
      next.finances.cash -= cost;
      next.realEstate.farms += qty;
      return next;
    });
    soundFx.playCashRegister();
    pushLog(`Acquired ${qty} Commercial Farms for ₹${cost.toLocaleString()}`, 'success');
    return true;
  };

  const sellFarm = (qty: number): boolean => {
    if (state.realEstate.farms < qty || qty <= 0) return false;
    const rev = Math.round(qty * 5000 * 0.85);
    setState((prev) => {
      const next = { ...prev };
      next.realEstate.farms -= qty;
      next.finances.cash += rev;
      return next;
    });
    soundFx.playCoin();
    pushLog(`Sold ${qty} Farms for ₹${rev.toLocaleString()}`, 'info');
    return true;
  };

  const buildHouse = (type: 'hut' | 'villa' | 'bungalow' | 'guesthouse' | 'palace', sqft: number, qty: number): boolean => {
    const baseRates = { hut: 600, villa: 1500, bungalow: 2500, guesthouse: 4000, palace: 8000 };
    const rentRates = { hut: 0.05, villa: 0.12, bungalow: 0.18, guesthouse: 0.25, palace: 0.4 };
    const unitCost = Math.round(sqft * (baseRates[type] / 100));
    const totalCost = unitCost * qty;
    if (state.finances.cash < totalCost || qty <= 0 || sqft < 100) return false;

    setState((prev) => {
      const next = { ...prev };
      next.finances.cash -= totalCost;
      for (let i = 0; i < qty; i++) {
        next.realEstate.houses.push({
          id: `h_${Date.now()}_${i}`,
          type,
          sqft,
          buildCost: unitCost,
          dailyRent: Math.round(sqft * rentRates[type]),
          builtDay: next.clock.dayCount,
        });
      }
      return next;
    });
    soundFx.playCashRegister();
    pushLog(`Constructed ${qty}× ${type} (${sqft} sqft) for ₹${totalCost.toLocaleString()}`, 'success');
    return true;
  };

  const sellHouse = (id: string): boolean => {
    const idx = state.realEstate.houses.findIndex((h) => h.id === id);
    if (idx < 0) return false;
    const house = state.realEstate.houses[idx];
    const rev = Math.round(house.buildCost * 0.8);

    setState((prev) => {
      const next = { ...prev };
      next.realEstate.houses.splice(idx, 1);
      next.finances.cash += rev;
      return next;
    });
    soundFx.playCoin();
    pushLog(`Sold ${house.type} for ₹${rev.toLocaleString()}`, 'info');
    return true;
  };

  // --------------------------------------------------------------------------
  // BANKING & PERSONAL FINANCE
  // --------------------------------------------------------------------------
  const openBankAccount = (bankId: string): boolean => {
    const bankCfg = BANK_CATALOG.find((b) => b.id === bankId);
    if (!bankCfg) return false;
    if (state.bankAccounts.some((a) => a.bankId === bankId)) return false;
    if (state.finances.cash < bankCfg.openFee) return false;

    setState((prev) => {
      const next = { ...prev };
      next.finances.cash -= bankCfg.openFee;
      next.bankAccounts.push({
        id: `acct_${Date.now()}`,
        bankId,
        name: `${bankCfg.short} Account`,
        balance: 0,
        openedDay: next.clock.dayCount,
        interestEarned: 0,
      });
      return next;
    });
    soundFx.playSuccess();
    pushLog(`Opened new savings account at ${bankCfg.name}!`, 'success');
    return true;
  };

  const depositBank = (acctId: string, amount: number): boolean => {
    if (amount <= 0 || state.finances.cash < amount) return false;
    const acct = state.bankAccounts.find((a) => a.id === acctId);
    if (!acct) return false;

    setState((prev) => {
      const next = { ...prev };
      next.finances.cash -= amount;
      const target = next.bankAccounts.find((a) => a.id === acctId);
      if (target) target.balance += amount;
      return next;
    });
    soundFx.playCoin();
    pushLog(`Deposited ₹${amount.toLocaleString()} into ${acct.name}`, 'success');
    return true;
  };

  const withdrawBank = (acctId: string, amount: number): boolean => {
    const acct = state.bankAccounts.find((a) => a.id === acctId);
    if (!acct || acct.balance < amount || amount <= 0) return false;

    setState((prev) => {
      const next = { ...prev };
      const target = next.bankAccounts.find((a) => a.id === acctId);
      if (target) {
        target.balance -= amount;
        next.finances.cash += amount;
      }
      return next;
    });
    soundFx.playCoin();
    pushLog(`Withdrew ₹${amount.toLocaleString()} from ${acct.name}`, 'info');
    return true;
  };

  const transferBank = (fromId: string, toId: string, amount: number): boolean => {
    if (fromId === toId || amount <= 0) return false;
    const fromAcct = state.bankAccounts.find((a) => a.id === fromId);
    const toAcct = state.bankAccounts.find((a) => a.id === toId);
    if (!fromAcct || !toAcct || fromAcct.balance < amount) return false;

    setState((prev) => {
      const next = { ...prev };
      const f = next.bankAccounts.find((a) => a.id === fromId);
      const t = next.bankAccounts.find((a) => a.id === toId);
      if (f && t) {
        f.balance -= amount;
        t.balance += amount;
      }
      return next;
    });
    soundFx.playCoin();
    pushLog(`Transferred ₹${amount.toLocaleString()} from ${fromAcct.name} → ${toAcct.name}`, 'info');
    return true;
  };

  const createFixedDeposit = (bankId: string, amount: number, days: number): boolean => {
    if (amount <= 0 || days <= 0 || state.finances.cash < amount) return false;
    const bankCfg = BANK_CATALOG.find((b) => b.id === bankId) || BANK_CATALOG[0];

    setState((prev) => {
      const next = { ...prev };
      next.finances.cash -= amount;
      next.finances.fixedDeposits.push({
        id: `fd_${Date.now()}`,
        amount,
        daysLeft: days,
        totalDays: days,
        fdRate: bankCfg.fdRate,
        bankId,
      });
      return next;
    });
    soundFx.playCashRegister();
    pushLog(`Locked ₹${amount.toLocaleString()} into ${days}-day Fixed Deposit @ ${(bankCfg.fdRate * 100).toFixed(1)}%/yr`, 'success');
    return true;
  };

  const buyBonds = (amount: number): boolean => {
    if (amount <= 0 || state.finances.cash < amount) return false;
    setState((prev) => ({
      ...prev,
      finances: {
        ...prev.finances,
        cash: prev.finances.cash - amount,
        bonds: prev.finances.bonds + amount,
      },
    }));
    soundFx.playCoin();
    pushLog(`Invested ₹${amount.toLocaleString()} in Sovereign Bonds`, 'success');
    return true;
  };

  const sellBonds = (amount: number): boolean => {
    if (amount <= 0 || state.finances.bonds < amount) return false;
    const rev = Math.round(amount * 0.98);
    setState((prev) => ({
      ...prev,
      finances: {
        ...prev.finances,
        cash: prev.finances.cash + rev,
        bonds: prev.finances.bonds - amount,
      },
    }));
    soundFx.playCoin();
    pushLog(`Liquidated ₹${amount.toLocaleString()} Bonds for ₹${rev.toLocaleString()}`, 'info');
    return true;
  };

  const investSip = (amount: number): boolean => {
    if (amount <= 0 || state.finances.cash < amount) return false;
    setState((prev) => ({
      ...prev,
      finances: {
        ...prev.finances,
        cash: prev.finances.cash - amount,
        sip: prev.finances.sip + amount,
      },
    }));
    soundFx.playCoin();
    pushLog(`SIP Deposit: ₹${amount.toLocaleString()} invested in index plan`, 'success');
    return true;
  };

  const withdrawSip = (amount: number): boolean => {
    if (amount <= 0 || state.finances.sip < amount) return false;
    setState((prev) => ({
      ...prev,
      finances: {
        ...prev.finances,
        cash: prev.finances.cash + amount,
        sip: prev.finances.sip - amount,
      },
    }));
    soundFx.playCoin();
    pushLog(`Withdrew ₹${amount.toLocaleString()} from SIP portfolio`, 'info');
    return true;
  };

  // --------------------------------------------------------------------------
  // LOANS & CREDIT CARDS
  // --------------------------------------------------------------------------
  const applyLoan = (bankId: string, amount: number, purpose: string): boolean => {
    const bankCfg = BANK_CATALOG.find((b) => b.id === bankId);
    if (!bankCfg || amount <= 0) return false;
    if (state.finances.creditScore < bankCfg.minCibilScore) {
      soundFx.playWarning();
      pushLog(`Loan application rejected by ${bankCfg.name}: CIBIL score too low`, 'danger');
      return false;
    }

    const waitDays = state.finances.creditScore >= 750 ? 2 : 4;
    setState((prev) => {
      const next = { ...prev };
      next.loanApplications.push({
        id: next.loanApplications.length + 1,
        amount,
        purpose,
        appliedDay: next.clock.dayCount,
        approveDue: next.clock.dayCount + waitDays,
        status: 'pending',
        bankId,
      });
      return next;
    });
    soundFx.playSuccess();
    pushLog(`Submitted loan request of ₹${amount.toLocaleString()} to ${bankCfg.name}. Review in ${waitDays} days.`, 'info');
    return true;
  };

  const repayLoan = (loanId: number, amount: number): boolean => {
    const loan = state.activeLoans.find((l) => l.id === loanId);
    if (!loan || amount <= 0 || state.finances.cash < amount) return false;
    const actualPay = Math.min(amount, loan.amount);

    setState((prev) => {
      const next = { ...prev };
      next.finances.cash -= actualPay;
      const target = next.activeLoans.find((l) => l.id === loanId);
      if (target) {
        target.amount -= actualPay;
        if (target.amount <= 1) {
          next.activeLoans = next.activeLoans.filter((l) => l.id !== loanId);
          next.finances.creditScore = Math.min(900, next.finances.creditScore + 30);
          next.finances.loanRepaidCount += 1;
        }
      }
      return next;
    });
    soundFx.playCashRegister();
    pushLog(`Repaid ₹${actualPay.toLocaleString()} on Loan #${loanId}`, 'success');
    return true;
  };

  const applyCreditCard = (catalogId: string): boolean => {
    const config = CREDIT_CARD_CATALOG.find((c) => c.id === catalogId);
    if (!config) return false;
    if (state.creditCards.some((cc) => cc.catalogId === catalogId)) return false;
    if (state.finances.creditScore < config.minScore) {
      soundFx.playWarning();
      pushLog(`Card application declined: CIBIL below ${config.minScore}`, 'danger');
      return false;
    }

    const newLimit = Math.round(25000 * config.limitMult);
    setState((prev) => {
      const next = { ...prev };
      next.creditCards.push({
        id: next.creditCards.length + 1,
        catalogId,
        active: true,
        limit: newLimit,
        outstanding: 0,
        billingDay: next.clock.dayCount + 30,
        transactions: [],
        minDue: 0,
        appliedDay: next.clock.dayCount,
        approvePending: false,
        cashbackEarned: 0,
      });
      return next;
    });
    soundFx.playSuccess();
    pushLog(`Approved for ${config.name}! Credit Limit: ₹${newLimit.toLocaleString()}`, 'success');
    return true;
  };

  const spendCreditCard = (cardId: number, amount: number, category: string): boolean => {
    const card = state.creditCards.find((c) => c.id === cardId);
    if (!card || !card.active || card.outstanding + amount > card.limit || amount <= 0) return false;

    const config = CREDIT_CARD_CATALOG.find((cfg) => cfg.id === card.catalogId);
    const cbRate = config?.tier === 'Black' ? 0.15 : config?.tier === 'Platinum' ? 0.1 : config?.tier === 'Gold' ? 0.05 : 0.02;
    const cashback = Math.round(amount * cbRate);

    setState((prev) => {
      const next = { ...prev };
      const target = next.creditCards.find((c) => c.id === cardId);
      if (target) {
        target.outstanding += amount;
        target.minDue = Math.round(target.outstanding * 0.05);
        target.cashbackEarned += cashback;
        target.transactions.unshift({
          day: next.clock.dayCount,
          desc: `${category} purchase`,
          amount,
          type: 'spend',
        });
      }
      next.finances.cash += amount + cashback; // buying power injected
      return next;
    });
    soundFx.playCashRegister();
    pushLog(`Charged ₹${amount.toLocaleString()} to card · Cashback +₹${cashback}`, 'success');
    return true;
  };

  const payCreditCard = (cardId: number, amount: number): boolean => {
    const card = state.creditCards.find((c) => c.id === cardId);
    if (!card || amount <= 0 || state.finances.cash < amount) return false;
    const payAmt = Math.min(amount, card.outstanding);

    setState((prev) => {
      const next = { ...prev };
      next.finances.cash -= payAmt;
      const target = next.creditCards.find((c) => c.id === cardId);
      if (target) {
        target.outstanding -= payAmt;
        target.minDue = Math.round(target.outstanding * 0.05);
        if (target.outstanding <= 0) {
          next.finances.creditScore = Math.min(900, next.finances.creditScore + 15);
        }
      }
      return next;
    });
    soundFx.playCoin();
    pushLog(`Paid ₹${payAmt.toLocaleString()} towards credit card balance`, 'success');
    return true;
  };

  // --------------------------------------------------------------------------
  // STOCKS, CRYPTO & ADVANCED FINANCE
  // --------------------------------------------------------------------------
  const buyStock = (stockId: string, qty: number): boolean => {
    const stock = state.stocks.find((s) => s.id === stockId);
    if (!stock || qty <= 0) return false;
    const totalCost = stock.price * qty;
    if (state.finances.cash < totalCost) return false;

    setState((prev) => {
      const next = { ...prev };
      next.finances.cash -= totalCost;
      const target = next.stocks.find((s) => s.id === stockId);
      if (target) {
        const prevVal = target.holding * target.avgBuy;
        target.holding += qty;
        target.avgBuy = Math.round((prevVal + totalCost) / target.holding);
      }
      return next;
    });
    soundFx.playCashRegister();
    pushLog(`Acquired ${qty} shares of ${stock.id} @ ₹${stock.price}`, 'success');
    return true;
  };

  const sellStock = (stockId: string, qty: number): boolean => {
    const stock = state.stocks.find((s) => s.id === stockId);
    if (!stock || qty <= 0 || stock.holding < qty) return false;
    const totalRev = stock.price * qty;

    setState((prev) => {
      const next = { ...prev };
      next.finances.cash += totalRev;
      const target = next.stocks.find((s) => s.id === stockId);
      if (target) {
        target.holding -= qty;
        if (target.holding === 0) target.avgBuy = 0;
      }
      return next;
    });
    soundFx.playCoin();
    pushLog(`Sold ${qty} shares of ${stock.id} for ₹${totalRev.toLocaleString()}`, 'info');
    return true;
  };

  const placeLimitOrder = (assetId: string, assetType: 'stock' | 'crypto', orderType: 'buy' | 'sell', qty: number, limitPrice: number): boolean => {
    if (qty <= 0 || limitPrice <= 0) return false;
    setState((prev) => ({
      ...prev,
      limitOrders: [
        ...prev.limitOrders,
        {
          id: Date.now(),
          assetId,
          assetType,
          orderType,
          qty,
          limitPrice,
        },
      ],
    }));
    soundFx.playSuccess();
    pushLog(`Placed limit ${orderType.toUpperCase()} order on ${assetId} @ ₹${limitPrice}`, 'info');
    return true;
  };

  const cancelLimitOrder = (orderId: number): boolean => {
    setState((prev) => ({
      ...prev,
      limitOrders: prev.limitOrders.filter((o) => o.id !== orderId),
    }));
    return true;
  };

  const applyIPO = (ipoId: number, lots: number): boolean => {
    const ipo = state.advancedFinance.ipos.find((i) => i.id === ipoId);
    if (!ipo || ipo.status !== 'open' || lots <= 0) return false;
    const cost = lots * ipo.lotSize * ipo.issuePrice;
    if (state.finances.cash < cost) return false;

    setState((prev) => {
      const next = { ...prev };
      next.finances.cash -= cost;
      const target = next.advancedFinance.ipos.find((i) => i.id === ipoId);
      if (target) {
        target.lotsApplied = lots;
        target.status = 'applied';
      }
      return next;
    });
    soundFx.playCashRegister();
    pushLog(`Applied for ${lots} lot(s) in ${ipo.name} IPO! Cost: ₹${cost.toLocaleString()}`, 'success');
    return true;
  };

  const buyOption = (stockId: string, type: 'call' | 'put', strike: number, qty: number, premium: number): boolean => {
    const totalPremium = premium * qty;
    if (state.finances.cash < totalPremium || qty <= 0) return false;

    setState((prev) => {
      const next = { ...prev };
      next.finances.cash -= totalPremium;
      next.advancedFinance.foContracts.push({
        id: Date.now(),
        stockId,
        type,
        strikePrice: strike,
        qty,
        premium,
        totalPremium,
        boughtDay: next.clock.dayCount,
        expiryDay: next.clock.dayCount + 7,
        status: 'active',
        pnl: 0,
      });
      return next;
    });
    soundFx.playSuccess();
    pushLog(`Purchased ${type.toUpperCase()} Option: ${qty} contracts on ${stockId} @ strike ₹${strike}`, 'success');
    return true;
  };

  const buyCrypto = (coinId: string, inrAmount: number): boolean => {
    const coin = state.cryptoCoins.find((c) => c.id === coinId);
    if (!coin || inrAmount <= 0 || state.finances.cash < inrAmount) return false;
    const qty = inrAmount / coin.price;

    setState((prev) => {
      const next = { ...prev };
      next.finances.cash -= inrAmount;
      const target = next.cryptoCoins.find((c) => c.id === coinId);
      if (target) {
        const prevVal = target.holding * target.avgBuy;
        target.holding += qty;
        target.avgBuy = (prevVal + inrAmount) / target.holding;
      }
      return next;
    });
    soundFx.playCashRegister();
    pushLog(`Bought ${qty.toFixed(4)} ${coin.symbol} for ₹${inrAmount.toLocaleString()}`, 'success');
    return true;
  };

  const sellCrypto = (coinId: string, coinQty: number): boolean => {
    const coin = state.cryptoCoins.find((c) => c.id === coinId);
    if (!coin || coinQty <= 0 || coin.holding < coinQty) return false;
    const rev = Math.round(coin.price * coinQty);

    setState((prev) => {
      const next = { ...prev };
      next.finances.cash += rev;
      const target = next.cryptoCoins.find((c) => c.id === coinId);
      if (target) {
        target.holding -= coinQty;
        if (target.holding <= 0.00001) target.avgBuy = 0;
      }
      return next;
    });
    soundFx.playCoin();
    pushLog(`Sold ${coinQty.toFixed(4)} ${coin.symbol} for ₹${rev.toLocaleString()}`, 'info');
    return true;
  };

  const investMutualFund = (fundId: string, inrAmount: number): boolean => {
    const fund = state.mutualFunds.find((f) => f.id === fundId);
    if (!fund || inrAmount < 500 || state.finances.cash < inrAmount) return false;
    const units = inrAmount / fund.nav;

    setState((prev) => {
      const next = { ...prev };
      next.finances.cash -= inrAmount;
      const target = next.mutualFunds.find((f) => f.id === fundId);
      if (target) {
        const prevCost = target.units * target.avgNav;
        target.units += units;
        target.avgNav = (prevCost + inrAmount) / target.units;
      }
      return next;
    });
    soundFx.playCashRegister();
    pushLog(`Invested ₹${inrAmount.toLocaleString()} into ${fund.name}`, 'success');
    return true;
  };

  const redeemMutualFund = (fundId: string, units: number): boolean => {
    const fund = state.mutualFunds.find((f) => f.id === fundId);
    if (!fund || units <= 0 || fund.units < units) return false;
    const rev = Math.round(units * fund.nav);

    setState((prev) => {
      const next = { ...prev };
      next.finances.cash += rev;
      const target = next.mutualFunds.find((f) => f.id === fundId);
      if (target) {
        target.units -= units;
        if (target.units <= 0) target.avgNav = 0;
      }
      return next;
    });
    soundFx.playCoin();
    pushLog(`Redeemed ${units.toFixed(2)} units of ${fund.name} for ₹${rev.toLocaleString()}`, 'info');
    return true;
  };

  const setMutualFundSIP = (fundId: string, amount: number): boolean => {
    setState((prev) => ({
      ...prev,
      mfSip: { fundId, amount, nextDue: prev.clock.dayCount + 30 },
    }));
    soundFx.playSuccess();
    pushLog(`Configured monthly auto-SIP of ₹${amount.toLocaleString()}`, 'info');
    return true;
  };

  const stopMutualFundSIP = () => {
    setState((prev) => ({
      ...prev,
      mfSip: { fundId: null, amount: 0, nextDue: 0 },
    }));
  };

  // --------------------------------------------------------------------------
  // BUSINESSES, VENTURES & ENTERPRISES
  // --------------------------------------------------------------------------
  const openBusiness = (catalogId: string, qty: number): boolean => {
    const config = BUSINESS_CATALOG.find((c) => c.id === catalogId);
    if (!config || qty <= 0) return false;
    const totalCost = config.openCost * qty;
    if (state.finances.cash < totalCost) return false;

    setState((prev) => {
      const next = { ...prev };
      next.finances.cash -= totalCost;
      const existing = next.businesses.find((b) => b.catalogId === catalogId);
      if (existing) {
        existing.qty += qty;
      } else {
        next.businesses.push({
          id: next.businesses.length + 1,
          catalogId,
          tier: 1,
          reputation: 3.5,
          daysOpen: 1,
          dailyRevEarned: 0,
          qty,
          extraInvestment: 0,
          partners: [],
          investHistory: [],
        });
      }
      return next;
    });
    soundFx.playCashRegister();
    pushLog(`Launched ${qty}× ${config.name} branches for ₹${totalCost.toLocaleString()}`, 'success');
    return true;
  };

  const upgradeBusiness = (bizId: number): boolean => {
    const biz = state.businesses.find((b) => b.id === bizId);
    const config = BUSINESS_CATALOG.find((c) => c.id === biz?.catalogId);
    if (!biz || !config || biz.tier >= config.maxTier) return false;
    const cost = config.tierUpCost[biz.tier - 1];
    if (state.finances.cash < cost) return false;

    setState((prev) => {
      const next = { ...prev };
      next.finances.cash -= cost;
      const target = next.businesses.find((b) => b.id === bizId);
      if (target) {
        target.tier += 1;
        target.reputation = Math.min(5, target.reputation + 0.5);
      }
      return next;
    });
    soundFx.playSuccess();
    pushLog(`Upgraded ${config.name} to Tier ${biz.tier + 1}!`, 'success');
    return true;
  };

  const injectBusinessCapital = (bizId: number, amount: number): boolean => {
    if (amount <= 0 || state.finances.cash < amount) return false;
    setState((prev) => {
      const next = { ...prev };
      next.finances.cash -= amount;
      const target = next.businesses.find((b) => b.id === bizId);
      if (target) {
        target.extraInvestment += amount;
        target.investHistory.push({ day: next.clock.dayCount, amount, type: 'inject' });
      }
      return next;
    });
    soundFx.playCashRegister();
    pushLog(`Injected ₹${amount.toLocaleString()} capital into business`, 'success');
    return true;
  };

  const partnerBusiness = (bizId: number, partnerId: string, amount: number): boolean => {
    const partner = PARTNER_CATALOG.find((p) => p.id === partnerId);
    if (!partner) return false;

    setState((prev) => {
      const next = { ...prev };
      next.finances.cash += amount; // Partner injects cash
      const target = next.businesses.find((b) => b.id === bizId);
      if (target) {
        target.partners.push({ partnerId, amount, startDay: next.clock.dayCount });
        target.reputation = Math.min(5, target.reputation + 0.4);
      }
      return next;
    });
    soundFx.playSuccess();
    pushLog(`Signed investment partnership with ${partner.name}! Capital added: ₹${amount.toLocaleString()}`, 'success');
    return true;
  };

  const closeBusiness = (bizId: number): boolean => {
    const idx = state.businesses.findIndex((b) => b.id === bizId);
    if (idx < 0) return false;
    const biz = state.businesses[idx];
    const config = BUSINESS_CATALOG.find((c) => c.id === biz.catalogId);
    const refund = Math.round((config?.openCost || 10000) * biz.qty * 0.4);

    setState((prev) => {
      const next = { ...prev };
      next.businesses.splice(idx, 1);
      next.finances.cash += refund;
      return next;
    });
    soundFx.playCoin();
    pushLog(`Closed business #${bizId}. Liquidation refund: ₹${refund.toLocaleString()}`, 'info');
    return true;
  };

  // Restaurants
  const openRestaurant = (tierId: 'dhaba' | 'cafe' | 'restaurant' | 'chain'): boolean => {
    const costs = { dhaba: 15000, cafe: 60000, restaurant: 200000, chain: 800000 };
    const cost = costs[tierId];
    if (state.finances.cash < cost) return false;

    setState((prev) => {
      const next = { ...prev };
      next.finances.cash -= cost;
      next.restaurants.push({
        id: next.restaurants.length + 1,
        tierId,
        name: `${tierId.toUpperCase()} Outlet #${next.restaurants.length + 1}`,
        location: 'City Centre',
        level: 1,
        dailyRevEarned: 0,
        menuItems: [{ name: 'Chef Special', price: 150, dailySales: 15 }],
        openedDay: next.clock.dayCount,
      });
      return next;
    });
    soundFx.playCashRegister();
    pushLog(`Opened new ${tierId} restaurant outlet!`, 'success');
    return true;
  };

  const upgradeRestaurant = (outletId: number): boolean => {
    const r = state.restaurants.find((res) => res.id === outletId);
    if (!r) return false;
    const cost = r.level * 25000;
    if (state.finances.cash < cost) return false;

    setState((prev) => {
      const next = { ...prev };
      next.finances.cash -= cost;
      const target = next.restaurants.find((res) => res.id === outletId);
      if (target) target.level += 1;
      return next;
    });
    soundFx.playSuccess();
    pushLog(`Upgraded Restaurant #${outletId} to Level ${r.level + 1}`, 'success');
    return true;
  };

  const closeRestaurant = (outletId: number): boolean => {
    setState((prev) => ({
      ...prev,
      restaurants: prev.restaurants.filter((r) => r.id !== outletId),
      finances: {
        ...prev.finances,
        cash: prev.finances.cash + 10000,
      },
    }));
    return true;
  };

  // Hospitals
  const openHospital = (typeId: 'clinic' | 'hospital' | 'multispec'): boolean => {
    const costs = { clinic: 30000, hospital: 250000, multispec: 900000 };
    const cost = costs[typeId];
    if (state.finances.cash < cost) return false;

    setState((prev) => {
      const next = { ...prev };
      next.finances.cash -= cost;
      next.hospitals.push({
        id: next.hospitals.length + 1,
        typeId,
        level: 1,
        specs: [],
        dailyPatients: 0,
        dailyRevEarned: 0,
        openedDay: next.clock.dayCount,
      });
      return next;
    });
    soundFx.playCashRegister();
    pushLog(`Commissioned new medical facility: ${typeId.toUpperCase()}`, 'success');
    return true;
  };

  const upgradeHospital = (facilityId: number): boolean => {
    const h = state.hospitals.find((fac) => fac.id === facilityId);
    if (!h) return false;
    const cost = h.level * 50000;
    if (state.finances.cash < cost) return false;

    setState((prev) => {
      const next = { ...prev };
      next.finances.cash -= cost;
      const target = next.hospitals.find((fac) => fac.id === facilityId);
      if (target) target.level += 1;
      return next;
    });
    soundFx.playSuccess();
    pushLog(`Upgraded Medical Center #${facilityId} to Level ${h.level + 1}`, 'success');
    return true;
  };

  const unlockHospitalSpec = (facilityId: number, specId: string): boolean => {
    const cost = 50000;
    if (state.finances.cash < cost) return false;

    setState((prev) => {
      const next = { ...prev };
      next.finances.cash -= cost;
      const target = next.hospitals.find((fac) => fac.id === facilityId);
      if (target && !target.specs.includes(specId)) {
        target.specs.push(specId);
      }
      return next;
    });
    soundFx.playSuccess();
    pushLog(`Added specialized ${specId} department to Hospital #${facilityId}`, 'success');
    return true;
  };

  // Equipment
  const buyEquipment = (equipId: string): boolean => {
    const cost = 80000;
    if (state.finances.cash < cost) return false;

    setState((prev) => {
      const next = { ...prev };
      next.finances.cash -= cost;
      next.equipmentFleet.push({
        id: next.equipmentFleet.length + 1,
        equipId,
        status: 'available',
        rentedTill: 0,
        dailyRent: 0,
        totalEarned: 0,
        purchasedDay: next.clock.dayCount,
      });
      return next;
    });
    soundFx.playCashRegister();
    pushLog(`Added machinery ${equipId.toUpperCase()} to your commercial equipment fleet`, 'success');
    return true;
  };

  const acceptRental = (reqId: number): boolean => {
    const req = state.rentalRequests.find((r) => r.id === reqId);
    if (!req) return false;
    const availableUnit = state.equipmentFleet.find((u) => u.equipId === req.equipId && u.status === 'available');
    if (!availableUnit) return false;

    setState((prev) => {
      const next = { ...prev };
      const target = next.equipmentFleet.find((u) => u.id === availableUnit.id);
      if (target) {
        target.status = 'rented';
        target.rentedTill = next.clock.dayCount + req.days;
        target.dailyRent = req.dailyRate;
      }
      next.rentalRequests = next.rentalRequests.filter((r) => r.id !== reqId);
      return next;
    });
    soundFx.playSuccess();
    pushLog(`Rented ${req.equipName} to ${req.renterName} for ${req.days} days @ ₹${req.dailyRate}/day`, 'success');
    return true;
  };

  const serviceEquipment = (unitId: number): boolean => {
    const cost = 1200;
    if (state.finances.cash < cost) return false;

    setState((prev) => {
      const next = { ...prev };
      next.finances.cash -= cost;
      const target = next.equipmentFleet.find((u) => u.id === unitId);
      if (target) target.status = 'available';
      return next;
    });
    soundFx.playCoin();
    pushLog(`Serviced and repaired equipment #${unitId}`, 'info');
    return true;
  };

  // --------------------------------------------------------------------------
  // GLOBAL EXPORT & NPC TRADE
  // --------------------------------------------------------------------------
  const exportGoods = (countryId: string, productKey: string, qty: number): boolean => {
    const country = EXPORT_COUNTRIES_CATALOG.find((c) => c.id === countryId);
    if (!country || qty <= 0) return false;
    const itemKey = productKey as keyof GameState['inventory'];
    if (state.inventory[itemKey] < qty) return false;

    const basePrices: Record<string, number> = {
      ghee: 300,
      cheese: 250,
      milk: 35,
      eggs: 6,
      leather: 200,
      biogas: 60,
      soapOrganic: 150,
      soapBeauty: 120,
      face: 400,
    };
    const unitPrice = (basePrices[productKey] || 50) * country.premium;
    const totalRev = Math.round(unitPrice * qty);

    setState((prev) => {
      const next = { ...prev };
      next.inventory[itemKey] -= qty;
      next.finances.cash += totalRev;
      next.exports.totalExported += qty;
      next.exports.totalRevenue += totalRev;
      next.exports.reputation[countryId] = Math.min(100, (next.exports.reputation[countryId] || 0) + 3);
      next.exports.deals.unshift({
        id: Date.now(),
        day: next.clock.dayCount,
        country: `${country.flag} ${country.name}`,
        product: productKey,
        qty,
        revenue: totalRev,
        shippingFee: Math.round(totalRev * 0.05),
      });
      return next;
    });
    soundFx.playCashRegister();
    pushLog(`Export shipment dispatched to ${country.name}: ${qty} ${productKey} for ₹${totalRev.toLocaleString()}`, 'success');
    return true;
  };

  const tradeNpc = (npcId: string, direction: 'buy' | 'sell', productKey: string, qty: number): boolean => {
    const npc = NPC_TRADERS_CATALOG.find((n) => n.id === npcId);
    if (!npc || qty <= 0) return false;

    if (direction === 'sell') {
      const offer = npc.buys.find((b) => b.key === productKey);
      if (!offer) return false;
      const itemKey = productKey as keyof GameState['inventory'];
      if (state.inventory[itemKey] < qty) return false;

      const rev = offer.price * qty;
      setState((prev) => {
        const next = { ...prev };
        next.inventory[itemKey] -= qty;
        next.finances.cash += rev;
        const rel = next.npcTrade.relationships[npcId] || { trust: 0, tradeCount: 0, lastTrade: 0 };
        rel.trust = Math.min(100, rel.trust + 4);
        rel.tradeCount += 1;
        rel.lastTrade = next.clock.dayCount;
        next.npcTrade.relationships[npcId] = rel;
        next.npcTrade.tradeLog.unshift({
          day: next.clock.dayCount,
          npc: npc.name,
          direction: 'Sold',
          product: productKey,
          qty,
          amount: rev,
        });
        return next;
      });
      soundFx.playCashRegister();
      pushLog(`Sold ${qty} ${productKey} to merchant ${npc.name} for ₹${rev.toLocaleString()}`, 'success');
      return true;
    } else {
      const offer = npc.sells?.find((s) => s.key === productKey);
      if (!offer) return false;
      const cost = offer.price * qty;
      if (state.finances.cash < cost) return false;

      setState((prev) => {
        const next = { ...prev };
        next.finances.cash -= cost;
        const itemKey = productKey as keyof GameState['inventory'];
        if (next.inventory[itemKey] !== undefined) {
          next.inventory[itemKey] += qty;
        }
        return next;
      });
      soundFx.playCoin();
      pushLog(`Purchased ${qty} ${productKey} from ${npc.name}`, 'info');
      return true;
    }
  };

  const travelToCountry = (countryId: string): boolean => {
    const country = COUNTRIES_TRAVEL_CATALOG.find((c) => c.id === countryId);
    if (!country) return false;
    if (country.isHome) {
      setState((prev) => ({
        ...prev,
        travel: { ...prev.travel, currentCountry: 'india' },
      }));
      return true;
    }
    if (state.finances.cash < country.cost) return false;

    setState((prev) => {
      const next = { ...prev };
      next.finances.cash -= country.cost;
      next.travel.currentCountry = countryId;
      if (!next.travel.visitedCountries.includes(countryId)) {
        next.travel.visitedCountries.push(countryId);
      }
      next.travel.travelHistory.push({ countryId, day: next.clock.dayCount, cost: country.cost });
      if (country.cashBonus) next.finances.cash += country.cashBonus;
      if (country.creditBonus) next.finances.creditScore = Math.min(900, next.finances.creditScore + country.creditBonus);
      if (country.skillBonus) next.player.skillPoints += country.skillBonus;
      return next;
    });
    soundFx.playSuccess();
    pushLog(`Traveled to ${country.name}! Acquired regional trade perks & connections.`, 'success');
    return true;
  };

  // --------------------------------------------------------------------------
  // LOTTERY & MINI-GAMES
  // --------------------------------------------------------------------------
  const buyLotteryTicket = (type: 'daily' | 'weekly' | 'instant'): boolean => {
    const costs = { daily: 50, weekly: 200, instant: 100 };
    const cost = costs[type];
    if (state.finances.cash < cost) return false;

    setState((prev) => {
      const next = { ...prev };
      next.finances.cash -= cost;
      next.lottery.ticketsBought += 1;
      next.lottery.totalSpent += cost;

      if (type === 'instant') {
        const prizes = [
          { label: '₹10,00,000 GRAND PRIZE', amount: 1000000, color: '#ffd700', prob: 0.0005 },
          { label: '₹50,000 Major Win', amount: 50000, color: '#f59e0b', prob: 0.005 },
          { label: '₹5,000 Lucky Strike', amount: 5000, color: '#10b981', prob: 0.04 },
          { label: '₹500 Pocket Money', amount: 500, color: '#38bdf8', prob: 0.2 },
          { label: 'No Win', amount: 0, color: '#94a3b8', prob: 0.75 },
        ];
        const r = Math.random();
        let cum = 0;
        let chosen = prizes[prizes.length - 1];
        for (const p of prizes) {
          cum += p.prob;
          if (r <= cum) {
            chosen = p;
            break;
          }
        }
        next.lottery.scratchCards.unshift({
          id: Date.now(),
          prize: chosen,
          revealed: false,
        });
      }
      return next;
    });
    soundFx.playCoin();
    pushLog(`Purchased ${type.toUpperCase()} Lottery Ticket for ₹${cost}`, 'info');
    return true;
  };

  const scratchCard = (cardId: number) => {
    setState((prev) => {
      const next = { ...prev };
      const card = next.lottery.scratchCards.find((c) => c.id === cardId);
      if (card && !card.revealed) {
        card.revealed = true;
        if (card.prize.amount > 0) {
          next.finances.cash += card.prize.amount;
          next.lottery.totalWon += card.prize.amount;
          next.lottery.wins += 1;
          soundFx.playSuccess();
        }
      }
      return next;
    });
  };

  const recordMiniGameResult = (game: string, result: 'Win' | 'Lose', amount: number) => {
    setState((prev) => {
      const next = { ...prev };
      next.miniGames.gamesPlayed += 1;
      if (result === 'Win') {
        next.miniGames.totalWon += amount;
        next.miniGames.winStreak += 1;
        next.miniGames.bestStreak = Math.max(next.miniGames.bestStreak, next.miniGames.winStreak);
      } else {
        next.miniGames.totalLost += amount;
        next.miniGames.winStreak = 0;
      }
      next.miniGames.history.unshift({
        game,
        result,
        amount: result === 'Win' ? amount : -amount,
        day: next.clock.dayCount,
      });
      return next;
    });
  };

  // --------------------------------------------------------------------------
  // WORKFORCE & SKILLS
  // --------------------------------------------------------------------------
  const hireWorker = (workerId: string): boolean => {
    const worker = WORKER_CATALOG.find((w) => w.id === workerId);
    if (!worker) return false;
    if (state.workers.some((w) => w.id === workerId)) return false;
    const upfront = worker.cost * 3;
    if (state.finances.cash < upfront) return false;

    setState((prev) => {
      const next = { ...prev };
      next.finances.cash -= upfront;
      next.workers.push(worker);
      return next;
    });
    soundFx.playSuccess();
    pushLog(`Hired ${worker.name} as ${worker.role}`, 'success');
    return true;
  };

  const fireWorker = (workerId: string): boolean => {
    setState((prev) => ({
      ...prev,
      workers: prev.workers.filter((w) => w.id !== workerId),
    }));
    soundFx.playWarning();
    pushLog(`Released worker #${workerId}`, 'info');
    return true;
  };

  const updateWorkerAllocations = (key: keyof GameState['allocations'], values: unknown) => {
    setState((prev) => ({
      ...prev,
      allocations: {
        ...prev.allocations,
        [key]: values,
      },
    }));
  };

  const unlockSkill = (skillId: string): boolean => {
    const skill = SKILL_TREE_NODES.find((s) => s.id === skillId);
    if (!skill || state.unlockedSkills.includes(skillId)) return false;
    if (skill.requires && !state.unlockedSkills.includes(skill.requires)) return false;
    if (state.player.skillPoints < skill.cost) return false;

    setState((prev) => ({
      ...prev,
      player: {
        ...prev.player,
        skillPoints: prev.player.skillPoints - skill.cost,
      },
      unlockedSkills: [...prev.unlockedSkills, skillId],
    }));
    soundFx.playSuccess();
    pushLog(`Unlocked Skill: ${skill.name}!`, 'success');
    return true;
  };

  const buyInsurance = (category: string, premium: number, duration: number): boolean => {
    if (state.finances.cash < premium) return false;
    setState((prev) => ({
      ...prev,
      finances: {
        ...prev.finances,
        cash: prev.finances.cash - premium,
      },
      insurance: {
        ...prev.insurance,
        [category]: { active: true, daysLeft: duration, premium },
      },
    }));
    soundFx.playCashRegister();
    pushLog(`Activated ${category.toUpperCase()} Insurance Coverage for ${duration} days`, 'success');
    return true;
  };

  const placeBid = (auctionId: number, bidAmount: number): boolean => {
    const item = state.auctionItems.find((a) => a.id === auctionId);
    if (!item || bidAmount < item.minBid || state.finances.cash < bidAmount) return false;

    setState((prev) => {
      const next = { ...prev };
      next.finances.cash -= bidAmount;
      next.auctionHistory.unshift({ day: next.clock.dayCount, name: item.name, paid: bidAmount });
      next.stats.auctionsWon += 1;
      next.auctionItems = next.auctionItems.filter((a) => a.id !== auctionId);

      // Award reward
      if (item.category === 'livestock' && item.rewardData.type) {
        const kind = item.rewardData.type as LivestockKind;
        if (next.livestock[kind]) next.livestock[kind].count += item.rewardData.qty;
      } else if (item.category === 'commodity' && item.rewardData.type) {
        const comm = next.commodities.find((c) => c.name.includes(item.rewardData.type));
        if (comm) comm.holding += item.rewardData.qty;
      }
      return next;
    });
    soundFx.playSuccess();
    pushLog(`Won Auction Lot: ${item.name} for ₹${bidAmount.toLocaleString()}`, 'success');
    return true;
  };

  // --------------------------------------------------------------------------
  // SYSTEM & TIME CONTROLS
  // --------------------------------------------------------------------------
  const setSpeed = (speed: number) => {
    setState((prev) => ({
      ...prev,
      clock: { ...prev.clock, speedMultiplier: speed },
    }));
  };

  const togglePause = () => {
    setState((prev) => ({
      ...prev,
      clock: { ...prev.clock, isPaused: !prev.clock.isPaused },
    }));
  };

  const advanceDayManually = () => {
    setState((prev) => simulateDayTick(prev));
  };

  const manualSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      soundFx.playSuccess();
      pushLog('Game progress saved locally to browser storage.', 'success');
    } catch {
      soundFx.playWarning();
    }
  };

  const exportSaveJson = (): string => {
    return JSON.stringify(state, null, 2);
  };

  const importSaveJson = (json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      if (parsed && parsed.version) {
        setState(parsed);
        soundFx.playSuccess();
        return true;
      }
    } catch {
      // Import parse error
    }
    return false;
  };

  const resetGame = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(INITIAL_GAME_STATE);
  };

  return (
    <GameContext.Provider
      value={{
        state,
        netWorthData,
        isPaused: state.clock.isPaused,
        speed: state.clock.speedMultiplier,
        activeTab,
        setActiveTab,
        show3DModal,
        setShow3DModal,
        buyLivestock,
        sellLivestock,
        feedLivestock,
        consultVet,
        convertDairy,
        packEggs,
        convertLeather,
        convertBioGas,
        craftSoap,
        sellInventoryItem,
        plantCrop,
        buyLand,
        sellLand,
        buyFarm,
        sellFarm,
        buildHouse,
        sellHouse,
        openBankAccount,
        depositBank,
        withdrawBank,
        transferBank,
        createFixedDeposit,
        buyBonds,
        sellBonds,
        investSip,
        withdrawSip,
        applyLoan,
        repayLoan,
        applyCreditCard,
        spendCreditCard,
        payCreditCard,
        buyStock,
        sellStock,
        placeLimitOrder,
        cancelLimitOrder,
        applyIPO,
        buyOption,
        buyCrypto,
        sellCrypto,
        investMutualFund,
        redeemMutualFund,
        setMutualFundSIP,
        stopMutualFundSIP,
        openBusiness,
        upgradeBusiness,
        injectBusinessCapital,
        partnerBusiness,
        closeBusiness,
        openRestaurant,
        upgradeRestaurant,
        closeRestaurant,
        openHospital,
        upgradeHospital,
        unlockHospitalSpec,
        buyEquipment,
        acceptRental,
        serviceEquipment,
        exportGoods,
        tradeNpc,
        travelToCountry,
        buyLotteryTicket,
        scratchCard,
        recordMiniGameResult,
        hireWorker,
        fireWorker,
        updateWorkerAllocations,
        unlockSkill,
        buyInsurance,
        placeBid,
        setSpeed,
        togglePause,
        advanceDayManually,
        manualSave,
        exportSaveJson,
        importSaveJson,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
