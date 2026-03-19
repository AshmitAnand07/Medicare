"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user', // Default
        pincode: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role,
                    pincode: formData.pincode,
                    // NGO specific fields
                    address: (formData as any).address,
                    phone: (formData as any).phone,
                    description: (formData as any).description,
                    website: (formData as any).website,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            // Redirect to login
            router.push('/login?registered=true');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const isNgo = formData.role === 'ngo';

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden transition-colors duration-500">
            {/* Background Image with Blur */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center filter blur-lg scale-105"></div>
                <div className="absolute inset-0 bg-teal-900/40 mix-blend-multiply"></div>
            </div>

            {/* Centered Dynamic Card */}
            <div className={`relative z-10 w-full px-4 transition-all duration-700 ease-in-out ${isNgo ? 'max-w-6xl' : 'max-w-md'}`}>
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

                    {/* Card Header (Fixed) */}
                    <div className="px-8 py-6 border-b border-gray-100 bg-white">
                        <div className="text-center">
                            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                Create your account
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Join MediCare AI to help your community
                            </p>
                        </div>
                    </div>

                    {/* Scrollable Form Content */}
                    <div className="px-8 py-6 overflow-y-auto custom-scrollbar">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {error}
                                </div>
                            )}

                            {/* Main Grid: 1 col for user, 3 cols for NGO */}
                            <div className={`grid gap-6 ${isNgo ? 'md:grid-cols-3' : 'grid-cols-1'}`}>

                                {/* Column 1: Account Info */}
                                <div className="space-y-4">
                                    <h3 className={`text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2 ${!isNgo && 'hidden'}`}>Account Info</h3>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name / Org Name</label>
                                        <input suppressHydrationWarning
                                            name="name"
                                            type="text"
                                            required
                                            className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition-shadow"
                                            placeholder={isNgo ? "Organization Name" : "John Doe"}
                                            value={formData.name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                        <input suppressHydrationWarning
                                            name="email"
                                            type="email"
                                            required
                                            className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition-shadow"
                                            placeholder="email@example.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                            <select suppressHydrationWarning
                                                name="role"
                                                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition-shadow bg-white"
                                                value={formData.role}
                                                onChange={handleChange}
                                            >
                                                <option value="user">Household User</option>
                                                <option value="ngo">NGO / Charity</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                                            <input suppressHydrationWarning
                                                name="pincode"
                                                type="text"
                                                required
                                                placeholder="e.g. 110001"
                                                className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition-shadow"
                                                value={formData.pincode}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Columns 2 & 3: Combined Section for NGO Details & Security */}
                                {isNgo && (
                                    <div className="md:col-span-2 space-y-6 animate-fade-in-up">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                            {/* NGO Details (Left Half of Right Section) */}
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-semibold text-teal-600 uppercase tracking-wide mb-2">Organization Details</h3>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                                    <input suppressHydrationWarning
                                                        name="address"
                                                        type="text"
                                                        required
                                                        className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                                        value={(formData as any).address || ''}
                                                        onChange={handleChange}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                                        <input suppressHydrationWarning
                                                            name="phone"
                                                            type="tel"
                                                            required
                                                            className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                                            value={(formData as any).phone || ''}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                                                        <input suppressHydrationWarning
                                                            name="website"
                                                            type="url"
                                                            placeholder="https://"
                                                            className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                                            value={(formData as any).website || ''}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Security (Right Half of Right Section) */}
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Security</h3>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                                    <input suppressHydrationWarning
                                                        name="password"
                                                        type="password"
                                                        required
                                                        className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition-shadow"
                                                        value={formData.password}
                                                        onChange={handleChange}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                                    <input suppressHydrationWarning
                                                        name="confirmPassword"
                                                        type="password"
                                                        required
                                                        className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition-shadow"
                                                        value={formData.confirmPassword}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Mission (Spanning both cols) */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Mission / Description</label>
                                            <textarea suppressHydrationWarning
                                                name="description"
                                                rows={3}
                                                required
                                                className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                                value={(formData as any).description || ''}
                                                onChange={(e: any) => handleChange(e)}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Standard Security Field for Users (Hidden for NGO) */}
                                {!isNgo && (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Security</h3>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                            <input suppressHydrationWarning
                                                name="password"
                                                type="password"
                                                required
                                                className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition-shadow"
                                                value={formData.password}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                            <input suppressHydrationWarning
                                                name="confirmPassword"
                                                type="password"
                                                required
                                                className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition-shadow"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                )}

                            </div>

                            {/* Bottom Section: Verification (Full Width) */}
                            {isNgo && (
                                <div className="mt-6 pt-6 border-t border-dashed border-gray-200 animate-fade-in-up">
                                    <div className="max-w-2xl mx-auto text-center">
                                        <h3 className="text-sm font-semibold text-teal-600 uppercase tracking-wide mb-3">Verification Document</h3>
                                        <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 hover:bg-white transition-colors cursor-pointer group">
                                            <div className="space-y-1 text-center">
                                                <svg className="mx-auto h-10 w-10 text-gray-400 group-hover:text-teal-500 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <div className="text-sm text-gray-600 mt-2">
                                                    <span className="font-medium text-teal-600 hover:text-teal-500">Upload Registration / Certificate</span>
                                                </div>
                                                <p className="text-xs text-gray-400">PDF, PNG up to 10MB</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 border-t border-gray-100">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                                >
                                    {loading ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Card Footer (Fixed) */}
                    <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link href="/login" className="font-medium text-teal-600 hover:text-teal-500 transition-colors">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
