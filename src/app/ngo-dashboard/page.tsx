"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NgoDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (!loading && (!user || user.role !== 'ngo')) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        NGO Dashboard
                    </h1>
                    <span className={`px-4 py-1 rounded-full text-sm font-semibold ${(user as any).isVerified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {(user as any).isVerified ? 'Verified Organization' : 'Verification Pending'}
                    </span>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* NGO Profile Summary */}
                <div className="bg-white overflow-hidden shadow rounded-lg mb-8">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center">
                            <div className="h-16 w-16 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 text-2xl font-bold">
                                {user.name.charAt(0)}
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    {user.name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 border-t border-gray-200 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <span className="text-sm font-medium text-gray-500">Address:</span>
                                <p className="text-sm text-gray-900">{(user as any).address || 'Not provided'}</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-500">Phone:</span>
                                <p className="text-sm text-gray-900">{(user as any).phone || 'Not provided'}</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-500">Website:</span>
                                <p className="text-sm text-blue-600">
                                    {(user as any).website ? (
                                        <a href={(user as any).website} target="_blank" rel="noopener noreferrer">
                                            {(user as any).website}
                                        </a>
                                    ) : 'Not provided'}
                                </p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-500">Description:</span>
                                <p className="text-sm text-gray-900">{(user as any).description || 'No description added'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Tabs */}
                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 'overview' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 'donations' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('donations')}
                    >
                        Available Donations
                    </button>
                    <button
                        className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 'requests' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('requests')}
                    >
                        My Requests
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-500">Overview statistics will appear here.</p>
                    </div>
                )}
                {activeTab === 'donations' && (
                    <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-500">List of available medicine donations will appear here.</p>
                        <button className="mt-4 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700">
                            Browse Medicines
                        </button>
                    </div>
                )}
                {activeTab === 'requests' && (
                    <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-500">Your requested medicines will appear here.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
