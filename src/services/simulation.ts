/**
 * AR360X — Core Simulation Engine & Calculation Service
 */
import { GameState, WeatherType } from '../types/game';
import {
  WEATHER_CONDITIONS,
  BANK_CATALOG,
  BUSINESS_CATALOG,
  PARTNER_CATALOG,
} from '../constants/initialState';

// Procedural Web Audio Sound Generator (Zero external audio file 404s!)
class AudioFX {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  playCoin() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.12); // E6
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // AudioContext policy suppression fallback
    }
  }

  playCashRegister() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(1046.5, now); // C6
      osc1.frequency.setValueAtTime(1318.51, now + 0.08); // E6
      osc1.frequency.setValueAtTime(1567.98, now + 0.16); // G6
      osc2.frequency.setValueAtTime(2093.0, now + 0.22); // C7
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start(now);
      osc2.start(now + 0.2);
      osc1.stop(now + 0.45);
      osc2.stop(now + 0.45);
    } catch {
      // Suppress audio failure
    }
  }

  playSuccess() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.1, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    } catch {
      // Suppress audio failure
    }
  }

  playWarning() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(196, now + 0.15);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Suppress audio failure
    }
  }
}

export const soundFx = new AudioFX();

export function calculateNetWorth(state: GameState): {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  breakdown: {
    cash: number;
    bank: number;
    livestock: number;
    products: number;
    crops: number;
    investments: number;
    realEstate: number;
    enterprises: number;
    equipment: number;
  };
} {
  const cash = state.finances.cash;
  const bank = state.bankAccounts.reduce((sum, b) => sum + b.balance, 0) + state.finances.bankLegacy;

  // Livestock value (75% liquidation value)
  const livestock =
    state.livestock.Cow.count * state.livestock.Cow.basePrice * 0.75 +
    state.livestock.Goat.count * state.livestock.Goat.basePrice * 0.75 +
    state.livestock.Sheep.count * state.livestock.Sheep.basePrice * 0.75 +
    state.livestock.Chicken.count * state.livestock.Chicken.basePrice * 0.75;

  // Finished inventory products value
  const products =
    state.inventory.ghee * 300 +
    state.inventory.ice * 200 +
    state.inventory.face * 400 +
    state.inventory.cheese * 250 +
    state.inventory.eggSingle * 5 +
    state.inventory.eggHalf * 25 +
    state.inventory.eggDozen * 45 +
    state.inventory.leather * 200 +
    state.inventory.biogas * 60 +
    state.inventory.soapBeauty * 120 +
    state.inventory.soapOrganic * 150 +
    state.inventory.soapDetergent * 80 +
    state.inventory.milk * 35 +
    state.inventory.eggs * 6 +
    state.inventory.skins * 100;

  // Crops & farmland value
  const crops = state.agriculture.landOwned * 1000 + state.agriculture.treeCount * 100 + state.agriculture.coconutCount * 250;

  // Investments: Stocks, Crypto, Mutual Funds, Commodities, Bonds, SIP, FDs
  const stocksVal = state.stocks.reduce((sum, s) => sum + s.holding * s.price, 0);
  const cryptoVal = state.cryptoCoins.reduce((sum, c) => sum + c.holding * c.price, 0);
  const mfVal = state.mutualFunds.reduce((sum, m) => sum + m.units * m.nav, 0);
  const commVal = state.commodities.reduce((sum, c) => sum + c.holding * c.price, 0);
  const fdVal = state.finances.fixedDeposits.reduce((sum, fd) => sum + fd.amount, 0);
  const investments = stocksVal + cryptoVal + mfVal + commVal + fdVal + state.finances.bonds + state.finances.sip;

  // Real estate
  const housesVal = state.realEstate.houses.reduce((sum, h) => sum + h.buildCost * 0.85, 0);
  const realEstate = state.realEstate.farms * 5000 + housesVal;

  // Businesses & enterprises
  const enterprises = state.businesses.reduce((sum, b) => {
    const config = BUSINESS_CATALOG.find((cfg) => cfg.id === b.catalogId);
    if (!config) return sum;
    const base = config.openCost * b.qty * (0.7 + b.tier * 0.15);
    return sum + base + (b.extraInvestment || 0) * 0.7;
  }, 0);

  // Equipment fleet
  const equipment = state.equipmentFleet.length * 50000;

  const totalAssets = cash + bank + livestock + products + crops + investments + realEstate + enterprises + equipment;

  // Liabilities: Active loans + Credit card balances
  const loansTotal = state.activeLoans.reduce((sum, l) => sum + l.amount, 0);
  const ccDebt = state.creditCards.reduce((sum, cc) => sum + cc.outstanding, 0);
  const totalLiabilities = loansTotal + ccDebt;

  const netWorth = totalAssets - totalLiabilities;

  return {
    totalAssets: Math.round(totalAssets),
    totalLiabilities: Math.round(totalLiabilities),
    netWorth: Math.round(netWorth),
    breakdown: {
      cash: Math.round(cash),
      bank: Math.round(bank),
      livestock: Math.round(livestock),
      products: Math.round(products),
      crops: Math.round(crops),
      investments: Math.round(investments),
      realEstate: Math.round(realEstate),
      enterprises: Math.round(enterprises),
      equipment: Math.round(equipment),
    },
  };
}

export function simulateDayTick(prevState: GameState): GameState {
  const state: GameState = JSON.parse(JSON.stringify(prevState));
  state.clock.dayCount += 1;

  // Advance Calendar Date
  const mdays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let { day, month, year } = state.clock.simDate;
  day += 1;
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  let maxDays = month === 2 && isLeap ? 29 : mdays[month - 1];
  if (day > maxDays) {
    day = 1;
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  state.clock.simDate = { day, month, year };

  let dayIncome = 0;
  let dayExpense = 0;

  // 1. Weather update
  state.weather.daysLeft -= 1;
  if (state.weather.daysLeft <= 0) {
    const weatherKeys = Object.keys(WEATHER_CONDITIONS) as WeatherType[];
    const nextWeather = state.weather.forecast[0] || 'sunny';
    state.weather.current = nextWeather;
    state.weather.daysLeft = Math.floor(Math.random() * 4) + 2;

    const newForecast: WeatherType[] = [];
    for (let i = 0; i < 5; i++) {
      newForecast.push(weatherKeys[Math.floor(Math.random() * weatherKeys.length)]);
    }
    state.weather.forecast = newForecast;

    if (nextWeather === 'storm') state.stats.stormsWeathered += 1;
    if (nextWeather === 'perfect') state.stats.perfectDays += 1;

    state.eventLog.unshift({
      id: `ev_${Date.now()}_w`,
      day: state.clock.dayCount,
      time: '06:00',
      msg: `Weather forecast update: ${WEATHER_CONDITIONS[nextWeather].icon} ${WEATHER_CONDITIONS[nextWeather].name}`,
      type: 'info',
    });
  }

  const currentWeather = WEATHER_CONDITIONS[state.weather.current] || WEATHER_CONDITIONS.sunny;
  let milkWeatherMult = currentWeather.milkMult;
  let cropWeatherMult = currentWeather.cropMult;

  // Skill: Rain Maker eliminates drought impact
  if (state.unlockedSkills.includes('sk_rainMaker') && state.weather.current === 'drought') {
    milkWeatherMult = 1.0;
    cropWeatherMult = 1.0;
  }

  // 2. Animal Health & Auto-Regen
  const hasVetWorker = state.workers.some((w) => w.bonus === 'vet');
  const hasHealthSkill = state.unlockedSkills.includes('sk_healthRegen');
  (Object.keys(state.livestock) as (keyof typeof state.livestock)[]).forEach((k) => {
    const item = state.livestock[k];
    if (item.count > 0) {
      if (hasVetWorker) {
        item.health = Math.min(100, item.health + 5);
      } else if (hasHealthSkill) {
        item.health = Math.min(100, item.health + 3);
      } else {
        // Minor natural decay
        item.health = Math.max(20, item.health - 1);
      }
    }
  });

  // 3. Animal Production
  const hasMilkman = state.workers.some((w) => w.bonus === 'milkman');
  const hasMilkSkill = state.unlockedSkills.includes('sk_milkBoost');
  const cowBonus = (hasMilkman ? 3 : 0) + (hasMilkSkill ? 2 : 0);

  const cowMilk = Math.round(state.livestock.Cow.count * (state.livestock.Cow.prod + cowBonus) * (state.livestock.Cow.health / 100) * milkWeatherMult);
  const goatMilk = Math.round(state.livestock.Goat.count * state.livestock.Goat.prod * (state.livestock.Goat.health / 100) * milkWeatherMult);
  const totalMilkToday = cowMilk + goatMilk;
  state.inventory.milk += totalMilkToday;
  state.stats.milkProduced += totalMilkToday;

  const eggWeatherMult = state.weather.current === 'windy' ? 0.7 : 1.0;
  const eggsToday = Math.round(state.livestock.Chicken.count * state.livestock.Chicken.prod * (state.livestock.Chicken.health / 100) * eggWeatherMult);
  state.inventory.eggs += eggsToday;
  state.stats.eggsProduced += eggsToday;

  // Farm byproducts: Dung and Skins
  const dungToday = Math.floor((state.livestock.Cow.count * 2 + state.livestock.Goat.count + state.livestock.Sheep.count) * 1.2);
  state.inventory.dung += dungToday;

  const skinsToday = Math.floor((state.livestock.Goat.count + state.livestock.Sheep.count) * 0.15);
  state.inventory.skins += skinsToday;

  // 4. Agriculture & Crops
  const hasFarmerWorker = state.workers.some((w) => w.bonus === 'farmer');
  const hasCropYieldSkill = state.unlockedSkills.includes('sk_cropYield');
  let cropMultiplier = cropWeatherMult * (hasFarmerWorker ? 1.2 : 1.0) * (hasCropYieldSkill ? 1.3 : 1.0);
  const fastCropBonus = state.unlockedSkills.includes('sk_fastCrop') ? 2 : 0;
  const cycleDays = Math.max(4, 7 - fastCropBonus);

  if (state.agriculture.wheatArea > 0) {
    state.agriculture.wheatGrowDays += 1;
    if (state.agriculture.wheatGrowDays >= cycleDays) {
      const wheatRevenue = Math.round(state.agriculture.wheatArea * 500 * 0.5 * cropMultiplier);
      state.finances.cash += wheatRevenue;
      dayIncome += wheatRevenue;
      state.stats.cropsHarvested += 1;
      state.stats.totalRevenue += wheatRevenue;
      state.agriculture.wheatGrowDays = 0;
      state.eventLog.unshift({
        id: `ev_${Date.now()}_wheat`,
        day: state.clock.dayCount,
        time: '08:00',
        msg: `🌾 Harvested ${state.agriculture.wheatArea} acres of Golden Wheat! Earned ₹${wheatRevenue.toLocaleString()}.`,
        type: 'success',
      });
    }
  }

  if (state.agriculture.paddyArea > 0) {
    state.agriculture.paddyGrowDays += 1;
    if (state.agriculture.paddyGrowDays >= cycleDays) {
      const paddyRevenue = Math.round(state.agriculture.paddyArea * 800 * 0.45 * cropMultiplier);
      state.finances.cash += paddyRevenue;
      dayIncome += paddyRevenue;
      state.stats.cropsHarvested += 1;
      state.stats.totalRevenue += paddyRevenue;
      state.agriculture.paddyGrowDays = 0;
      state.eventLog.unshift({
        id: `ev_${Date.now()}_paddy`,
        day: state.clock.dayCount,
        time: '08:30',
        msg: `🌾 Harvested ${state.agriculture.paddyArea} acres of Paddy Rice! Earned ₹${paddyRevenue.toLocaleString()}.`,
        type: 'success',
      });
    }
  }

  // Agroforestry periodic tree revenue
  const treeMult = state.unlockedSkills.includes('sk_treeIncome') ? 1.5 : 1.0;
  if (state.clock.dayCount % 7 === 0) {
    if (state.agriculture.treeCount > 0) {
      const treeEarn = Math.round(state.agriculture.treeCount * 70 * treeMult);
      state.finances.cash += treeEarn;
      dayIncome += treeEarn;
    }
    if (state.agriculture.coconutCount > 0) {
      const cocoEarn = Math.round(state.agriculture.coconutCount * 120 * treeMult);
      state.finances.cash += cocoEarn;
      dayIncome += cocoEarn;
    }
  }

  // 5. Real Estate Rental Income
  const hasRealtor = state.workers.some((w) => w.bonus === 'realtor');
  const hasRentSkill = state.unlockedSkills.includes('sk_rentBoost');
  const hasHotelMgrSkill = state.unlockedSkills.includes('sk_hotelMgr');
  let rentMult = (hasRentSkill ? 1.25 : 1.0) * (hasRealtor ? 1.15 : 1.0);

  const farmRent = state.realEstate.farms * 150 * rentMult;
  const houseRent = state.realEstate.houses.reduce((sum, h) => {
    let itemMult = rentMult;
    if (hasHotelMgrSkill && (h.type === 'guesthouse' || h.type === 'palace')) {
      itemMult *= 1.4;
    }
    return sum + h.dailyRent * itemMult;
  }, 0);

  const totalRentToday = Math.round(farmRent + houseRent);
  if (totalRentToday > 0) {
    state.finances.cash += totalRentToday;
    dayIncome += totalRentToday;
    state.realEstate.rentAccumulated += totalRentToday;
  }

  // 6. Enterprise Businesses Daily Profits
  state.businesses.forEach((biz) => {
    const config = BUSINESS_CATALOG.find((cfg) => cfg.id === biz.catalogId);
    if (!config) return;
    const tierRevMult = config.tierRevMult[biz.tier - 1] || 1;
    const extraBoost = 1 + Math.min(2.0, (biz.extraInvestment || 0) / (config.openCost * 5));
    const partnerBoost = 1 + biz.partners.length * 0.08;
    const weatherImpact = state.weather.current === 'storm' ? 0.35 : state.weather.current === 'perfect' ? 1.25 : 1.0;

    const grossRev = Math.round(config.dailyRev * tierRevMult * extraBoost * partnerBoost * weatherImpact * biz.qty * (0.9 + Math.random() * 0.2));
    const grossExp = Math.round(config.dailyExp * tierRevMult * biz.qty);

    // Partner profit cut
    const partnerCut = biz.partners.reduce((sum, p) => {
      const partnerCfg = PARTNER_CATALOG.find((pc) => pc.id === p.partnerId);
      return sum + (partnerCfg ? Math.round(grossRev * (partnerCfg.revSharePct / 100)) : 0);
    }, 0);

    const netProfit = grossRev - grossExp - partnerCut;
    state.finances.cash += netProfit;
    if (netProfit > 0) dayIncome += netProfit;
    else dayExpense += Math.abs(netProfit);

    biz.daysOpen += 1;
    biz.dailyRevEarned += grossRev;
    state.bizAllTimeEarned += netProfit;
    state.stats.totalRevenue += Math.max(0, netProfit);
  });

  // 7. Ventures: Restaurants, Hospitals, Equipment
  state.restaurants.forEach((r) => {
    const rev = Math.round(1800 * r.level * (0.85 + Math.random() * 0.3));
    const exp = Math.round(600 * r.level);
    const net = rev - exp;
    state.finances.cash += net;
    dayIncome += net;
    r.dailyRevEarned += net;
    state.restAllTimeEarned += net;
  });

  state.hospitals.forEach((h) => {
    const specCount = h.specs.length;
    const rev = Math.round(4500 * h.level * (1 + specCount * 0.25) * (0.9 + Math.random() * 0.2));
    const exp = Math.round(1500 * h.level);
    const net = rev - exp;
    state.finances.cash += net;
    dayIncome += net;
    h.dailyRevEarned += net;
    h.dailyPatients = Math.floor(rev / 800);
    state.stats.patientsTreated += h.dailyPatients;
    state.hospAllTimeEarned += net;
  });

  // Equipment Fleet Rentals
  state.equipmentFleet.forEach((eq) => {
    if (eq.status === 'rented') {
      state.finances.cash += eq.dailyRent;
      dayIncome += eq.dailyRent;
      eq.totalEarned += eq.dailyRent;
      if (state.clock.dayCount >= eq.rentedTill) {
        eq.status = Math.random() < 0.2 ? 'maintenance' : 'available';
        eq.dailyRent = 0;
      }
    }
  });

  // 8. Banking Accounts Interest & Fixed Deposits
  state.bankAccounts.forEach((acct) => {
    const bankCfg = BANK_CATALOG.find((b) => b.id === acct.bankId);
    if (bankCfg && acct.balance > 0) {
      const earned = Math.round(acct.balance * bankCfg.savingsRate * 100) / 100;
      acct.balance += earned;
      acct.interestEarned += earned;
    }
  });

  // Fixed Deposits Maturity
  for (let i = state.finances.fixedDeposits.length - 1; i >= 0; i--) {
    const fd = state.finances.fixedDeposits[i];
    fd.daysLeft -= 1;
    if (fd.daysLeft <= 0) {
      const maturityInterest = Math.round(fd.amount * fd.fdRate * (fd.totalDays / 365));
      const totalPayout = fd.amount + maturityInterest;
      const targetAcct = state.bankAccounts.find((a) => a.id === fd.bankId) || state.bankAccounts[0];
      if (targetAcct) {
        targetAcct.balance += totalPayout;
      } else {
        state.finances.cash += totalPayout;
      }
      state.finances.fixedDeposits.splice(i, 1);
      state.eventLog.unshift({
        id: `ev_${Date.now()}_fd`,
        day: state.clock.dayCount,
        time: '10:00',
        msg: `🏦 Fixed Deposit matured! Principal ₹${fd.amount.toLocaleString()} + Interest ₹${maturityInterest.toLocaleString()} credited.`,
        type: 'success',
      });
    }
  }

  // Bonds & SIP growth
  const bondRate = state.unlockedSkills.includes('sk_bondYield') ? 0.0018 : 0.0009;
  const hasBanker = state.workers.some((w) => w.bonus === 'banker');
  const bankerBonus = hasBanker ? 0.0005 : 0;
  if (state.finances.bonds > 0) {
    state.finances.bonds = Math.round(state.finances.bonds * (1 + bondRate + bankerBonus));
  }
  if (state.finances.sip > 0) {
    state.finances.sip = Math.round(state.finances.sip * (1 + 0.001 + bankerBonus));
  }

  // 9. Loans Interest & Penalty Check
  const loanRate = (0.05 / 30) * (state.unlockedSkills.includes('sk_interestCut') ? 0.7 : 1.0);
  state.activeLoans.forEach((loan) => {
    const dailyInterest = Math.round(loan.amount * loanRate);
    loan.amount += dailyInterest;
    loan.interestAccrued += dailyInterest;

    if (state.finances.cash < loan.amount * 0.01) {
      loan.daysUnpaid += 1;
    } else {
      loan.daysUnpaid = 0;
    }

    // Seizure trigger after 15 days unpaid
    if (loan.daysUnpaid >= 15) {
      const seizureAmt = Math.min(state.finances.cash, loan.amount);
      state.finances.cash -= seizureAmt;
      loan.amount -= seizureAmt;
      state.finances.creditScore = Math.max(300, state.finances.creditScore - 60);
      state.finances.loanDefaultCount += 1;
      state.eventLog.unshift({
        id: `ev_${Date.now()}_seizure`,
        day: state.clock.dayCount,
        time: '12:00',
        msg: `⚠️ BANK SEIZURE: Loan #${loan.id} overdue for 15 days! Recovered ₹${seizureAmt.toLocaleString()}. CIBIL dropped by -60.`,
        type: 'danger',
      });
    }
  });

  // 10. Worker Wages
  const totalWages = state.workers.reduce((sum, w) => sum + w.cost, 0);
  if (totalWages > 0) {
    if (state.finances.cash >= totalWages) {
      state.finances.cash -= totalWages;
      dayExpense += totalWages;
    } else {
      // Unpaid staff leaves
      const departing = state.workers.pop();
      state.eventLog.unshift({
        id: `ev_${Date.now()}_worker`,
        day: state.clock.dayCount,
        time: '18:00',
        msg: `⚠️ Staff wage shortage! Worker ${departing?.name} resigned due to unpaid salary.`,
        type: 'warn',
      });
    }
  }

  // 11. Worker Automations
  // A. Meera: Dairy Processor
  if (state.workers.some((w) => w.bonus === 'dairyproc') && state.inventory.milk >= 4) {
    const alloc = state.allocations.dairyProcessor;
    const milkBatch = state.inventory.milk;
    let gheeBatches = Math.floor((milkBatch * (alloc.ghee / 100)) / 4);
    let cheeseBatches = Math.floor((milkBatch * (alloc.cheese / 100)) / 5);
    let iceBatches = Math.floor((milkBatch * (alloc.ice / 100)) / 6);
    let faceBatches = Math.floor((milkBatch * (alloc.face / 100)) / 10);

    const totalMilkUsed = gheeBatches * 4 + cheeseBatches * 5 + iceBatches * 6 + faceBatches * 10;
    if (totalMilkUsed <= state.inventory.milk) {
      state.inventory.milk -= totalMilkUsed;
      state.inventory.ghee += gheeBatches;
      state.inventory.cheese += cheeseBatches;
      state.inventory.ice += iceBatches;
      state.inventory.face += faceBatches;

      if (alloc.autoSell) {
        const autoRev = gheeBatches * 300 + cheeseBatches * 250 + iceBatches * 200 + faceBatches * 400;
        state.inventory.ghee -= gheeBatches;
        state.inventory.cheese -= cheeseBatches;
        state.inventory.ice -= iceBatches;
        state.inventory.face -= faceBatches;
        state.finances.cash += autoRev;
        dayIncome += autoRev;
      }
    }
  }

  // B. Rajan: Livestock Buyer
  if (state.workers.some((w) => w.bonus === 'livestockbuyer') && state.allocations.livestockBuyer.enabled) {
    const alloc = state.allocations.livestockBuyer;
    let spent = 0;
    const buyPlan: [keyof typeof state.livestock, number, number][] = [
      ['Cow', alloc.Cow, 9000],
      ['Goat', alloc.Goat, 2600],
      ['Sheep', alloc.Sheep, 3200],
      ['Chicken', alloc.Chicken, 350],
    ];
    buyPlan.forEach(([kind, qty, price]) => {
      const cost = qty * price;
      if (qty > 0 && spent + cost <= alloc.budgetCap && state.finances.cash >= cost) {
        state.finances.cash -= cost;
        spent += cost;
        state.livestock[kind].count += qty;
        dayExpense += cost;
      }
    });
  }

  // 12. Market Dynamics: Commodities, Stocks, Crypto Random Walk
  state.commodities.forEach((c) => {
    const meanRevPull = c.meanRev * (c.basePrice - c.price);
    const noise = (Math.random() - 0.49) * 2 * (c.price * c.dailyVol);
    c.price = Math.max(c.basePrice * 0.4, Math.round(c.price + meanRevPull + noise));
    c.history.push(c.price);
    if (c.history.length > 30) c.history.shift();
  });

  state.stocks.forEach((s) => {
    const drift = (Math.random() - 0.48) * 0.04;
    s.price = Math.max(10, Math.round(s.price * (1 + drift)));
    s.history.push(s.price);
    if (s.history.length > 30) s.history.shift();
  });

  state.cryptoCoins.forEach((c) => {
    const spike = Math.random() < 0.04 ? (Math.random() < 0.5 ? 0.15 : -0.12) : 0;
    const noise = (Math.random() - 0.49) * 2 * c.vol;
    c.price = Math.max(c.basePrice * 0.1, Math.round(c.price * (1 + noise + spike)));
    c.history.push(c.price);
    if (c.history.length > 30) c.history.shift();
  });

  state.mutualFunds.forEach((mf) => {
    const dailyReturn = mf.annualReturn / 365 + (Math.random() - 0.48) * mf.volatility;
    mf.nav = Math.max(5, Math.round(mf.nav * (1 + dailyReturn) * 100) / 100);
    mf.history.push(mf.nav);
    if (mf.history.length > 30) mf.history.shift();
  });

  // Limit Order Checks
  for (let i = state.limitOrders.length - 1; i >= 0; i--) {
    const ord = state.limitOrders[i];
    if (ord.assetType === 'stock') {
      const stock = state.stocks.find((s) => s.id === ord.assetId);
      if (stock) {
        if (ord.orderType === 'buy' && stock.price <= ord.limitPrice && state.finances.cash >= stock.price * ord.qty) {
          state.finances.cash -= stock.price * ord.qty;
          stock.holding += ord.qty;
          state.limitOrders.splice(i, 1);
          state.eventLog.unshift({
            id: `ev_${Date.now()}_lo`,
            day: state.clock.dayCount,
            time: '11:00',
            msg: `📈 Limit Buy executed: ${ord.qty} shares of ${stock.id} @ ₹${stock.price}`,
            type: 'success',
          });
        } else if (ord.orderType === 'sell' && stock.price >= ord.limitPrice && stock.holding >= ord.qty) {
          stock.holding -= ord.qty;
          state.finances.cash += stock.price * ord.qty;
          state.limitOrders.splice(i, 1);
          state.eventLog.unshift({
            id: `ev_${Date.now()}_lo`,
            day: state.clock.dayCount,
            time: '11:00',
            msg: `📈 Limit Sell executed: ${ord.qty} shares of ${stock.id} @ ₹${stock.price}`,
            type: 'success',
          });
        }
      }
    }
  }

  // 13. Weekly Taxes (Day % 7 === 0)
  if (state.clock.dayCount % 7 === 0) {
    const hasAccountant = state.workers.some((w) => w.bonus === 'accountant');
    const hasTaxSkill = state.unlockedSkills.includes('sk_taxDodge');
    const taxRate = hasTaxSkill ? 0.01 : hasAccountant ? 0.015 : 0.02;

    const netVal = calculateNetWorth(state);
    const taxableIncome = Math.max(0, netVal.netWorth - 20000);
    const taxDue = Math.round(taxableIncome * taxRate);

    if (taxDue > 0) {
      if (state.finances.cash >= taxDue) {
        state.finances.cash -= taxDue;
      } else {
        // deduct from primary bank account
        const primary = state.bankAccounts[0];
        if (primary && primary.balance >= taxDue) {
          primary.balance -= taxDue;
        } else {
          state.finances.cash -= taxDue; // creates negative cash or forces borrowing
        }
      }
      state.finances.allTimeTaxPaid += taxDue;
      state.finances.lastTaxPaidDay = state.clock.dayCount;
      state.eventLog.unshift({
        id: `ev_${Date.now()}_tax`,
        day: state.clock.dayCount,
        time: '17:00',
        msg: `💰 Weekly Corporate Tax assessed & paid: ₹${taxDue.toLocaleString()} (Rate: ${(taxRate * 100).toFixed(1)}%).`,
        type: 'warn',
      });
    }
  }

  // 14. Random Events (10% chance)
  if (Math.random() < 0.1) {
    const events = [
      {
        msg: '🎉 Agricultural Festival! Local demand for Ghee & Paneer surged by +25%.',
        type: 'success' as const,
        action: () => {
          state.finances.cash += 2500;
        },
      },
      {
        msg: '🏛️ Government Agri-Business Subsidy grant received: ₹5,000 direct credit!',
        type: 'success' as const,
        action: () => {
          state.finances.cash += 5000;
        },
      },
      {
        msg: '🚢 Overseas Export order cleared: Leather and finished textiles demand peaked.',
        type: 'info' as const,
        action: () => {
          state.inventory.leather = Math.max(0, state.inventory.leather - 2);
          state.finances.cash += 1200;
        },
      },
      {
        msg: '⚠️ Equipment wear & tear breakdown: ₹1,500 replacement parts fee.',
        type: 'warn' as const,
        action: () => {
          state.finances.cash = Math.max(0, state.finances.cash - 1500);
        },
      },
    ];
    const ev = events[Math.floor(Math.random() * events.length)];
    ev.action();
    state.eventLog.unshift({
      id: `ev_${Date.now()}_rand`,
      day: state.clock.dayCount,
      time: '14:00',
      msg: ev.msg,
      type: ev.type,
    });
  }

  // 15. Skill Points (every 3 days)
  if (state.clock.dayCount % 3 === 0) {
    state.player.skillPoints += 1;
    state.eventLog.unshift({
      id: `ev_${Date.now()}_sp`,
      day: state.clock.dayCount,
      time: '07:00',
      msg: '🧠 Gained +1 Skill Point! Check the Skills & Upgrade tree to unlock advantages.',
      type: 'info',
    });
  }

  // 16. Net Worth and Cashflow History update
  const currentNW = calculateNetWorth(state).netWorth;
  state.history.netWorth.push(currentNW);
  if (state.history.netWorth.length > 60) state.history.netWorth.shift();

  state.history.cashFlow.push({
    day: state.clock.dayCount,
    income: dayIncome,
    expense: dayExpense,
  });
  if (state.history.cashFlow.length > 30) state.history.cashFlow.shift();

  // Prune event logs to 60 items
  if (state.eventLog.length > 60) {
    state.eventLog = state.eventLog.slice(0, 60);
  }

  return state;
}
