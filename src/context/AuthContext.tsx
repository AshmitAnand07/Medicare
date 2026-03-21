"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'patient' | 'caretaker' | 'ngo' | 'admin';
    pincode?: string;
    phone?: string;
    createdAt?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (userData: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Pages that require authentication
const PROTECTED_PATHS = ['/dashboard', '/add-medicine', '/inventory', '/history', '/caretaker'];
// Pages only for guests (logged in users should not see them)
const GUEST_ONLY_PATHS = ['/login', '/register'];

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkUser = async () => {
            try {
                const res = await fetch('/api/auth/me', {
                    credentials: 'include', // Ensure cookies are always sent
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data?.user) {
                        setUser(data.user);
                    } else {
                        setUser(null);
                    }
                } else {
                    setUser(null);
                    // If on a protected page and auth fails, redirect to login
                    if (PROTECTED_PATHS.some(p => pathname?.startsWith(p))) {
                        router.push('/login');
                    }
                }
            } catch (error) {
                console.error("Session check failed", error);
                setUser(null);
                // Redirect to login on network error if on protected page
                if (PROTECTED_PATHS.some(p => pathname?.startsWith(p))) {
                    router.push('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        checkUser();
    }, []);  // eslint-disable-line react-hooks/exhaustive-deps

    const login = (userData: User) => {
        if (!userData) return;
        setUser(userData);

        // Redirect based on role
        if (userData.role === 'ngo') {
            router.push('/ngo-dashboard');
        } else if (userData.role === 'admin') {
            router.push('/admin-dashboard');
        } else {
            router.push('/dashboard');
        }
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { 
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            console.error("Logout failed", error);
        }

        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
