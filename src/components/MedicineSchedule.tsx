'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Sunset, Moon, Sunrise, Clock, AlertCircle } from 'lucide-react';

interface Medicine {
  _id: string;
  name: string;
  dosage: string;
  time: string;
  frequency: string;
  lastTakenDate?: string;
}

export default function MedicineSchedule() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const res = await fetch('/api/medicines');
      if (res.ok) {
        const data = await res.json();
        setMedicines(data);
      }
    } catch (err) {
      console.error('Failed to fetch medicines', err);
    } finally {
      setLoading(false);
    }
  };

  const hasTakenToday = (med: Medicine) => {
    if (!med.lastTakenDate) return false;
    const takenDate = new Date(med.lastTakenDate).toDateString();
    const today = new Date().toDateString();
    return takenDate === today;
  };

  const getMedsByTime = (timeKeyword: string) => {
    return medicines.filter((med) => med.time?.toLowerCase().includes(timeKeyword));
  };

  const scheduleBlocks = [
    { title: 'Morning', icon: Sunrise, keyword: 'morning', color: 'text-amber-500', bg: 'bg-amber-50' },
    { title: 'Afternoon', icon: Sun, keyword: 'afternoon', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { title: 'Evening', icon: Sunset, keyword: 'evening', color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Night', icon: Moon, keyword: 'night', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  if (loading) {
    return (
      <div className="flex animate-pulse gap-4 p-6 bg-white rounded-3xl border border-gray-100 mt-6 h-40">
        <div className="w-16 h-16 bg-gray-200 rounded-2xl"></div>
        <div className="flex-1 space-y-4 py-1">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (medicines.length === 0) return null;

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-6 sm:p-10 mb-8 w-full animate-in fade-in duration-500">
      <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3 tracking-tight">
        <Clock className="w-8 h-8 text-teal-600" />
        Daily Medicine Schedule
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {scheduleBlocks.map((block) => {
          const meds = getMedsByTime(block.keyword);
          const Icon = block.icon;
          
          return (
            <div key={block.title} className={`${block.bg} rounded-3xl p-6 border ${block.color.replace('text-', 'border-').replace('600', '200').replace('500', '200')}`}>
              <div className="flex items-center justify-between mb-6 border-b border-black/5 pb-4">
                <h3 className={`text-xl font-bold ${block.color}`}>{block.title}</h3>
                <Icon className={`w-8 h-8 ${block.color} opacity-80`} />
              </div>

              {meds.length === 0 ? (
                <p className="text-sm font-medium text-gray-400 italic">No medicines scheduled.</p>
              ) : (
                <div className="space-y-4">
                  {meds.map(med => {
                    const taken = hasTakenToday(med);
                    return (
                      <div key={med._id} className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start gap-2">
                           <div>
                             <p className="font-extrabold text-gray-900 leading-tight">{med.name}</p>
                             {med.dosage && <p className="text-sm text-gray-500 font-medium mt-1">{med.dosage}</p>}
                           </div>
                           {taken ? (
                             <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-md flex-shrink-0">
                               Taken
                             </span>
                           ) : (
                             <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2 py-1 rounded-md flex-shrink-0 flex items-center gap-1">
                               <AlertCircle className="w-3 h-3" /> Due
                             </span>
                           )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
