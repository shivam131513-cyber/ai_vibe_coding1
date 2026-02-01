import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Trophy, Award, Star, TrendingUp, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface LeaderboardEntry {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
    reputation_points: number;
    total_reports: number;
    resolved_reports: number;
}

const Leaderboard = () => {
    const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all-time");

    useEffect(() => {
        fetchLeaderboard();
    }, [activeTab]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            // Fetch top users by reputation
            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('id, name, email, avatar_url, reputation_points')
                .order('reputation_points', { ascending: false })
                .limit(50);

            if (usersError) throw usersError;

            // For each user, count their reports
            const leadersWithStats = await Promise.all(
                (usersData || []).map(async (user) => {
                    const { data: reportsData } = await supabase
                        .from('reports')
                        .select('status')
                        .eq('user_id', user.id);

                    const totalReports = reportsData?.length || 0;
                    const resolvedReports = reportsData?.filter(
                        r => r.status === 'resolved' || r.status === 'verified'
                    ).length || 0;

                    return {
                        ...user,
                        total_reports: totalReports,
                        resolved_reports: resolvedReports,
                    };
                })
            );

            setLeaders(leadersWithStats);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
        if (rank === 2) return <Trophy className="h-5 w-5 text-gray-400" />;
        if (rank === 3) return <Trophy className="h-5 w-5 text-amber-700" />;
        return <span className="text-muted-foreground">#{rank}</span>;
    };

    const getUserInitials = (name: string | null, email: string) => {
        if (name) {
            return name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
        }
        return email.charAt(0).toUpperCase();
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 container py-8">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                            <Trophy className="h-8 w-8" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-display font-bold mb-2">Leaderboard</h1>
                    <p className="text-muted-foreground text-lg">
                        Top civic contributors making a difference
                    </p>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
                        <TabsTrigger value="all-time">All-Time</TabsTrigger>
                        <TabsTrigger value="by-city">By City</TabsTrigger>
                        <TabsTrigger value="by-ward">By Ward</TabsTrigger>
                    </TabsList>

                    {/* All-Time Tab */}
                    <TabsContent value="all-time">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Star className="h-5 w-5 text-primary" />
                                    Top Contributors
                                </CardTitle>
                                <CardDescription>
                                    Ranked by reputation points and civic impact
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="py-12 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                        <p className="mt-4 text-muted-foreground">Loading leaderboard...</p>
                                    </div>
                                ) : leaders.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">No contributors yet</p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-16">Rank</TableHead>
                                                <TableHead>User</TableHead>
                                                <TableHead className="text-right">Reports</TableHead>
                                                <TableHead className="text-right">Resolved</TableHead>
                                                <TableHead className="text-right">Points</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {leaders.map((leader, index) => (
                                                <TableRow key={leader.id}>
                                                    <TableCell className="font-medium">
                                                        {getRankIcon(index + 1)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-10 w-10">
                                                                <AvatarImage src={leader.avatar_url || undefined} />
                                                                <AvatarFallback>
                                                                    {getUserInitials(leader.name, leader.email)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-medium">
                                                                    {leader.name || "Anonymous User"}
                                                                </p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {leader.email}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {leader.total_reports}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Badge variant="outline" className="text-emerald">
                                                            {leader.resolved_reports}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold text-primary">
                                                        {leader.reputation_points}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* By City Tab */}
                    <TabsContent value="by-city">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    Top Contributors by City
                                </CardTitle>
                                <CardDescription>
                                    Filter leaderboard by your city
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="py-12 text-center">
                                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">City filtering coming soon</p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* By Ward Tab */}
                    <TabsContent value="by-ward">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                    Top Contributors by Ward
                                </CardTitle>
                                <CardDescription>
                                    See top contributors in your local ward
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="py-12 text-center">
                                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">Ward filtering coming soon</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Badges Section */}
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-primary" />
                            Achievement Badges
                        </CardTitle>
                        <CardDescription>
                            Earn badges by contributing to your community
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { name: "First Report", icon: "🎯", description: "Submit your first report" },
                                { name: "Problem Solver", icon: "✅", description: "Get 5 reports resolved" },
                                { name: "Civic Hero", icon: "🦸", description: "Earn 100 reputation points" },
                                { name: "Community Leader", icon: "👑", description: "Top 10 in your city" },
                            ].map((badge) => (
                                <Card key={badge.name} className="text-center p-4">
                                    <div className="text-4xl mb-2">{badge.icon}</div>
                                    <h4 className="font-semibold mb-1">{badge.name}</h4>
                                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
};

export default Leaderboard;
