'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CaretakerDashboard() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000); // Poll for alerts every min
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/alerts');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      } else if (res.status === 401) {
        router.push('/login');
      }
    } catch (err) {
      console.error('Error fetching alerts', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-teal-600 shadow-md p-4 flex justify-between items-center sm:px-8">
        <div className="flex items-center gap-2 text-white font-extrabold text-2xl tracking-tighter cursor-pointer" onClick={() => router.push('/')}>
          <ShieldAlert className="w-8 h-8" />
          <span>NeuraMed <span className="text-teal-200">Caretaker</span></span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-white font-medium hover:text-teal-100">
            My Dashboard
          </Link>
          <button className="bg-white text-teal-700 font-bold px-4 py-2 rounded-full text-sm hover:bg-teal-50">
            Sign Out
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto w-full px-4 py-8 flex-grow">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-800">Caretaker Active Alerts</h1>
            <p className="text-slate-500 font-medium text-lg">Monitor your connected family members.</p>
          </div>
          <button onClick={fetchAlerts} className="flex items-center gap-2 bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold hover:bg-slate-300">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loading && alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[2rem] border border-gray-100 shadow-sm gap-4">
             <RefreshCw className="w-10 h-10 text-teal-500 animate-spin" />
             <p className="text-gray-500 font-bold text-lg">Loading latest alerts...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-gray-200 flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
            <div className="bg-emerald-100 p-6 rounded-full mb-6">
              <CheckCircle2 className="w-16 h-16 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">All Clear!</h2>
            <p className="text-lg font-medium text-slate-500 max-w-md">Your connected patients have taken all their medications on time. No active alerts.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert._id} className="bg-white rounded-2xl p-6 border-l-8 border-rose-500 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in slide-in-from-bottom-4">
                <div className="flex gap-4 items-start">
                  <div className="bg-rose-100 p-3 rounded-xl flex-shrink-0 mt-1">
                    <AlertTriangle className="w-8 h-8 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 leading-tight mb-1">{alert.message}</h3>
                    <div className="flex flex-wrap gap-2 items-center text-sm font-bold text-slate-500">
                      <span className="bg-slate-100 px-3 py-1 rounded-lg">Patient: {alert.patientId?.name || 'Unknown'}</span>
                      <span className="bg-slate-100 px-3 py-1 rounded-lg">Med: {alert.medicineId?.name || 'Unknown'}</span>
                      <span className="flex items-center gap-1 text-rose-500 bg-rose-50 px-3 py-1 rounded-lg">
                        <Clock className="w-4 h-4" /> 
                        {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="whitespace-nowrap bg-slate-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-slate-800 w-full sm:w-auto shadow-sm">
                  Mark as Resolved
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
