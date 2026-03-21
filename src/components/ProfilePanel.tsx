"use client";

import React, { useState, useEffect } from 'react';
import { X, User, Settings, Users, LogOut, Mail, Phone, Calendar, Shield, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import FamilyMemberCard from './FamilyMemberCard';
import AddFamilyMemberModal from './AddFamilyMemberModal';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function ProfilePanel({ isOpen, onClose }: Props) {
    const { user, logout } = useAuth();
    const [familyMembers, setFamilyMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            fetchFamilyMembers();
        }
    }, [isOpen, user]);

    const fetchFamilyMembers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/family-members');
            if (res.ok) {
                const data = await res.json();
                setFamilyMembers(data);
            }
        } catch (error) {
            console.error("Failed to fetch family members");
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async (formData: any) => {
        try {
            const res = await fetch('/api/family-members', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setShowAddModal(false);
                fetchFamilyMembers();
            }
        } catch (error) {
            console.error("Failed to add family member");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div 
                className="bg-white w-full max-w-2xl h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-500 border-l border-teal-50"
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-6 flex items-center justify-between z-20">
                    <div className="flex items-center gap-4">
                        <div className="bg-teal-600 p-3 rounded-2xl text-white">
                            <User size={24} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900">Family Profile</h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-400 hover:text-gray-900"
                    >
                        <X size={28} />
                    </button>
                </div>

                <div className="p-8 space-y-12">
                    {/* User Info Section */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Your Information</h3>
                            <button className="text-teal-600 font-bold hover:underline flex items-center gap-2">
                                <Settings size={18} /> Edit
                            </button>
                        </div>
                        
                        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                            <div className="h-24 w-24 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 text-3xl font-black shadow-inner border-2 border-white">
                                {user?.name.charAt(0)}
                            </div>
                            <div className="flex-1 space-y-4">
                                <h4 className="text-3xl font-black text-gray-900">{user?.name}</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600 font-bold">
                                        <Mail size={18} className="text-teal-500" />
                                        <span>{user?.email}</span>
                                    </div>
                                    <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600 font-bold">
                                        <Phone size={18} className="text-teal-500" />
                                        <span>{user?.phone || 'Add Phone'}</span>
                                    </div>
                                    <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600 font-bold">
                                        <Shield size={18} className="text-teal-500" />
                                        <span className="capitalize">{user?.role}</span>
                                    </div>
                                    <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600 font-bold">
                                        <Calendar size={18} className="text-teal-500" />
                                        <span>User since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Family Members Section */}
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Family Members</h3>
                                <span className="bg-teal-100 text-teal-700 font-black px-3 py-1 rounded-full text-xs">
                                    {familyMembers.length}
                                </span>
                            </div>
                            <button 
                                onClick={() => setShowAddModal(true)}
                                className="bg-teal-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-teal-700 transition flex items-center gap-2 shadow-lg shadow-teal-50"
                            >
                                <Plus size={20} /> Add Member
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-teal-600 opacity-50">
                                <Loader2 className="animate-spin mb-4" size={48} />
                                <p className="font-bold text-lg">Fetching family profiles...</p>
                            </div>
                        ) : familyMembers.length === 0 ? (
                            <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                <Users className="mx-auto text-gray-300 mb-6" size={64} />
                                <h4 className="text-xl font-black text-gray-900 mb-2">No Family Profiles</h4>
                                <p className="text-gray-500 font-medium max-w-sm mx-auto">
                                    Add your children, parents, or elderly relatives to manage their medicine schedule.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {familyMembers.map((member: any) => (
                                    <FamilyMemberCard key={member._id} member={member} />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Bottom Actions */}
                    <div className="pt-8 border-t border-gray-100">
                        <button 
                            onClick={logout}
                            className="w-full bg-red-50 text-red-600 font-black py-5 rounded-3xl hover:bg-red-100 transition flex items-center justify-center gap-3 text-xl group"
                        >
                            <LogOut size={24} className="group-hover:translate-x-1 transition" />
                            Sign Out Account
                        </button>
                    </div>
                </div>
            </div>

            <AddFamilyMemberModal 
                isOpen={showAddModal} 
                onClose={() => setShowAddModal(false)} 
                onAdd={handleAddMember}
            />
        </div>
    );
}
