/**
 * AR360X — Commercial Ventures: Restaurants, Hospitals, Machinery Rental
 */
import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Store, Utensils, Stethoscope, Tractor, CheckCircle2 } from 'lucide-react';

export const VenturesView: React.FC = () => {
  const {
    state,
    openRestaurant,
    upgradeRestaurant,
    closeRestaurant,
    openHospital,
    upgradeHospital,
    unlockHospitalSpec,
    buyEquipment,
    acceptRental,
    serviceEquipment,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'restaurants' | 'hospitals' | 'equipment'>('restaurants');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-orange-400" />
            <h2 className="text-xl font-bold text-white">Commercial Ventures & Machinery Fleet</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Build regional dining chains, establish multi-specialty healthcare centers, and rent tractors/harvesters to local farms.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#1a2336] border border-white/5 rounded-xl px-4 py-2 text-center">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-mono block">Ventures Count</span>
            <span className="text-base font-bold font-mono text-orange-400">
              {state.restaurants.length + state.hospitals.length + state.equipmentFleet.length} Units
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#212836] pb-2">
        <button
          onClick={() => setActiveTab('restaurants')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'restaurants' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' : 'text-gray-400 hover:text-white'
          }`}
        >
          🍽️ Restaurant Chain ({state.restaurants.length})
        </button>
        <button
          onClick={() => setActiveTab('hospitals')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'hospitals' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' : 'text-gray-400 hover:text-white'
          }`}
        >
          🏥 Hospital Network ({state.hospitals.length})
        </button>
        <button
          onClick={() => setActiveTab('equipment')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'equipment' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' : 'text-gray-400 hover:text-white'
          }`}
        >
          🚜 Machinery Rental ({state.equipmentFleet.length})
        </button>
      </div>

      {/* TAB 1: RESTAURANTS */}
      {activeTab === 'restaurants' && (
        <div className="space-y-4">
          {/* Open Outlet Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'dhaba' as const, name: 'Roadside Dhaba', cost: 15000, icon: '🍛', desc: 'Thalis & Chai · Fast ROI' },
              { id: 'cafe' as const, name: 'Urban Cafe', cost: 60000, icon: '☕', desc: 'Espresso & Waffles' },
              { id: 'restaurant' as const, name: 'Family Restaurant', cost: 200000, icon: '🍽️', desc: 'Banquet & Dining' },
              { id: 'chain' as const, name: 'Franchise Brand', cost: 800000, icon: '🏪', desc: 'High Volume Chain' },
            ].map((tier) => (
              <div key={tier.id} className="bg-[#131926] border border-[#212836] rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{tier.icon}</span>
                  <div>
                    <h4 className="text-xs font-bold text-white">{tier.name}</h4>
                    <span className="text-[10px] text-gray-400">{tier.desc}</span>
                  </div>
                </div>
                <button
                  onClick={() => openRestaurant(tier.id)}
                  disabled={state.finances.cash < tier.cost}
                  className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white font-bold rounded-xl py-2 text-xs transition-colors"
                >
                  Launch (₹{tier.cost.toLocaleString()})
                </button>
              </div>
            ))}
          </div>

          {/* Active Outlets */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.restaurants.map((res) => (
              <div key={res.id} className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-white">{res.name}</h4>
                    <span className="text-xs text-gray-400">{res.location} · Level {res.level}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    +₹{(res.level * 1200).toLocaleString()}/day
                  </span>
                </div>

                <div className="bg-[#0e1420] p-2.5 rounded-xl border border-white/5 space-y-1 text-xs">
                  {res.menuItems.map((m, idx) => (
                    <div key={idx} className="flex justify-between font-mono text-gray-300">
                      <span>{m.name}</span>
                      <span>₹{m.price}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => upgradeRestaurant(res.id)}
                    className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl py-1.5 text-xs transition-colors"
                  >
                    Upgrade Lv.{res.level + 1}
                  </button>
                  <button
                    onClick={() => closeRestaurant(res.id)}
                    className="bg-rose-500/20 text-rose-300 rounded-xl px-3 py-1.5 text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: HOSPITALS */}
      {activeTab === 'hospitals' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'clinic' as const, name: 'Outpatient Clinic', cost: 30000, icon: '🏥' },
              { id: 'hospital' as const, name: 'General Hospital', cost: 250000, icon: '🏨' },
              { id: 'multispec' as const, name: 'Multi-Specialty Center', cost: 900000, icon: '🏛️' },
            ].map((h) => (
              <div key={h.id} className="bg-[#131926] border border-[#212836] rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{h.icon}</span>
                  <h4 className="text-xs font-bold text-white">{h.name}</h4>
                </div>
                <button
                  onClick={() => openHospital(h.id)}
                  disabled={state.finances.cash < h.cost}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold rounded-xl py-2 text-xs transition-colors"
                >
                  Commission (₹{h.cost.toLocaleString()})
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.hospitals.map((hosp) => (
              <div key={hosp.id} className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-white">Medical Center #{hosp.id} ({hosp.typeId})</h4>
                    <span className="text-xs text-gray-400">Level {hosp.level} · Day {hosp.openedDay}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {hosp.dailyPatients} Patients / day
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Cardiology', 'Oncology', 'Pediatrics', 'Neurology'].map((spec) => {
                    const hasSpec = hosp.specs.includes(spec);
                    return (
                      <button
                        key={spec}
                        onClick={() => unlockHospitalSpec(hosp.id, spec)}
                        disabled={hasSpec || state.finances.cash < 50000}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                          hasSpec
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-[#0e1420] text-gray-400 hover:text-white border border-white/10'
                        }`}
                      >
                        {spec} {hasSpec ? '✓' : '(₹50K)'}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => upgradeHospital(hosp.id)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl py-2 text-xs transition-colors"
                >
                  Upgrade Hospital Level ({hosp.level + 1})
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: EQUIPMENT RENTAL */}
      {activeTab === 'equipment' && (
        <div className="space-y-4">
          {/* Purchase Catalog */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'tractor', name: 'Tractor', icon: '🚜', cost: 80000, rent: '₹1,200/d' },
              { id: 'harvester', name: 'Harvester', icon: '🌾', cost: 350000, rent: '₹4,800/d' },
              { id: 'truck', name: 'Transport Truck', icon: '🚛', cost: 120000, rent: '₹1,800/d' },
              { id: 'crane', name: 'Mini Crane', icon: '🏗️', cost: 200000, rent: '₹3,200/d' },
            ].map((eq) => (
              <div key={eq.id} className="bg-[#131926] border border-[#212836] rounded-2xl p-4 shadow-sm space-y-2 text-center">
                <span className="text-3xl block">{eq.icon}</span>
                <h4 className="text-xs font-bold text-white">{eq.name}</h4>
                <span className="text-[10px] text-emerald-400 font-mono block">Rent: {eq.rent}</span>
                <button
                  onClick={() => buyEquipment(eq.id)}
                  disabled={state.finances.cash < eq.cost}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold rounded-xl py-1.5 text-xs transition-colors"
                >
                  Buy (₹{(eq.cost / 1000).toFixed(0)}K)
                </button>
              </div>
            ))}
          </div>

          {/* Pending Rental Inquiries */}
          {state.rentalRequests.length > 0 && (
            <div className="bg-[#131926] border border-[#212836] rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">
                Incoming Rental Requests ({state.rentalRequests.length})
              </h3>
              <div className="space-y-2">
                {state.rentalRequests.map((req) => (
                  <div key={req.id} className="flex justify-between items-center p-3 rounded-xl bg-[#0e1420] border border-white/5 text-xs font-mono">
                    <div>
                      <span className="font-bold text-white block">{req.equipIcon} {req.renterName} needs {req.equipName}</span>
                      <span className="text-gray-400">{req.days} days @ ₹{req.dailyRate}/day</span>
                    </div>
                    <button
                      onClick={() => acceptRental(req.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs font-sans"
                    >
                      Accept Deal
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fleet Units */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {state.equipmentFleet.map((u) => (
              <div key={u.id} className="bg-[#131926] border border-[#212836] rounded-2xl p-4 shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-white capitalize">{u.equipId} #{u.id}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase font-mono ${
                    u.status === 'rented' ? 'bg-amber-500/20 text-amber-300' : u.status === 'maintenance' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {u.status}
                  </span>
                </div>
                <div className="text-[11px] text-gray-400 font-mono">
                  <span>Earned: ₹{u.totalEarned.toLocaleString()}</span>
                  {u.status === 'rented' && <span className="text-amber-400 block">Rented till Day {u.rentedTill}</span>}
                </div>
                {u.status === 'maintenance' && (
                  <button
                    onClick={() => serviceEquipment(u.id)}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl py-1 text-xs"
                  >
                    Service (₹1,200)
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
