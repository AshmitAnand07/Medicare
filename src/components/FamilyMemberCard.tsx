import React from 'react';
import { User, Phone, ShieldCheck, Trash2, Edit2, Mail } from 'lucide-react';

interface FamilyMember {
    _id: string;
    name: string;
    age: number;
    relation: string;
    caretakerId?: {
        _id: string;
        name: string;
        email?: string;
        phone?: string;
    };
    caretakerModel?: 'User' | 'FamilyMember';
}

interface Props {
    member: FamilyMember;
    onEdit: (member: FamilyMember) => void;
    onDelete: (id: string) => void;
}

export default function FamilyMemberCard({ member, onEdit, onDelete }: Props) {
    const isCaretakerFamilyMember = member.caretakerModel === 'FamilyMember';

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-teal-200 transition-all group hover:shadow-md h-full flex flex-col">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <div className="bg-teal-50 p-3 rounded-2xl text-teal-600 border border-teal-100 shadow-sm">
                        <User size={24} />
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-gray-900 leading-tight">{member.name}</h4>
                        <p className="text-gray-500 font-bold text-sm tracking-wide uppercase">
                            {member.relation} • {member.age} years
                        </p>
                    </div>
                </div>
                <div className="flex gap-1">
                    <button 
                        onClick={() => onEdit(member)}
                        className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all"
                        title="Edit Profile"
                    >
                        <Edit2 size={20} />
                    </button>
                    <button 
                        onClick={() => onDelete(member._id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Remove Profile"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3 text-gray-400">
                    <ShieldCheck size={16} className={member.caretakerId ? "text-teal-500" : ""} />
                    <span className="text-[10px] font-black uppercase tracking-[0.1em]">Assigned Caretaker</span>
                </div>
                
                {member.caretakerId ? (
                    <div>
                        <p className="font-black text-gray-900 text-lg">
                            {member.caretakerId.name}
                            {isCaretakerFamilyMember && <span className="ml-2 text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">Family</span>}
                        </p>
                        <div className="space-y-1 mt-2">
                            {member.caretakerId.phone && (
                                <div className="flex items-center gap-2 text-gray-500 text-xs font-bold">
                                    <Phone size={12} className="text-teal-400" />
                                    <span>{member.caretakerId.phone}</span>
                                </div>
                            )}
                            {member.caretakerId.email && !isCaretakerFamilyMember && (
                                <div className="flex items-center gap-2 text-gray-500 text-xs font-bold">
                                    <Mail size={12} className="text-teal-400" />
                                    <span>{member.caretakerId.email}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-400 italic text-sm font-bold py-2">No caretaker assigned</p>
                )}
            </div>
        </div>
    );
}
