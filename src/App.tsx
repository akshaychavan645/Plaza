/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, FormEvent } from 'react';
import { 
  UserPlus, 
  Car, 
  Phone, 
  User, 
  Search, 
  Trash2, 
  LogOut, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  LayoutDashboard,
  Filter,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Visitor {
  id: string;
  name: string;
  carNumber: string;
  phoneNumber: string;
  entryTime: string;
  exitTime?: string;
  status: 'active' | 'exited';
}

export default function App() {
  const [visitors, setVisitors] = useState<Visitor[]>(() => {
    const saved = localStorage.getItem('akshay_plaza_visitors');
    return saved ? JSON.parse(saved) : [];
  });

  const [name, setName] = useState('');
  const [carNumber, setCarNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'exited'>('all');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock Update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Persistence
  useEffect(() => {
    localStorage.setItem('akshay_plaza_visitors', JSON.stringify(visitors));
  }, [visitors]);

  const stats = useMemo(() => {
    const today = new Date().toLocaleDateString();
    const todayVisitors = visitors.filter(v => new Date(v.entryTime).toLocaleDateString() === today);
    return {
      totalToday: todayVisitors.length,
      currentlyIn: visitors.filter(v => v.status === 'active').length,
      exitedToday: todayVisitors.filter(v => v.status === 'exited').length
    };
  }, [visitors]);

  const filteredVisitors = useMemo(() => {
    return visitors
      .filter(v => {
        const matchesSearch = 
          v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.carNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.phoneNumber.includes(searchQuery);
        
        const matchesFilter = filterStatus === 'all' || v.status === filterStatus;
        
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime());
  }, [visitors, searchQuery, filterStatus]);

  const handleRegister = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !carNumber || !phoneNumber) return;

    const newVisitor: Visitor = {
      id: crypto.randomUUID(),
      name,
      carNumber: carNumber.toUpperCase(),
      phoneNumber,
      entryTime: new Date().toISOString(),
      status: 'active',
    };

    setVisitors([newVisitor, ...visitors]);
    setName('');
    setCarNumber('');
    setPhoneNumber('');
  };

  const handleExit = (id: string) => {
    setVisitors(visitors.map(v => 
      v.id === id ? { ...v, status: 'exited', exitTime: new Date().toISOString() } : v
    ));
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this record?')) {
      setVisitors(visitors.filter(v => v.id !== id));
    }
  };

  const downloadCSV = () => {
    const headers = ['Name,Car Number,Phone Number,Entry Time,Exit Time,Status'];
    const rows = visitors.map(v => 
      `${v.name},${v.carNumber},${v.phoneNumber},${v.entryTime},${v.exitTime || ''},${v.status}`
    );
    const content = [headers, ...rows].join('\n');
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `akshay_plaza_visitors_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100 p-6 flex flex-col gap-6">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 px-2">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase leading-none text-white italic">Akshay Plaza</h1>
          <p className="text-zinc-500 font-medium text-xs mt-2 uppercase tracking-[0.2em]">Visitor Management System • Security Terminal</p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-3xl font-mono font-bold leading-none tracking-tighter text-emerald-500">
            {currentTime.toLocaleTimeString([], { hour12: false })}
          </p>
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest mt-1">
            {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </header>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-min gap-4 flex-grow">
        
        {/* Entry Form - Bento Unit */}
        <section className="md:col-span-4 bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter flex items-center mb-8">
              <span className="w-2 h-6 bg-emerald-500 rounded-full mr-3 animate-pulse"></span>
              Registration
            </h2>
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-black ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Arjun Mehra"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-zinc-800 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-black ml-1">Vehicle ID</label>
                <div className="relative">
                  <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                  <input 
                    type="text" 
                    value={carNumber}
                    onChange={(e) => setCarNumber(e.target.value)}
                    placeholder="e.g. MH 12 AB 1234"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-zinc-800 font-mono text-sm uppercase"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-black ml-1">Contact Protocol</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                  <input 
                    type="tel" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-zinc-800 text-sm"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest py-5 rounded-2xl transition-all shadow-lg shadow-emerald-500/10 mt-4 active:scale-[0.98]"
              >
                Register Access
              </button>
            </form>
          </div>
        </section>

        {/* Visitor Logs - Large Bento Unit */}
        <section className="md:col-span-8 bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col overflow-hidden min-h-[400px]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-black uppercase tracking-tighter">Live Logs</h2>
              <span className="bg-zinc-800 text-zinc-500 text-[10px] px-3 py-1 rounded-full uppercase tracking-widest font-black flex items-center gap-1.5 border border-zinc-700/50">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Real-time
              </span>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter keys..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 shrink-0">
                {(['all', 'active', 'exited'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight transition-colors ${filterStatus === s ? 'bg-emerald-500 text-black' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-zinc-500 text-[10px] uppercase tracking-widest border-b border-zinc-800">
                  <th className="pb-4 font-black">Visitor Profile</th>
                  <th className="pb-4 font-black">Vehicle ID</th>
                  <th className="pb-4 font-black text-right">Access</th>
                  <th className="pb-4 font-black text-right">Status</th>
                  <th className="pb-4 font-black text-right">Ops</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <AnimatePresence mode="popLayout">
                  {filteredVisitors.map((v) => (
                    <motion.tr 
                      layout
                      key={v.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="border-b border-zinc-800/30 hover:bg-zinc-800/40 transition-colors group"
                    >
                      <td className="py-5">
                        <div className="font-bold text-zinc-100">{v.name}</div>
                        <div className="text-[10px] text-zinc-600 mt-0.5 font-mono">{v.phoneNumber}</div>
                      </td>
                      <td className="py-5">
                        <span className="font-mono text-xs text-zinc-400 bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-lg">{v.carNumber}</span>
                      </td>
                      <td className="py-5 text-right font-mono text-xs text-zinc-500">
                        {new Date(v.entryTime).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-5 text-right">
                        {v.status === 'active' ? (
                          <span className="text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter">INSIDE</span>
                        ) : (
                          <span className="text-zinc-500 bg-zinc-800 border border-zinc-700/50 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter">OUT</span>
                        )}
                      </td>
                      <td className="py-5 text-right">
                        <div className="flex justify-end gap-2">
                          {v.status === 'active' && (
                            <button 
                              onClick={() => handleExit(v.id)}
                              className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700/50 hover:bg-emerald-500 hover:text-black text-zinc-400 transition-all active:scale-[0.9]"
                            >
                              <LogOut size={16} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(v.id)}
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700/50 hover:bg-red-500 hover:text-black text-zinc-400 transition-all active:scale-[0.9]"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            {filteredVisitors.length === 0 && (
              <div className="py-24 text-center text-zinc-800 uppercase tracking-widest text-[10px] font-black flex flex-col items-center gap-4">
                <Filter size={32} className="opacity-10" />
                No log sequence detected
              </div>
            )}
          </div>
        </section>

        {/* Occupancy Bento Unit */}
        <div className="md:col-span-3 bg-emerald-500 text-black rounded-3xl p-8 flex flex-col justify-between shadow-lg shadow-emerald-500/20">
          <p className="font-black uppercase tracking-tighter leading-none text-sm">Inside<br/>Perimeter</p>
          <div className="flex items-baseline gap-2">
            <span className="text-7xl font-black italic tracking-tighter">{stats.currentlyIn}</span>
            <span className="text-xl font-bold opacity-30">UNIT</span>
          </div>
        </div>

        {/* Stats Bento Unit */}
        <div className="md:col-span-3 bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col justify-between">
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Session Logs Today</p>
          <div className="space-y-1">
            <p className="text-3xl font-black leading-none text-white italic tracking-tighter">{stats.totalToday}</p>
            <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Entry confirmed</p>
          </div>
          <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((stats.totalToday / 50) * 100, 100)}%` }}
              className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
            />
          </div>
        </div>

        {/* Actions Bento Unit */}
        <div className="md:col-span-6 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 grid grid-cols-2 gap-4">
          <div 
            onClick={downloadCSV}
            className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-center items-center gap-3 group cursor-pointer hover:border-emerald-500/50 transition-all hover:bg-zinc-900"
          >
            <div className="text-zinc-600 group-hover:text-emerald-500 transition-all duration-300 transform group-hover:scale-110">
              <Download size={28} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-zinc-100">Export Fragments</span>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-center items-center gap-3 group cursor-pointer hover:border-emerald-500/50 transition-all hover:bg-zinc-900">
            <div className="text-zinc-600 group-hover:text-emerald-500 transition-all duration-300 transform group-hover:scale-110">
              <ShieldCheck size={28} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-zinc-100">System Secure</span>
          </div>
        </div>

      </div>

      {/* Footer Info */}
      <footer className="mt-auto flex flex-col md:flex-row justify-between items-center px-2 py-4 border-t border-zinc-900 gap-4">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Master Terminal: AK01</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-800 text-[10px] font-bold uppercase tracking-widest border border-zinc-800 px-2 py-0.5 rounded">DB_LOCAL_MODE</span>
          </div>
        </div>
        <p className="text-zinc-800 text-[10px] font-black uppercase tracking-[0.4em]">ENCRYPT_PROTO_ACTIVE • PLAZA_OS_v2.4</p>
      </footer>
    </div>
  );
}


