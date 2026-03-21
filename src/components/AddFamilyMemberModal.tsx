"use client";

import React, { useState, useEffect } from 'react';
import { X, UserPlus, Heart, Shield, PlusCircle, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface CaretakerOption {
    _id: string;
    name: string;
    model: 'User' | 'FamilyMember';
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (data: any) => void;
    onUpdate?: (id: string, data: any) => void;
    editingMember?: any;
    otherFamilyMembers?: any[];
}

export default function AddFamilyMemberModal({ isOpen, onClose, onAdd, onUpdate, editingMember, otherFamilyMembers = [] }: Props) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        relation: '',
        caretakerId: '',
        caretakerModel: 'User' as 'User' | 'FamilyMember'
    });

    useEffect(() => {
        if (editingMember) {
            setFormData({
                name: editingMember.name,
                age: editingMember.age.toString(),
                relation: editingMember.relation,
                caretakerId: editingMember.caretakerId?._id || '',
                caretakerModel: editingMember.caretakerModel || 'User'
            });
        } else {
            setFormData({
                name: '',
                age: '',
                relation: '',
                caretakerId: '',
                caretakerModel: 'User'
            });
        }
    }, [editingMember, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        if (editingMember && onUpdate) {
            await onUpdate(editingMember._id, formData);
        } else {
            await onAdd(formData);
        }
        setLoading(false);
        onClose();
    };

    // Construct caretaker options
    const caretakerOptions: CaretakerOption[] = [];
    
    // 1. Add current user
    if (user) {
        caretakerOptions.push({ _id: user.id, name: `${user.name} (Me)`, model: 'User' });
    }

    // 2. Add other family members (prevent self-selection)
    otherFamilyMembers.forEach(m => {
        if (m._id !== editingMember?._id) {
            caretakerOptions.push({ _id: m._id, name: m.name, model: 'FamilyMember' });
        }
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-md w-full border border-teal-100 overflow-hidden relative animate-in zoom-in-95 duration-300">
                <button 
                    onClick={onClose} 
                    className="absolute top-6 right-6 text-gray-300 hover:text-gray-900 transition p-2 hover:bg-gray-100 rounded-xl"
                >
                    <X size={24} />
                </button>

                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-teal-600 p-4 rounded-2xl text-white shadow-lg shadow-teal-100">
                        <UserPlus size={28} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 leading-tight">
                            {editingMember ? 'Edit Profile' : 'Add Family Member'}
                        </h3>
                        <p className="text-gray-500 font-bold text-sm">
                            {editingMember ? 'Update details for your relative' : 'Register a new profile to track'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Member Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-6 py-4 border-2 border-gray-50 rounded-2xl focus:border-teal-500 focus:ring-0 outline-none transition text-lg bg-gray-50 font-bold placeholder:text-gray-300"
                            placeholder="e.g. Grandma Sharma"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Age</label>
                            <input
                                type="number"
                                required
                                min="1"
                                className="w-full px-6 py-4 border-2 border-gray-50 rounded-2xl focus:border-teal-500 focus:ring-0 outline-none transition text-lg bg-gray-50 font-bold"
                                placeholder="Age"
                                value={formData.age}
                                onChange={e => setFormData({ ...formData, age: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Relation</label>
                            <input
                                type="text"
                                required
                                className="w-full px-6 py-4 border-2 border-gray-50 rounded-2xl focus:border-teal-500 focus:ring-0 outline-none transition text-lg bg-gray-50 font-bold placeholder:text-gray-300"
                                placeholder="e.g. Mother"
                                value={formData.relation}
                                onChange={e => setFormData({ ...formData, relation: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-1 text-teal-600">Assign Caretaker</label>
                        <div className="relative">
                            <select
                                className="w-full px-6 py-4 border-2 border-teal-50 rounded-2xl focus:border-teal-500 focus:ring-0 outline-none transition text-lg bg-teal-50/30 font-bold appearance-none cursor-pointer"
                                value={`${formData.caretakerId}|${formData.caretakerModel}`}
                                onChange={e => {
                                    const [id, model] = e.target.value.split('|');
                                    setFormData({ ...formData, caretakerId: id, caretakerModel: model as any });
                                }}
                            >
                                <option value="|User">No caretaker assigned</option>
                                {caretakerOptions.map((opt) => (
                                    <option key={`${opt._id}|${opt.model}`} value={`${opt._id}|${opt.model}`}>
                                        {opt.name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-teal-600">
                                <Shield size={20} />
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold ml-1 italic">
                            Caretakers will receive alerts if doses are missed.
                        </p>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-teal-600 text-white font-black py-5 rounded-2xl hover:bg-teal-700 transition transform active:scale-[0.98] shadow-xl shadow-teal-100 flex items-center justify-center gap-3 text-xl disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : editingMember ? <Save size={24} /> : <PlusCircle size={24} />}
                            {editingMember ? 'Update Profile' : 'Add Member'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
