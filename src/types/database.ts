export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string;
                    name: string | null;
                    avatar_url: string | null;
                    reputation_points: number;
                    preferred_language: 'en' | 'hi';
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    email: string;
                    name?: string | null;
                    avatar_url?: string | null;
                    reputation_points?: number;
                    preferred_language?: 'en' | 'hi';
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    name?: string | null;
                    avatar_url?: string | null;
                    reputation_points?: number;
                    preferred_language?: 'en' | 'hi';
                    created_at?: string;
                };
            };
            reports: {
                Row: {
                    id: string;
                    ticket_id: string;
                    user_id: string;
                    hazard_type: string;
                    category: 'Water' | 'Roads' | 'Sanitation' | 'Lighting' | 'Safety';
                    severity: 'Critical' | 'High' | 'Medium' | 'Low';
                    urgency_score: number;
                    description: string;
                    location_lat: number;
                    location_lon: number;
                    location_address: string | null;
                    photo_url: string;
                    photo_after_url: string | null;
                    status: 'sent' | 'acknowledged' | 'in_progress' | 'resolved' | 'escalated' | 'verified';
                    assigned_official: string | null;
                    created_at: string;
                    resolved_at: string | null;
                };
                Insert: {
                    id?: string;
                    ticket_id: string;
                    user_id: string;
                    hazard_type: string;
                    category: 'Water' | 'Roads' | 'Sanitation' | 'Lighting' | 'Safety';
                    severity: 'Critical' | 'High' | 'Medium' | 'Low';
                    urgency_score: number;
                    description: string;
                    location_lat: number;
                    location_lon: number;
                    location_address?: string | null;
                    photo_url: string;
                    photo_after_url?: string | null;
                    status?: 'sent' | 'acknowledged' | 'in_progress' | 'resolved' | 'escalated' | 'verified';
                    assigned_official?: string | null;
                    created_at?: string;
                    resolved_at?: string | null;
                };
                Update: {
                    id?: string;
                    ticket_id?: string;
                    user_id?: string;
                    hazard_type?: string;
                    category?: 'Water' | 'Roads' | 'Sanitation' | 'Lighting' | 'Safety';
                    severity?: 'Critical' | 'High' | 'Medium' | 'Low';
                    urgency_score?: number;
                    description?: string;
                    location_lat?: number;
                    location_lon?: number;
                    location_address?: string | null;
                    photo_url?: string;
                    photo_after_url?: string | null;
                    status?: 'sent' | 'acknowledged' | 'in_progress' | 'resolved' | 'escalated' | 'verified';
                    assigned_official?: string | null;
                    created_at?: string;
                    resolved_at?: string | null;
                };
            };
            badges: {
                Row: {
                    id: number;
                    name: string;
                    description: string;
                    icon_url: string | null;
                    points_required: number;
                };
                Insert: {
                    id?: number;
                    name: string;
                    description: string;
                    icon_url?: string | null;
                    points_required: number;
                };
                Update: {
                    id?: number;
                    name?: string;
                    description?: string;
                    icon_url?: string | null;
                    points_required?: number;
                };
            };
            user_badges: {
                Row: {
                    user_id: string;
                    badge_id: number;
                    earned_at: string;
                };
                Insert: {
                    user_id: string;
                    badge_id: number;
                    earned_at?: string;
                };
                Update: {
                    user_id?: string;
                    badge_id?: number;
                    earned_at?: string;
                };
            };
        };
    };
}
