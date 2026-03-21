"use client";

import React, { useState } from 'react';
import { 
    Clock, 
    CheckCircle2, 
    XCircle, 
    AlertCircle, 
    Calendar,
    ChevronRight,
    User,
    Pill
} from 'lucide-react';
import { format } from 'date-fns';

interface Medicine {
    _id: string;
    name: string;
    dosage?: string;
    time: string;
    frequency: string;
    lastTakenDate?: string;
    familyMember: string;
    refusalCount: number;
    isRefused: boolean;
}

interface MedicineScheduleProps {
    medicines: Medicine[];
    onUpdate: () => void;
}

export default function MedicineSchedule({ medicines, onUpdate }: MedicineScheduleProps) {
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const handleAction = async (medicineId: string, action: 'take' | 'refuse') => {
        setActionLoading(medicineId);
        try {
            const res = await fetch(`/api/medicines/${medicineId}/${action}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                onUpdate();
            }
        } catch (error) {
            console.error(`Failed to ${action} medicine`, error);
        } finally {
            setActionLoading(null);
        }
    };

    const upcomingMeds = medicines.filter(med => !med.isRefused);
    const refusedMeds = medicines.filter(med => med.isRefused);

    const getTimeColorBase = (time?: string) => {
        if (!time) return 'slate';
        const t = time.toLowerCase();
        if (t.includes('morning')) return 'amber';
        if (t.includes('afternoon')) return 'orange';
        if (t.includes('evening')) return 'indigo';
        return 'slate';
    };

    const renderCard = (med: Medicine, isRefused = false) => {
        const timeColor = getTimeColorBase(med.time);
        
        // Robust date formatting to prevent crashes
        let lastTakenStr = 'Not taken today';
        let isTakenToday = false;
        
        if (med.lastTakenDate) {
            const date = new Date(med.lastTakenDate);
            if (!isNaN(date.getTime())) {
                lastTakenStr = format(date, 'MMM d, h:mm a');
                isTakenToday = date.toDateString() === new Date().toDateString();
            }
        }

        return (
            <div key={med._id} className={`group relative bg-white rounded-3xl p-6 shadow-sm border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isRefused ? 'border-red-100 opacity-80' : 'border-gray-50 hover:border-teal-100'}`}>
                {/* Status Badge */}
                <div className="absolute top-6 right-6 flex gap-2">
                    {isTakenToday && (
                        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-emerald-100">
                            Taken
                        </span>
                    )}
                    {isRefused && (
                        <span className="bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-red-100">
                            Refused / Missed
                        </span>
                    )}
                    {!isTakenToday && !isRefused && (
                        <span className={`bg-${timeColor}-50 text-${timeColor}-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-${timeColor}-100`}>
                            {med.time}
                        </span>
                    )}
                </div>

                <div className="flex gap-5">
                    {/* Icon Column */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner bg-${timeColor}-50`}>
                        <Pill className={`w-7 h-7 text-${timeColor}-500`} />
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-black text-gray-900 truncate">{med.name}</h3>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-gray-400 mb-4">
                            <span className="flex items-center gap-1.5 border-r border-gray-200 pr-4">
                                <User className="w-4 h-4 text-gray-300" />
                                {med.familyMember}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <ClipboardList size={16} className="w-4 h-4 text-gray-300" />
                                {med.dosage || '1 dose'}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="text-[11px] font-black text-gray-300 uppercase tracking-wider flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5" />
                                {isRefused ? 'Failed medical compliance' : `Last dose: ${lastTakenStr}`}
                            </div>

                            {!isRefused && !isTakenToday && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAction(med._id, 'refuse')}
                                        disabled={actionLoading === med._id}
                                        className="p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition active:scale-95 disabled:opacity-50"
                                        title="Refuse Dose"
                                    >
                                        <XCircle size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleAction(med._id, 'take')}
                                        disabled={actionLoading === med._id}
                                        className="p-3 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition active:scale-95 disabled:opacity-50"
                                        title="Mark as Taken"
                                    >
                                        <CheckCircle2 size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-12">
            {upcomingMeds.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-8 px-2">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Daily Schedule</h2>
                            <p className="text-gray-400 font-bold text-sm">Today, {format(new Date(), 'MMMM d')}</p>
                        </div>
                        <div className="bg-teal-50 text-teal-600 px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest border border-teal-100 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
                            {upcomingMeds.length} Items Remaining
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {upcomingMeds.map(med => renderCard(med))}
                    </div>
                </section>
            )}

            {refusedMeds.length > 0 && (
                <section>
                    <div className="flex items-center gap-3 mb-8 px-2">
                        <div className="p-2 rounded-xl bg-red-50 text-red-500">
                            <AlertCircle size={22} className="animate-bounce" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Refused / Missed Today</h2>
                            <p className="text-red-400 font-bold text-sm leading-none">Caretaker has been notified for persistent refusal</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {refusedMeds.map(med => renderCard(med, true))}
                    </div>
                </section>
            )}

            {medicines.length === 0 && (
                <div className="text-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ClipboardList size={40} className="w-10 h-10 text-gray-200" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">No Medicines Scheduled</h3>
                    <p className="text-gray-400 font-bold max-w-xs mx-auto">Add medicines to start tracking health and receive smart reminders.</p>
                </div>
            )}
        </div>
    );
}

const ClipboardList = ({size, className}: {size: number, className?: string}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className || ''}>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    </svg>
);
