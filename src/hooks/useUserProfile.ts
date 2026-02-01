import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfile {
    id: string;
    email: string;
    name: string | null;
    avatar_url: string | null;
    city: string | null;
    ward: string | null;
    reputation_points: number;
    total_reports: number;
    resolved_reports: number;
}

export function useUserProfile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        if (!user) {
            setProfile(null);
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                // If user doesn't exist, create a basic profile object
                setProfile({
                    id: user.id,
                    email: user.email || '',
                    name: user.email?.split('@')[0] || 'User',
                    avatar_url: null,
                    city: null,
                    ward: null,
                    reputation_points: 0,
                    total_reports: 0,
                    resolved_reports: 0,
                });
            } else {
                setProfile(data);
            }
        } catch (error) {
            console.error('Error in useUserProfile:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [user]);

    // Refresh function to manually update profile
    const refreshProfile = () => {
        fetchProfile();
    };

    return { profile, loading, refreshProfile };
}
