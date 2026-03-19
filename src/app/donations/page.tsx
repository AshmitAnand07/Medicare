"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Calendar, MapPin, Phone, Trash2, XCircle } from 'lucide-react';

export default function DonationHistory() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [donationToCancel, setDonationToCancel] = useState<any>(null);
    const [isCancelling, setIsCancelling] = useState(false);

    const confirmCancel = async () => {
        if (!donationToCancel) return;
        setIsCancelling(true);
        try {
            const res = await fetch(`/api/donations?id=${donationToCancel._id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setDonations(prev => prev.filter((d: any) => d._id !== donationToCancel._id));
                setCancelModalOpen(false);
                setDonationToCancel(null);
            } else {
                alert("Failed to cancel donation.");
            }
        } catch (e) {
            alert("Error cancelling donation.");
        } finally {
            setIsCancelling(false);
        }
    };

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            fetch('/api/donations')
                .then(res => res.json())
                .then(data => {
                    setDonations(data);
                    setLoading(false);
                })
                .catch(err => setLoading(false));
        }
    }, [authLoading, user, router]);

    if (authLoading || (loading && user)) return <div className="p-8 text-center text-teal-600">Loading Donation History...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <Link href="/dashboard" className="flex items-center text-teal-600 font-medium mb-4 hover:underline">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Your Donation History 🎁</h1>
                    <p className="text-gray-600 mt-1">Track all your contributions and their status.</p>
                </div>

                {donations.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-xl shadow-sm">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-900">No donations yet</h3>
                        <p className="text-gray-500 mt-2">Start donating your unused medicines to save lives!</p>
                        <Link href="/dashboard" className="mt-6 inline-block bg-teal-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-teal-700 transition">
                            Go to Dashboard
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Medicine</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Donated To (NGO)</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Scheduled Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {donations.map((donation: any) => (
                                    <tr key={donation._id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{donation.medicineId?.name || "Unknown Medicine"}</div>
                                            <div className="text-xs text-gray-500">
                                                Qty: {typeof donation.quantityStrips === 'number' ? donation.quantityStrips : (donation.medicineId?.quantityStrips || 0)} Strips, {typeof donation.quantityTablets === 'number' ? donation.quantityTablets : (donation.medicineId?.quantityTablets || 0)} Tabs
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <MapPin className="w-4 h-4 text-teal-500 mr-2" />
                                                <span className="font-medium text-gray-800">{donation.ngoName || "Pending Match"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">
                                            {donation.pickupDate ? (
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">{new Date(donation.pickupDate).toLocaleDateString()}</span>
                                                    <span className="text-xs text-gray-400">Request: {new Date(donation.requestedAt).toLocaleDateString()}</span>
                                                </div>
                                            ) : (
                                                new Date(donation.requestedAt).toLocaleDateString()
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${donation.status === 'collected' ? 'bg-green-100 text-green-700' :
                                                    donation.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {donation.status.toUpperCase()}
                                                </span>
                                                {donation.status === 'pending' && (
                                                    <button 
                                                        onClick={() => { setDonationToCancel(donation); setCancelModalOpen(true); }}
                                                        className="text-red-400 hover:text-red-600 transition"
                                                        title="Cancel Schedule"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Cancel Confirmation Modal */}
            {cancelModalOpen && donationToCancel && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 scale-animation hidden-on-mount">
                            <Trash2 className="w-8 h-8 text-red-600 animate-pulse" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Donation?</h3>
                        <p className="text-gray-500 mb-6 line-clamp-2">
                            Are you sure you want to cancel the donation for <span className="font-semibold text-gray-800">{donationToCancel.medicineId?.name}</span>?
                        </p>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setCancelModalOpen(false)} 
                                disabled={isCancelling}
                                className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition"
                            >
                                No
                            </button>
                            <button 
                                onClick={confirmCancel} 
                                disabled={isCancelling}
                                className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition flex justify-center items-center shadow-md transform hover:-translate-y-0.5"
                            >
                                {isCancelling ? 'Processing...' : 'Yes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
