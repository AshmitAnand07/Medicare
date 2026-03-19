"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Users, Package, Heart, Activity } from 'lucide-react';

export default function AdminDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    // Mock data for MVP visuals
    const stats = {
        totalUsers: 145,
        activeNGOs: 12,
        medicinesTracked: 1240,
        donationsCompleted: 85,
    };

    useEffect(() => {
        if (!loading && !user) router.push('/login');
        if (user && user.role !== 'admin') router.push('/dashboard');
    }, [user, loading, router]);

    if (loading || !user) return <div>Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Platform Overview & Analytics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600"><Users size={28} /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Users</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.totalUsers}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-teal-100 flex items-center gap-4">
                    <div className="p-3 bg-teal-50 rounded-lg text-teal-600"><Activity size={28} /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Active NGOs</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.activeNGOs}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600"><Package size={28} /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Medicines Stock</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.medicinesTracked}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-pink-100 flex items-center gap-4">
                    <div className="p-3 bg-pink-50 rounded-lg text-pink-600"><Heart size={28} /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Donations Done</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.donationsCompleted}</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent System Activity</h3>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex items-center justify-between py-3 border-b last:border-0 border-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">U{i}</div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">User registered new medicine</p>
                                    <p className="text-xs text-gray-500">2 hours ago</p>
                                </div>
                            </div>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Log</span>
                        </div>
                    ))}
                </div>
                <p className="mt-4 text-center text-sm text-gray-500">Real-time logs would appear here.</p>
            </div>
        </div>
    );
}
