import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  IndianRupee, 
  X, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  UserCheck,
  UserX,
  PhoneCall
} from 'lucide-react';

export interface SeatData {
  id: number;
  seatNumber: string;
  zone: 'AC Cabin 1' | 'AC Cabin 2' | 'Silent Reading Hall' | 'Focus Cubicles';
  isAc: boolean;
  status: 'occupied' | 'vacant' | 'reserved' | 'fee_due';
  studentName?: string;
  phone?: string;
  shift: 'Morning (6-12)' | 'Afternoon (12-5)' | 'Evening (5-11)' | 'Full Day';
  feeStatus: 'Paid' | 'Due' | 'N/A';
  attendanceStatus: 'Checked In' | 'Expected' | 'Absent';
  joinedDate?: string;
}

const STORAGE_KEY_SEATS = 'radha_smart_seats_v1';

// Seed realistic 220 seats matching 185 occupied students
function generateInitialSeats(): SeatData[] {
  const seats: SeatData[] = [];
  const sampleNames = [
    'Ramesh Kumar', 'Priya Sharma', 'Rahul Reddy', 'Ananya Verma', 'Karthik Rao',
    'Sneha Patel', 'Venkatesh M.', 'Divya Nair', 'Sai Teja', 'Meera Iyer',
    'Arjun Das', 'Swathi G.', 'Naveen Kumar', 'Pooja Hegde', 'Manoj Gowda',
    'Bhavani S.', 'Siddharth R.', 'Harini P.', 'Vijay Krishna', 'Aishwarya K.'
  ];

  for (let i = 1; i <= 220; i++) {
    let zone: SeatData['zone'] = 'AC Cabin 1';
    let isAc = true;

    if (i <= 60) {
      zone = 'AC Cabin 1';
      isAc = true;
    } else if (i <= 120) {
      zone = 'AC Cabin 2';
      isAc = true;
    } else if (i <= 180) {
      zone = 'Silent Reading Hall';
      isAc = false;
    } else {
      zone = 'Focus Cubicles';
      isAc = false;
    }

    // 185 out of 220 occupied (approx ~84%)
    // Every ~6th seat vacant to make 35 vacant seats (220 - 35 = 185)
    const isVacant = i % 6 === 0 || i > 215;
    const isFeeDue = !isVacant && i % 11 === 0;
    const isReserved = !isVacant && !isFeeDue && i % 19 === 0;

    let status: SeatData['status'] = 'occupied';
    if (isVacant) status = 'vacant';
    else if (isFeeDue) status = 'fee_due';
    else if (isReserved) status = 'reserved';

    const nameIdx = (i * 7) % sampleNames.length;
    const shifts: SeatData['shift'][] = ['Morning (6-12)', 'Afternoon (12-5)', 'Evening (5-11)', 'Full Day'];
    const shift = shifts[i % shifts.length];

    seats.push({
      id: i,
      seatNumber: `S-${i < 10 ? '00' : i < 100 ? '0' : ''}${i}`,
      zone,
      isAc,
      status,
      studentName: isVacant ? undefined : sampleNames[nameIdx],
      phone: isVacant ? undefined : `+91 98${(76543210 + i * 111) % 90000000 + 10000000}`,
      shift,
      feeStatus: isVacant ? 'N/A' : isFeeDue ? 'Due' : 'Paid',
      attendanceStatus: isVacant ? 'Expected' : (i % 3 === 0 ? 'Checked In' : 'Expected'),
      joinedDate: '2026-11-01'
    });
  }
  return seats;
}

export const SmartSeatMap: React.FC = () => {
  const [seats, setSeats] = useState<SeatData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SEATS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return generateInitialSeats();
  });

  const [selectedSeat, setSelectedSeat] = useState<SeatData | null>(null);
  const [activeZone, setActiveZone] = useState<string>('all');
  const [activeShift, setActiveShift] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SEATS, JSON.stringify(seats));
    } catch (e) {}
  }, [seats]);

  // Statistics
  const totalSeats = seats.length;
  const occupiedCount = seats.filter(s => s.status === 'occupied').length;
  const vacantCount = seats.filter(s => s.status === 'vacant').length;
  const feeDueCount = seats.filter(s => s.status === 'fee_due').length;
  const reservedCount = seats.filter(s => s.status === 'reserved').length;
  const occupancyPercentage = Math.round(((totalSeats - vacantCount) / totalSeats) * 100);

  // Filtered Seats
  const filteredSeats = useMemo(() => {
    return seats.filter(s => {
      if (activeZone !== 'all' && s.zone !== activeZone) return false;
      if (activeShift !== 'all' && s.shift !== activeShift) return false;
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNumber = s.seatNumber.toLowerCase().includes(q);
        const matchName = s.studentName?.toLowerCase().includes(q) || false;
        if (!matchNumber && !matchName) return false;
      }
      return true;
    });
  }, [seats, activeZone, activeShift, statusFilter, searchQuery]);

  // Seat Click Handler
  const handleSelectSeat = (seat: SeatData) => {
    setSelectedSeat(seat);
  };

  // Quick Actions on Selected Seat
  const updateSeat = (seatId: number, updater: (s: SeatData) => SeatData) => {
    setSeats(prev => prev.map(s => s.id === seatId ? updater(s) : s));
    if (selectedSeat && selectedSeat.id === seatId) {
      setSelectedSeat(prev => prev ? updater(prev) : null);
    }
  };

  const handleToggleAttendance = () => {
    if (!selectedSeat) return;
    const newStatus = selectedSeat.attendanceStatus === 'Checked In' ? 'Absent' : 'Checked In';
    updateSeat(selectedSeat.id, s => ({ ...s, attendanceStatus: newStatus }));
    triggerActionNotice(`Attendance for ${selectedSeat.seatNumber} set to ${newStatus}`);
  };

  const handleMarkFeePaid = () => {
    if (!selectedSeat) return;
    updateSeat(selectedSeat.id, s => ({ ...s, feeStatus: 'Paid', status: 'occupied' }));
    triggerActionNotice(`Fee for ${selectedSeat.studentName || selectedSeat.seatNumber} marked as Paid (₹1,200)`);
  };

  const handleVacateSeat = () => {
    if (!selectedSeat) return;
    updateSeat(selectedSeat.id, s => ({
      ...s,
      status: 'vacant',
      studentName: undefined,
      phone: undefined,
      feeStatus: 'N/A',
      attendanceStatus: 'Expected'
    }));
    triggerActionNotice(`Seat ${selectedSeat.seatNumber} is now vacant`);
  };

  const triggerActionNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* 1. Header with Spatial Command Stats */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-emerald-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Spatial 220-Seat Interactive Universe</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Radha Study Hall Smart Seats Map
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Click any seat in the spatial grid to view assigned student details, verify fee status, log check-in attendance, or reassign desks.
            </p>
          </div>

          {/* Quick Metrics Bento */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 flex-shrink-0">
            <div className="bg-slate-800/80 backdrop-blur-md p-3 rounded-2xl border border-slate-700/60 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Occupancy</span>
              <span className="text-lg font-black text-emerald-400">{occupancyPercentage}%</span>
              <span className="text-[10px] text-slate-400 block">{totalSeats - vacantCount}/{totalSeats} Active</span>
            </div>

            <div className="bg-slate-800/80 backdrop-blur-md p-3 rounded-2xl border border-slate-700/60 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Occupied</span>
              <span className="text-lg font-black text-white">{occupiedCount}</span>
              <span className="text-[10px] text-emerald-400 block font-medium">Desks In-Use</span>
            </div>

            <div className="bg-slate-800/80 backdrop-blur-md p-3 rounded-2xl border border-slate-700/60 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Available</span>
              <span className="text-lg font-black text-sky-400">{vacantCount}</span>
              <span className="text-[10px] text-slate-400 block">Ready to allocate</span>
            </div>

            <div className="bg-slate-800/80 backdrop-blur-md p-3 rounded-2xl border border-slate-700/60 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Fee Due</span>
              <span className="text-lg font-black text-amber-400">{feeDueCount}</span>
              <span className="text-[10px] text-amber-300/80 block">Needs follow-up</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionNotice && (
        <div className="p-3 bg-emerald-500 text-white rounded-2xl text-xs font-bold flex items-center justify-between shadow-md animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Interactive Filter & Search Controls */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Zone Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex-shrink-0">
            Zones:
          </span>
          {[
            { id: 'all', label: 'All 220 Seats' },
            { id: 'AC Cabin 1', label: 'AC Cabin 1 (1-60)' },
            { id: 'AC Cabin 2', label: 'AC Cabin 2 (61-120)' },
            { id: 'Silent Reading Hall', label: 'Reading Hall (121-180)' },
            { id: 'Focus Cubicles', label: 'Focus Cubicles (181-220)' }
          ].map(z => (
            <button
              key={z.id}
              onClick={() => setActiveZone(z.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeZone === z.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
              }`}
            >
              {z.label}
            </button>
          ))}
        </div>

        {/* Search & Shift Filters */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search seat or student..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="occupied">Occupied</option>
            <option value="vacant">Vacant</option>
            <option value="fee_due">Fee Due</option>
            <option value="reserved">Reserved</option>
          </select>
        </div>
      </div>

      {/* Legend Bar */}
      <div className="flex flex-wrap items-center gap-4 px-2 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-emerald-500 shadow-2xs" />
          <span>Occupied (Active)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-amber-400 shadow-2xs" />
          <span>Fee Due</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-sky-400 shadow-2xs" />
          <span>Reserved</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-slate-200 border border-slate-300" />
          <span>Available (Vacant)</span>
        </div>
      </div>

      {/* 3. The 220 Seats Visual Interactive Grid */}
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs relative">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Spatial Desk Layout ({filteredSeats.length} seats shown)
          </span>
          <span className="text-xs text-slate-400">
            Click any seat to view profile
          </span>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 xl:grid-cols-20 gap-2 sm:gap-2.5 max-h-[500px] overflow-y-auto p-2 no-scrollbar">
          {filteredSeats.map(seat => {
            let colorClass = 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200';
            if (seat.status === 'occupied') {
              colorClass = 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600 shadow-xs hover:scale-105';
            } else if (seat.status === 'fee_due') {
              colorClass = 'bg-amber-400 hover:bg-amber-500 text-amber-950 border-amber-500 shadow-xs hover:scale-105';
            } else if (seat.status === 'reserved') {
              colorClass = 'bg-sky-400 hover:bg-sky-500 text-white border-sky-500 shadow-xs hover:scale-105';
            } else {
              colorClass = 'bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-700 border-dashed border-slate-300 hover:border-emerald-300';
            }

            const isSelected = selectedSeat?.id === seat.id;

            return (
              <button
                key={seat.id}
                onClick={() => handleSelectSeat(seat)}
                className={`relative flex flex-col items-center justify-center p-2 rounded-xl text-center border font-bold text-[11px] transition-all cursor-pointer ${colorClass} ${
                  isSelected ? 'ring-3 ring-emerald-500 ring-offset-2 scale-110 z-10' : ''
                }`}
                title={`Seat ${seat.seatNumber}: ${seat.studentName || 'Vacant'} (${seat.status})`}
              >
                <span>{seat.id}</span>
                {seat.status === 'fee_due' && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Interactive Slide-in Bottom Sheet / Modal for Selected Seat */}
      {selectedSeat && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200/80 animate-slide-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-xs ${
                  selectedSeat.status === 'occupied' ? 'bg-emerald-500 text-white' :
                  selectedSeat.status === 'fee_due' ? 'bg-amber-400 text-amber-950' :
                  selectedSeat.status === 'reserved' ? 'bg-sky-500 text-white' :
                  'bg-slate-100 text-slate-500'
                }`}>
                  {selectedSeat.seatNumber}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-tight">
                    {selectedSeat.studentName || 'Unassigned Desk'}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span>{selectedSeat.zone}</span>
                    <span>&bull;</span>
                    <span className="font-semibold text-emerald-600">{selectedSeat.isAc ? 'Air-Conditioned' : 'Quiet Zone'}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedSeat(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Grid */}
            <div className="py-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Shift Timing</span>
                  <span className="text-xs font-bold text-slate-800 mt-0.5 block">{selectedSeat.shift}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Fee Status</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-2 h-2 rounded-full ${selectedSeat.feeStatus === 'Paid' ? 'bg-emerald-500' : selectedSeat.feeStatus === 'Due' ? 'bg-rose-500' : 'bg-slate-400'}`} />
                    <span className={`text-xs font-bold ${selectedSeat.feeStatus === 'Due' ? 'text-rose-600' : 'text-slate-800'}`}>
                      {selectedSeat.feeStatus === 'Due' ? '₹1,200 Pending' : selectedSeat.feeStatus}
                    </span>
                  </div>
                </div>
              </div>

              {selectedSeat.studentName && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <PhoneCall className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Contact Phone</span>
                      <span className="text-xs font-bold text-slate-800">{selectedSeat.phone || 'N/A'}</span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    selectedSeat.attendanceStatus === 'Checked In' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {selectedSeat.attendanceStatus}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-2 flex flex-col gap-2">
              {selectedSeat.studentName ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleToggleAttendance}
                      className="px-3 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>{selectedSeat.attendanceStatus === 'Checked In' ? 'Mark Absent' : 'Check-In Student'}</span>
                    </button>

                    {selectedSeat.feeStatus === 'Due' ? (
                      <button
                        onClick={handleMarkFeePaid}
                        className="px-3 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <IndianRupee className="w-4 h-4" />
                        <span>Collect ₹1,200</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleVacateSeat}
                        className="px-3 py-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <UserX className="w-4 h-4" />
                        <span>Vacate Seat</span>
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <button
                  onClick={() => {
                    const studentName = prompt('Enter student name for seat ' + selectedSeat.seatNumber);
                    if (studentName) {
                      updateSeat(selectedSeat.id, s => ({
                        ...s,
                        status: 'occupied',
                        studentName,
                        phone: '+91 98' + Math.floor(10000000 + Math.random() * 90000000),
                        feeStatus: 'Paid',
                        attendanceStatus: 'Checked In',
                        joinedDate: new Date().toISOString().split('T')[0]
                      }));
                      triggerActionNotice(`Seat ${selectedSeat.seatNumber} assigned to ${studentName}`);
                    }
                  }}
                  className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Users className="w-4 h-4" />
                  <span>Assign New Student to Desk</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
