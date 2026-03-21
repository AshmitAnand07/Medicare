"use client";

import React, { useState, useEffect } from 'react';
import { X, UserPlus, Heart, Shield, PlusCircle } from 'lucide-react';

interface Caretaker {
    _id: string;
    name: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (data: any) => void;
}

export default function AddFamilyMemberModal({ isOpen, onClose, onAdd }: Props) {
    const [caretakers, setCaretakers] = useState<Caretaker[]>([]);
    const [loadingCaretakers, setLoadingCaretakers] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        relation: '',
        caretakerId: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchCaretakers();
        }
    }, [isOpen]);

    const fetchCaretakers = async () => {
        setLoadingCaretakers(true);
        try {
            const res = await fetch('/api/caretakers');
            if (res.ok) {
                const data = await res.json();
                setCaretakers(data);
            }
        } catch (error) {
            console.error("Failed to fetch caretakers");
        } finally {
            setLoadingCaretakers(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd(formData);
        setFormData({ name: '', age: '', relation: '', caretakerId: '' });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-teal-100 overflow-hidden relative">
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition">
                    <X size={28} />
                </button>

                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-teal-100 p-4 rounded-2xl text-teal-700">
                        <UserPlus size={32} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 leading-tight">Add Family Member</h3>
                        <p className="text-gray-600 font-bold">Register a new profile to track</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-2">Member Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-5 py-4 border-2 border-gray-100 rounded-2xl focus:border-teal-500 focus:ring-0 outline-none transition text-lg bg-gray-50"
                            placeholder="e.g. Grandma Sharma"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-2">Age</label>
                            <input
                                type="number"
                                required
                                min="1"
                                className="w-full px-5 py-4 border-2 border-gray-100 rounded-2xl focus:border-teal-500 focus:ring-0 outline-none transition text-lg bg-gray-50"
                                placeholder="Age"
                                value={formData.age}
                                onChange={e => setFormData({ ...formData, age: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-2">Relation</label>
                            <input
                                type="text"
                                required
                                className="w-full px-5 py-4 border-2 border-gray-100 rounded-2xl focus:border-teal-500 focus:ring-0 outline-none transition text-lg bg-gray-50"
                                placeholder="e.g. Mother"
                                value={formData.relation}
                                onChange={e => setFormData({ ...formData, relation: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-2">Assign Caretaker</label>
                        <select
                            className="w-full px-5 py-4 border-2 border-gray-100 rounded-2xl focus:border-teal-500 focus:ring-0 outline-none transition text-lg bg-gray-50 appearance-none"
                            value={formData.caretakerId}
                            onChange={e => setFormData({ ...formData, caretakerId: e.target.value })}
                        >
                            <option value="">No caretaker (Self Managed)</option>
                            {caretakers.map((c) => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                        </select>
                        {loadingCaretakers && <p className="text-xs text-teal-600 mt-2 font-bold animate-pulse">Loading caretakers...</p>}
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-teal-600 text-white font-black py-5 rounded-2xl hover:bg-teal-700 transition transform active:scale-[0.98] shadow-lg shadow-teal-100 flex items-center justify-center gap-3 text-xl"
                        >
                            <PlusCircle size={24} /> Add Member
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
