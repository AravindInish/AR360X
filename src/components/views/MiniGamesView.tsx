/**
 * AR360X — Casino, Mini-Games Hub & Mega Lottery
 */
import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Dice5, Sparkles, Trophy, HelpCircle, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

const WHEEL_SEGMENTS = [
  { label: '2×', mult: 2, color: '#10b981', prob: 0.15 },
  { label: 'LOSE', mult: 0, color: '#ef4444', prob: 0.25 },
  { label: '1.5×', mult: 1.5, color: '#38bdf8', prob: 0.20 },
  { label: 'LOSE', mult: 0, color: '#ef4444', prob: 0.15 },
  { label: '3×', mult: 3, color: '#f59e0b', prob: 0.08 },
  { label: '1×', mult: 1, color: '#94a3b8', prob: 0.10 },
  { label: '5×', mult: 5, color: '#a855f7', prob: 0.04 },
  { label: 'LOSE', mult: 0, color: '#ef4444', prob: 0.03 },
];

export const MiniGamesView: React.FC = () => {
  const { state, buyLotteryTicket, scratchCard, recordMiniGameResult } = useGame();

  const [activeGame, setActiveGame] = useState<'lobby' | 'wheel' | 'cards' | 'dice' | 'lottery'>('lobby');

  // Wheel state
  const [wheelBet, setWheelBet] = useState<number>(500);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [wheelRotation, setWheelRotation] = useState<number>(0);
  const [wheelResultMsg, setWheelResultMsg] = useState<string | null>(null);

  // Dice state
  const [diceBet, setDiceBet] = useState<number>(500);
  const [dicePrediction, setDicePrediction] = useState<'high' | 'low' | 'seven'>('high');
  const [diceRolls, setDiceRolls] = useState<[number, number] | null>(null);
  const [diceMsg, setDiceMsg] = useState<string | null>(null);

  // Card Flip Memory state
  const cardEmojis = ['🌟', '🍀', '💎', '🔥', '⚡', '🌙', '🎯', '🌺'];
  const [cardsDeck, setCardsDeck] = useState<string[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedCards, setMatchedCards] = useState<number[]>([]);
  const [cardBet, setCardBet] = useState<number>(1000);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);

  // Spin Wheel Logic
  const handleSpinWheel = () => {
    if (state.finances.cash < wheelBet || isSpinning) return;
    state.finances.cash -= wheelBet;
    setIsSpinning(true);
    setWheelResultMsg(null);

    const rand = Math.random();
    let cum = 0;
    let chosen = WHEEL_SEGMENTS[0];
    for (const seg of WHEEL_SEGMENTS) {
      cum += seg.prob;
      if (rand <= cum) {
        chosen = seg;
        break;
      }
    }

    const segIdx = WHEEL_SEGMENTS.indexOf(chosen);
    const segAngle = 360 / WHEEL_SEGMENTS.length;
    const targetDeg = wheelRotation + 360 * 5 + (360 - (segIdx * segAngle + segAngle / 2));
    setWheelRotation(targetDeg);

    setTimeout(() => {
      setIsSpinning(false);
      const win = Math.round(wheelBet * chosen.mult);
      const profit = win - wheelBet;
      if (win > 0) {
        state.finances.cash += win;
        setWheelResultMsg(`🎉 YOU WON ₹${win.toLocaleString()}! (${chosen.label})`);
        recordMiniGameResult('Spin Wheel', 'Win', profit);
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      } else {
        setWheelResultMsg(`💸 Unlucky! Wheel landed on ${chosen.label}`);
        recordMiniGameResult('Spin Wheel', 'Lose', wheelBet);
      }
    }, 3500);
  };

  // Dice Logic
  const handleRollDice = () => {
    if (state.finances.cash < diceBet) return;
    state.finances.cash -= diceBet;

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2;
    setDiceRolls([d1, d2]);

    let won = false;
    let mult = 1.9;
    if (dicePrediction === 'high' && total >= 8) won = true;
    else if (dicePrediction === 'low' && total <= 6) won = true;
    else if (dicePrediction === 'seven' && total === 7) {
      won = true;
      mult = 4.0;
    }

    if (won) {
      const win = Math.round(diceBet * mult);
      state.finances.cash += win;
      setDiceMsg(`🎉 Dice landed ${d1} + ${d2} = ${total}! Won ₹${win.toLocaleString()} (×${mult})`);
      recordMiniGameResult('Dice', 'Win', win - diceBet);
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
    } else {
      setDiceMsg(`😔 Dice landed ${d1} + ${d2} = ${total}. Lost ₹${diceBet.toLocaleString()}`);
      recordMiniGameResult('Dice', 'Lose', diceBet);
    }
  };

  // Card Flip Logic
  const startCardsGame = () => {
    if (state.finances.cash < cardBet) return;
    state.finances.cash -= cardBet;
    const deck = [...cardEmojis, ...cardEmojis].sort(() => Math.random() - 0.5);
    setCardsDeck(deck);
    setFlippedCards([]);
    setMatchedCards([]);
    setIsGameActive(true);
  };

  const handleFlip = (idx: number) => {
    if (flippedCards.length >= 2 || flippedCards.includes(idx) || matchedCards.includes(idx)) return;
    const newFlipped = [...flippedCards, idx];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (cardsDeck[first] === cardsDeck[second]) {
        const newMatched = [...matchedCards, first, second];
        setMatchedCards(newMatched);
        setFlippedCards([]);

        if (newMatched.length === cardsDeck.length) {
          const win = Math.round(cardBet * 2.5);
          state.finances.cash += win;
          setIsGameActive(false);
          recordMiniGameResult('Card Flip', 'Win', win - cardBet);
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        }
      } else {
        setTimeout(() => setFlippedCards([]), 900);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Dice5 className="w-5 h-5 text-yellow-400" />
            <h2 className="text-xl font-bold text-white">Casino, Mini-Games & Sovereign Lottery</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Test your fortune with Lucky Multiplier Wheel, High/Low Dice, Memory Card Flip, and instant scratchcards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#1a2336] border border-white/5 rounded-xl px-4 py-2 text-center">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-mono block">Win Streak</span>
            <span className="text-base font-bold font-mono text-yellow-400">{state.miniGames.winStreak} 🔥</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#212836] pb-2">
        <button
          onClick={() => setActiveGame('lobby')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeGame === 'lobby' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' : 'text-gray-400 hover:text-white'
          }`}
        >
          🎮 Game Lobby
        </button>
        <button
          onClick={() => setActiveGame('wheel')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeGame === 'wheel' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' : 'text-gray-400 hover:text-white'
          }`}
        >
          🎡 Lucky Wheel
        </button>
        <button
          onClick={() => setActiveGame('cards')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeGame === 'cards' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' : 'text-gray-400 hover:text-white'
          }`}
        >
          🃏 Card Flip
        </button>
        <button
          onClick={() => setActiveGame('dice')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeGame === 'dice' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' : 'text-gray-400 hover:text-white'
          }`}
        >
          🎲 Dice Showdown
        </button>
        <button
          onClick={() => setActiveGame('lottery')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeGame === 'lottery' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' : 'text-gray-400 hover:text-white'
          }`}
        >
          🎫 Scratch Lottery
        </button>
      </div>

      {/* TAB 1: LOBBY */}
      {activeGame === 'lobby' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => setActiveGame('wheel')}
            className="bg-[#131926] hover:bg-[#182030] border border-[#212836] hover:border-yellow-500/40 rounded-2xl p-5 shadow-sm cursor-pointer transition-all space-y-3"
          >
            <span className="text-3xl block">🎡</span>
            <h4 className="text-sm font-bold text-white">Lucky Multiplier Wheel</h4>
            <p className="text-xs text-gray-400">Spin for instant win multipliers up to 5×.</p>
          </div>

          <div
            onClick={() => setActiveGame('cards')}
            className="bg-[#131926] hover:bg-[#182030] border border-[#212836] hover:border-yellow-500/40 rounded-2xl p-5 shadow-sm cursor-pointer transition-all space-y-3"
          >
            <span className="text-3xl block">🃏</span>
            <h4 className="text-sm font-bold text-white">Memory Card Match</h4>
            <p className="text-xs text-gray-400">Match all 8 pairs to earn 2.5× payout.</p>
          </div>

          <div
            onClick={() => setActiveGame('dice')}
            className="bg-[#131926] hover:bg-[#182030] border border-[#212836] hover:border-yellow-500/40 rounded-2xl p-5 shadow-sm cursor-pointer transition-all space-y-3"
          >
            <span className="text-3xl block">🎲</span>
            <h4 className="text-sm font-bold text-white">Dice Showdown</h4>
            <p className="text-xs text-gray-400">Predict High, Low, or Lucky 7 (4× payout).</p>
          </div>

          <div
            onClick={() => setActiveGame('lottery')}
            className="bg-[#131926] hover:bg-[#182030] border border-[#212836] hover:border-yellow-500/40 rounded-2xl p-5 shadow-sm cursor-pointer transition-all space-y-3"
          >
            <span className="text-3xl block">🎫</span>
            <h4 className="text-sm font-bold text-white">Instant Scratchcards</h4>
            <p className="text-xs text-gray-400">Scratch & reveal up to ₹10 Lakhs jackpot!</p>
          </div>
        </div>
      )}

      {/* TAB 2: SPIN WHEEL */}
      {activeGame === 'wheel' && (
        <div className="bg-[#131926] border border-[#212836] rounded-2xl p-6 text-center space-y-6">
          <h3 className="text-base font-bold text-white">Lucky Multiplier Wheel</h3>

          {/* SVG Conic Wheel */}
          <div className="relative inline-block my-2">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-2xl z-20">▼</div>
            <div
              className="w-56 h-56 rounded-full border-4 border-[#2b3547] shadow-2xl relative overflow-hidden"
              style={{
                transform: `rotate(${wheelRotation}deg)`,
                transition: 'transform 3.5s cubic-bezier(0.17, 0.67, 0.21, 0.99)',
                background: 'conic-gradient(#10b981 0deg 45deg, #ef4444 45deg 90deg, #38bdf8 90deg 135deg, #ef4444 135deg 180deg, #f59e0b 180deg 225deg, #94a3b8 225deg 270deg, #a855f7 270deg 315deg, #ef4444 315deg 360deg)',
              }}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#111827] border-2 border-white/20 z-10" />
          </div>

          {wheelResultMsg && (
            <div className="text-sm font-bold text-amber-400 font-mono animate-pulse">
              {wheelResultMsg}
            </div>
          )}

          <div className="flex items-center justify-center gap-3">
            <input
              type="number"
              value={wheelBet}
              onChange={(e) => setWheelBet(Math.max(100, Number(e.target.value)))}
              min={100}
              className="bg-[#0e1420] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono w-28 text-center"
            />
            <button
              onClick={handleSpinWheel}
              disabled={isSpinning || state.finances.cash < wheelBet}
              className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 text-gray-900 font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-yellow-500/20"
            >
              {isSpinning ? 'Spinning...' : 'SPIN WHEEL'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: CARD FLIP */}
      {activeGame === 'cards' && (
        <div className="bg-[#131926] border border-[#212836] rounded-2xl p-6 text-center space-y-5">
          <h3 className="text-base font-bold text-white">Memory Card Match (2.5× Payout)</h3>

          {!isGameActive ? (
            <div className="space-y-3">
              <p className="text-xs text-gray-400">Match all 8 pairs on the board to claim the jackpot.</p>
              <div className="flex justify-center gap-2">
                <input
                  type="number"
                  value={cardBet}
                  onChange={(e) => setCardBet(Math.max(100, Number(e.target.value)))}
                  className="bg-[#0e1420] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono w-28 text-center"
                />
                <button
                  onClick={startCardsGame}
                  disabled={state.finances.cash < cardBet}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-2 rounded-xl text-xs"
                >
                  Start Game (₹{cardBet.toLocaleString()})
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2.5 max-w-xs mx-auto">
              {cardsDeck.map((emoji, idx) => {
                const isFlipped = flippedCards.includes(idx) || matchedCards.includes(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => handleFlip(idx)}
                    className={`h-16 rounded-xl flex items-center justify-center text-2xl font-bold transition-all border ${
                      isFlipped ? 'bg-purple-600/30 border-purple-500 text-white' : 'bg-[#0e1420] border-white/10 text-transparent'
                    }`}
                  >
                    {isFlipped ? emoji : '?'}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: DICE */}
      {activeGame === 'dice' && (
        <div className="bg-[#131926] border border-[#212836] rounded-2xl p-6 text-center space-y-5">
          <h3 className="text-base font-bold text-white">High / Low Dice Showdown</h3>

          {diceRolls && (
            <div className="flex justify-center gap-4 text-4xl my-2">
              <span className="p-3 bg-[#0e1420] rounded-2xl border border-white/10">🎲 {diceRolls[0]}</span>
              <span className="p-3 bg-[#0e1420] rounded-2xl border border-white/10">🎲 {diceRolls[1]}</span>
            </div>
          )}

          {diceMsg && <div className="text-xs font-mono font-bold text-amber-400">{diceMsg}</div>}

          <div className="flex justify-center gap-2">
            {(['low', 'seven', 'high'] as const).map((pred) => (
              <button
                key={pred}
                onClick={() => setDicePrediction(pred)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  dicePrediction === pred ? 'bg-yellow-500 text-gray-900 shadow-md' : 'bg-[#0e1420] text-gray-300 border border-white/10'
                }`}
              >
                {pred === 'low' ? 'LOW (2-6) ×1.9' : pred === 'seven' ? 'LUCKY 7 ×4.0' : 'HIGH (8-12) ×1.9'}
              </button>
            ))}
          </div>

          <div className="flex justify-center gap-2">
            <input
              type="number"
              value={diceBet}
              onChange={(e) => setDiceBet(Math.max(50, Number(e.target.value)))}
              className="bg-[#0e1420] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono w-28 text-center"
            />
            <button
              onClick={handleRollDice}
              disabled={state.finances.cash < diceBet}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2 rounded-xl text-xs"
            >
              Roll Dice (₹{diceBet.toLocaleString()})
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: LOTTERY */}
      {activeGame === 'lottery' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { type: 'daily' as const, name: 'Daily Express', cost: 50, prize: '₹5,000' },
              { type: 'weekly' as const, name: 'Weekly Mega', cost: 200, prize: '₹50,000' },
              { type: 'instant' as const, name: 'Instant Scratchcard', cost: 100, prize: '₹10 Lakhs' },
            ].map((t) => (
              <div key={t.type} className="bg-[#131926] border border-[#212836] rounded-2xl p-4 shadow-sm space-y-3">
                <h4 className="text-sm font-bold text-white">{t.name}</h4>
                <p className="text-xs text-gray-400">Jackpot Pool: {t.prize}</p>
                <button
                  onClick={() => buyLotteryTicket(t.type)}
                  disabled={state.finances.cash < t.cost}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 text-gray-900 font-bold rounded-xl py-2 text-xs"
                >
                  Buy Ticket (₹{t.cost})
                </button>
              </div>
            ))}
          </div>

          {state.lottery.scratchCards.length > 0 && (
            <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-3">
              <h4 className="text-xs font-bold uppercase font-mono text-gray-400">My Unrevealed Scratchcards</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {state.lottery.scratchCards.map((sc) => (
                  <div
                    key={sc.id}
                    onClick={() => scratchCard(sc.id)}
                    className={`p-4 rounded-xl text-center border cursor-pointer transition-all ${
                      sc.revealed ? 'bg-[#0e1420] border-emerald-500/40' : 'bg-yellow-500/10 border-yellow-500/30 hover:scale-105'
                    }`}
                  >
                    <span className="text-2xl block mb-1">🎫</span>
                    <span className="text-xs font-bold text-white font-mono block">
                      {sc.revealed ? sc.prize.label : 'Tap to Scratch'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
