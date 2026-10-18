/**
 * AR360X — Multi-Banking, Credit Score, Loans & Credit Cards System
 */
import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { BANK_CATALOG, CREDIT_CARD_CATALOG } from '../../constants/initialState';
import {
  Landmark,
  Building,
  CreditCard,
  Plus,
  Send,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRightLeft,
} from 'lucide-react';

export const BankingView: React.FC = () => {
  const {
    state,
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
  } = useGame();

  const [selectedAcctId, setSelectedAcctId] = useState<string>(
    state.bankAccounts[0]?.id || ''
  );
  const [depositAmt, setDepositAmt] = useState<number>(2000);
  const [withdrawAmt, setWithdrawAmt] = useState<number>(1000);

  // Transfer state
  const [transferFrom, setTransferFrom] = useState<string>(state.bankAccounts[0]?.id || '');
  const [transferTo, setTransferTo] = useState<string>(state.bankAccounts[1]?.id || '');
  const [transferAmt, setTransferAmt] = useState<number>(1000);

  // FD state
  const [fdAmt, setFdAmt] = useState<number>(5000);
  const [fdDays, setFdDays] = useState<number>(30);

  // Loan state
  const [loanBankId, setLoanBankId] = useState<string>('sbi');
  const [loanAmt, setLoanAmt] = useState<number>(25000);
  const [loanPurpose, setLoanPurpose] = useState<string>('Business Expansion');

  // Repay state
  const [repayLoanId, setRepayLoanId] = useState<number>(state.activeLoans[0]?.id || 0);
  const [repayAmt, setRepayAmt] = useState<number>(5000);

  // Credit card swipe
  const [spendCategory, setSpendCategory] = useState<string>('Livestock Herd');
  const [spendAmt, setSpendAmt] = useState<number>(1500);

  // Active selected bank account
  const currentAcct = state.bankAccounts.find((a) => a.id === selectedAcctId) || state.bankAccounts[0];
  const currentBankCfg = BANK_CATALOG.find((b) => b.id === currentAcct?.bankId);

  // Credit score rating
  const cibil = state.finances.creditScore;
  const cibilGrade =
    cibil >= 750 ? { label: 'Excellent', color: 'text-emerald-400', border: 'border-emerald-500' }
    : cibil >= 650 ? { label: 'Good', color: 'text-cyan-400', border: 'border-cyan-500' }
    : cibil >= 550 ? { label: 'Fair', color: 'text-amber-400', border: 'border-amber-500' }
    : { label: 'Poor', color: 'text-rose-400', border: 'border-rose-500' };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Commercial Multi-Banking & Credit Center</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Maintain accounts across premier institutions, manage revolving credit lines, and optimize interest yields.
          </p>
        </div>

        {/* Credit Score Gauge Pill */}
        <div className={`flex items-center gap-3 bg-[#0e1420] px-4 py-2 rounded-2xl border ${cibilGrade.border}`}>
          <div className="text-center">
            <span className="text-[10px] uppercase font-mono text-gray-400 block tracking-wider">CIBIL Score</span>
            <span className={`text-xl font-bold font-mono ${cibilGrade.color}`}>{cibil}</span>
          </div>
          <div className="border-l border-white/10 pl-3">
            <span className={`text-xs font-bold ${cibilGrade.color}`}>{cibilGrade.label}</span>
            <span className="text-[10px] text-gray-400 block">Defaults: {state.finances.loanDefaultCount}</span>
          </div>
        </div>
      </div>

      {/* 1. Multi-Bank Accounts Overview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono flex items-center gap-1.5">
            <Building className="w-4 h-4 text-cyan-400" />
            1. My Bank Accounts ({state.bankAccounts.length} / 5)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {state.bankAccounts.map((acct) => {
            const cfg = BANK_CATALOG.find((b) => b.id === acct.bankId);
            const isSelected = acct.id === selectedAcctId;

            return (
              <div
                key={acct.id}
                onClick={() => setSelectedAcctId(acct.id)}
                className={`bg-[#131926] border rounded-2xl p-4 shadow-sm cursor-pointer transition-all ${
                  isSelected ? 'border-emerald-500 shadow-emerald-500/10' : 'border-[#212836] hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{cfg?.emoji || '🏛️'}</span>
                    <div>
                      <h4 className="text-xs font-bold text-white">{cfg?.name}</h4>
                      <span className="text-[10px] text-gray-400 font-mono">Day {acct.openedDay}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>

                <div className="my-2">
                  <span className="text-[10px] text-gray-400 block font-mono uppercase">Balance</span>
                  <span className="text-lg font-bold font-mono text-cyan-400">
                    ₹{acct.balance.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-[11px] text-gray-400 border-t border-white/5 pt-2">
                  <span>Savings: {((cfg?.savingsRate || 0.0001) * 365 * 100).toFixed(2)}%/yr</span>
                  <span className="text-emerald-400 font-mono">+₹{acct.interestEarned.toFixed(0)} int</span>
                </div>
              </div>
            );
          })}

          {/* Open New Account Card */}
          {state.bankAccounts.length < 5 && (
            <div className="bg-[#131926]/50 border-2 border-dashed border-[#2b3547] hover:border-emerald-500/50 rounded-2xl p-4 flex flex-col justify-center items-center text-center transition-colors">
              <span className="text-2xl mb-1">➕</span>
              <span className="text-xs font-bold text-white">Open Account at Partner Bank</span>
              <p className="text-[11px] text-gray-400 mt-1 max-w-[200px]">
                Each institution provides unique savings, FD interest, and loan terms.
              </p>
              <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                {BANK_CATALOG.filter((b) => !state.bankAccounts.some((a) => a.bankId === b.id)).map((b) => (
                  <button
                    key={b.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      openBankAccount(b.id);
                    }}
                    disabled={state.finances.cash < b.openFee}
                    className="text-[10px] font-bold bg-[#1a2336] hover:bg-emerald-600/30 text-emerald-300 border border-white/10 px-2 py-1 rounded-lg transition-colors disabled:opacity-40"
                  >
                    {b.short} (₹{b.openFee})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Account Cash Operations & Inter-Account Transfers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Deposit & Withdraw into Selected Account */}
        <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{currentBankCfg?.emoji}</span>
              <span>{currentAcct?.name} Operations</span>
            </h4>
            <span className="text-xs font-mono font-bold text-cyan-400">
              ₹{currentAcct?.balance.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-2">
              <label className="text-[11px] text-gray-400 block font-mono">Deposit Cash (₹)</label>
              <input
                type="number"
                value={depositAmt}
                onChange={(e) => setDepositAmt(Number(e.target.value))}
                min={100}
                className="w-full bg-[#0e1420] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
              <button
                onClick={() => depositBank(selectedAcctId, depositAmt)}
                disabled={state.finances.cash < depositAmt}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold rounded-xl py-2 text-xs transition-colors"
              >
                Deposit (Cash: ₹{state.finances.cash.toLocaleString()})
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] text-gray-400 block font-mono">Withdraw to Cash (₹)</label>
              <input
                type="number"
                value={withdrawAmt}
                onChange={(e) => setWithdrawAmt(Number(e.target.value))}
                min={100}
                className="w-full bg-[#0e1420] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
              <button
                onClick={() => withdrawBank(selectedAcctId, withdrawAmt)}
                disabled={!currentAcct || currentAcct.balance < withdrawAmt}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold rounded-xl py-2 text-xs transition-colors"
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>

        {/* Transfer Between Bank Accounts */}
        <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
            Inter-Account Funds Wire
          </h4>

          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Source Account</label>
                <select
                  value={transferFrom}
                  onChange={(e) => setTransferFrom(e.target.value)}
                  className="w-full bg-[#0e1420] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  {state.bankAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (₹{a.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Destination Account</label>
                <select
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  className="w-full bg-[#0e1420] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  {state.bankAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (₹{a.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={transferAmt}
                onChange={(e) => setTransferAmt(Number(e.target.value))}
                min={100}
                className="flex-1 bg-[#0e1420] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                placeholder="Amount (₹)"
              />
              <button
                onClick={() => transferBank(transferFrom, transferTo, transferAmt)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl px-4 py-2 text-xs transition-colors"
              >
                Execute Transfer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Fixed Deposits, Bonds & SIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Fixed Deposits */}
        <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-3">
          <h4 className="text-sm font-bold text-white">Fixed Deposits</h4>
          <p className="text-xs text-gray-400">Guaranteed fixed return backed by bank guarantee.</p>

          <div className="space-y-2 pt-1">
            <div className="flex gap-2">
              <input
                type="number"
                value={fdAmt}
                onChange={(e) => setFdAmt(Number(e.target.value))}
                className="flex-1 bg-[#0e1420] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                placeholder="Amount"
              />
              <input
                type="number"
                value={fdDays}
                onChange={(e) => setFdDays(Number(e.target.value))}
                className="w-20 bg-[#0e1420] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                placeholder="Days"
              />
            </div>
            <button
              onClick={() => createFixedDeposit(selectedAcctId, fdAmt, fdDays)}
              disabled={state.finances.cash < fdAmt}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold rounded-xl py-2 text-xs transition-colors"
            >
              Open FD ({fdDays}d @ 7%/yr)
            </button>
          </div>

          <div className="space-y-1.5 text-xs pt-2">
            <span className="text-[10px] uppercase font-mono text-gray-400">Active Deposits:</span>
            {state.finances.fixedDeposits.length === 0 ? (
              <p className="text-gray-500 text-[11px]">No active FDs.</p>
            ) : (
              state.finances.fixedDeposits.map((fd) => (
                <div key={fd.id} className="flex justify-between p-2 rounded-lg bg-[#0e1420] border border-white/5 font-mono text-[11px]">
                  <span>₹{fd.amount.toLocaleString()}</span>
                  <span className="text-amber-400">{fd.daysLeft}d left</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sovereign Bonds */}
        <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-white">Sovereign Bonds</h4>
            <span className="font-mono text-xs font-bold text-emerald-400">
              ₹{state.finances.bonds.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-gray-400">Yield: +0.09%/day (+0.18% with Fixed Income Skill)</p>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => buyBonds(2500)}
              disabled={state.finances.cash < 2500}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold rounded-xl py-2 text-xs transition-colors"
            >
              Buy ₹2,500
            </button>
            <button
              onClick={() => sellBonds(2500)}
              disabled={state.finances.bonds < 2500}
              className="flex-1 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-semibold rounded-xl py-2 text-xs transition-colors disabled:opacity-40"
            >
              Sell ₹2,500
            </button>
          </div>
        </div>

        {/* Systematic Investment Plan (SIP) */}
        <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-white">Legacy Index SIP</h4>
            <span className="font-mono text-xs font-bold text-cyan-400">
              ₹{state.finances.sip.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-gray-400">Compound index growth +0.10%/day continuously.</p>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => investSip(1000)}
              disabled={state.finances.cash < 1000}
              className="flex-1 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-semibold rounded-xl py-2 text-xs transition-colors"
            >
              Invest ₹1,000
            </button>
            <button
              onClick={() => withdrawSip(1000)}
              disabled={state.finances.sip < 1000}
              className="flex-1 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-semibold rounded-xl py-2 text-xs transition-colors disabled:opacity-40"
            >
              Withdraw ₹1,000
            </button>
          </div>
        </div>
      </div>

      {/* 4. Multi-Loan System & Applications */}
      <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-rose-400" />
            4. Multi-Loan Borrowing Center
          </h3>
          <span className="text-xs text-gray-400">You may hold multiple active loans across banks</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Loan Application Form */}
          <div className="space-y-3 bg-[#0e1420] p-4 rounded-xl border border-white/5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 font-mono">Apply for New Loan</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Financing Bank</label>
                <select
                  value={loanBankId}
                  onChange={(e) => setLoanBankId(e.target.value)}
                  className="w-full bg-[#171f2e] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                >
                  {BANK_CATALOG.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.short} (Min CIBIL: {b.minCibilScore})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Purpose</label>
                <select
                  value={loanPurpose}
                  onChange={(e) => setLoanPurpose(e.target.value)}
                  className="w-full bg-[#171f2e] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="Livestock Expansion">Livestock Purchase</option>
                  <option value="Farmland & Crops">Farmland Acquisition</option>
                  <option value="Factory Machinery">Factory Equipment</option>
                  <option value="Commercial Real Estate">Real Estate</option>
                  <option value="Emergency Working Capital">Working Capital</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                value={loanAmt}
                onChange={(e) => setLoanAmt(Number(e.target.value))}
                min={1000}
                className="flex-1 bg-[#171f2e] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                placeholder="Loan Amount"
              />
              <button
                onClick={() => applyLoan(loanBankId, loanAmt, loanPurpose)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl px-4 py-1.5 text-xs transition-colors"
              >
                Submit Application
              </button>
            </div>
          </div>

          {/* Active Loans List & Repayment */}
          <div className="space-y-3 bg-[#0e1420] p-4 rounded-xl border border-white/5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 font-mono">
              Active Loans ({state.activeLoans.length})
            </h4>

            {state.activeLoans.length === 0 ? (
              <p className="text-xs text-gray-400 py-3 text-center">No outstanding debts. Outstanding creditworthiness!</p>
            ) : (
              <div className="space-y-2 max-h-[160px] overflow-y-auto">
                {state.activeLoans.map((l) => (
                  <div key={l.id} className="flex justify-between items-center p-2 rounded-lg bg-[#141b29] border border-white/5 text-xs">
                    <div>
                      <span className="font-bold text-white block">Loan #{l.id} · ₹{l.amount.toLocaleString()}</span>
                      <span className="text-[10px] text-gray-400">{l.purpose} · Day {l.startDay}</span>
                    </div>
                    <button
                      onClick={() => repayLoan(l.id, l.amount)}
                      disabled={state.finances.cash < l.amount}
                      className="bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-lg font-semibold text-xs disabled:opacity-40"
                    >
                      Repay in Full
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Credit Cards Management */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono flex items-center gap-1.5">
          <CreditCard className="w-4 h-4 text-purple-400" />
          5. Corporate & Executive Credit Cards
        </h3>

        {/* Owned Cards Carousel */}
        {state.creditCards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {state.creditCards.map((card) => {
              const cfg = CREDIT_CARD_CATALOG.find((c) => c.id === card.catalogId);
              return (
                <div
                  key={card.id}
                  className="rounded-2xl p-4 border border-white/10 shadow-lg text-white space-y-3 relative overflow-hidden"
                  style={{ background: cfg?.bg || '#1e293b' }}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-2xl">{cfg?.emoji}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 uppercase tracking-wider">
                      {cfg?.tier}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-white/70 block">{cfg?.name}</span>
                    <span className="text-sm font-mono tracking-widest">•••• •••• •••• {card.id * 1111}</span>
                  </div>

                  <div className="flex justify-between text-xs pt-1 border-t border-white/20">
                    <div>
                      <span className="text-[10px] text-white/70 block uppercase">Limit</span>
                      <span className="font-mono font-bold">₹{card.limit.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-white/70 block uppercase">Balance Due</span>
                      <span className="font-mono font-bold text-rose-300">₹{card.outstanding.toLocaleString()}</span>
                    </div>
                  </div>

                  {card.outstanding > 0 && (
                    <button
                      onClick={() => payCreditCard(card.id, card.outstanding)}
                      disabled={state.finances.cash < card.outstanding}
                      className="w-full bg-white text-gray-900 font-bold rounded-xl py-1.5 text-xs shadow-md disabled:opacity-40"
                    >
                      Pay Full Due (₹{card.outstanding.toLocaleString()})
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Available Cards Catalog to Apply */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CREDIT_CARD_CATALOG.map((cardCfg) => {
            const isOwned = state.creditCards.some((c) => c.catalogId === cardCfg.id);
            const canApply = state.finances.creditScore >= cardCfg.minScore;

            return (
              <div key={cardCfg.id} className="bg-[#131926] border border-[#212836] rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-2xl">{cardCfg.emoji}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1a2336] text-gray-300">
                    Min CIBIL {cardCfg.minScore}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white">{cardCfg.name}</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">{cardCfg.desc}</p>
                </div>

                <div className="text-[10px] space-y-1 text-gray-400">
                  {cardCfg.perks.slice(0, 2).map((p, idx) => (
                    <div key={idx} className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span className="truncate">{p}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => applyCreditCard(cardCfg.id)}
                  disabled={isOwned || !canApply}
                  className={`w-full py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    isOwned
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : canApply
                      ? 'bg-purple-600 hover:bg-purple-500 text-white'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isOwned ? 'Active' : canApply ? 'Apply for Card' : `Needs CIBIL ${cardCfg.minScore}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
