import React from 'react';
import { User, Phone, ShieldCheck, Trash2 } from 'lucide-react';

interface FamilyMember {
    _id: string;
    name: string;
    age: number;
    relation: string;
    caretakerId?: {
        _id: string;
        name: string;
        email: string;
        phone: string;
    };
}

interface Props {
    member: FamilyMember;
    onDelete?: (id: string) => void;
}

export default function FamilyMemberCard({ member, onDelete }: Props) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-teal-100 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                    <div className="bg-teal-100 p-3 rounded-xl text-teal-700">
                        <User size={24} />
                    </div>
                    <div>
                        <h4 className="text-xl font-bold text-gray-900">{member.name}</h4>
                        <p className="text-gray-500 font-medium">{member.relation} • {member.age} years old</p>
                    </div>
                </div>
                {onDelete && (
                    <button 
                        onClick={() => onDelete(member._id)}
                        className="text-gray-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition"
                    >
                        <Trash2 size={20} />
                    </button>
                )}
            </div>

            <div className="bg-teal-50/50 rounded-xl p-4 border border-teal-50">
                <div className="flex items-center gap-2 mb-2 text-teal-800">
                    <ShieldCheck size={18} />
                    <span className="text-sm font-bold uppercase tracking-wider">Assigned Caretaker</span>
                </div>
                
                {member.caretakerId ? (
                    <div>
                        <p className="font-bold text-gray-800 text-lg">{member.caretakerId.name}</p>
                        <div className="flex items-center gap-2 mt-1 text-gray-600">
                            <Phone size={14} />
                            <span className="text-sm font-medium">{member.caretakerId.phone || 'No phone number'}</span>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500 italic text-sm font-medium">No caretaker assigned</p>
                )}
            </div>
        </div>
    );
}
