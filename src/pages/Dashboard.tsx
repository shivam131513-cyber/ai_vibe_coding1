import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
    FileText,
    CheckCircle,
    TrendingUp,
    Bell,
    MapPin,
    Calendar,
    AlertCircle,
    Clock,
    Award,
    Eye
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Report {
    id: string;
    ticket_id: string;
    hazard_type: string;
    category: string;
    severity: string;
    status: string;
    created_at: string;
    urgency_score: number;
}

const Dashboard = () => {
    const { user } = useAuth();
    const { profile } = useUserProfile();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalReports: 0,
        resolved: 0,
        pending: 0,
        reputationPoints: 0,
    });

    useEffect(() => {
        if (user) {
            fetchReports();
            fetchStats();
        }
    }, [user]);

    const fetchReports = async () => {
        try {
            const { data, error } = await supabase
                .from('reports')
                .select('*')
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReports(data || []);
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            // Fetch user stats
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('reputation_points')
                .eq('id', user?.id)
                .single();

            if (userError) throw userError;

            // Calculate stats from reports
            const { data: reportsData, error: reportsError } = await supabase
                .from('reports')
                .select('status')
                .eq('user_id', user?.id);

            if (reportsError) throw reportsError;

            const resolved = reportsData?.filter(r => r.status === 'resolved' || r.status === 'verified').length || 0;
            const pending = reportsData?.filter(r => r.status === 'sent' || r.status === 'acknowledged').length || 0;

            setStats({
                totalReports: reportsData?.length || 0,
                resolved,
                pending,
                reputationPoints: userData?.reputation_points || 0,
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
            sent: { variant: "secondary", label: "Sent" },
            acknowledged: { variant: "default", label: "Acknowledged" },
            in_progress: { variant: "default", label: "In Progress" },
            resolved: { variant: "outline", label: "Resolved" },
            escalated: { variant: "destructive", label: "Escalated" },
            verified: { variant: "outline", label: "Verified" },
        };

        const config = variants[status] || { variant: "secondary" as const, label: status };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const getSeverityColor = (severity: string) => {
        const colors: Record<string, string> = {
            Critical: "text-red-500",
            High: "text-orange-500",
            Medium: "text-yellow-500",
            Low: "text-green-500",
        };
        return colors[severity] || "text-gray-500";
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 container py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={profile?.avatar_url || undefined} />
                            <AvatarFallback className="text-lg">
                                {profile?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-3xl font-display font-bold">
                                Welcome back, {profile?.name || user?.email?.split('@')[0] || "User"}!
                            </h1>
                            <p className="text-muted-foreground">
                                Track your reports and civic impact
                            </p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Reports
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{stats.totalReports}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Resolved
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-emerald">{stats.resolved}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Pending
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-amber">{stats.pending}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Reputation Points
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-primary">{stats.reputationPoints}</div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="reports" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="reports" className="gap-2">
                            <FileText className="h-4 w-4" />
                            My Reports
                        </TabsTrigger>
                        <TabsTrigger value="verifications" className="gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Verifications
                        </TabsTrigger>
                        <TabsTrigger value="impact" className="gap-2">
                            <TrendingUp className="h-4 w-4" />
                            My Impact
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="gap-2">
                            <Bell className="h-4 w-4" />
                            Notifications
                        </TabsTrigger>
                    </TabsList>

                    {/* My Reports Tab */}
                    <TabsContent value="reports" className="space-y-4">
                        {loading ? (
                            <Card>
                                <CardContent className="py-8 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                    <p className="mt-4 text-muted-foreground">Loading reports...</p>
                                </CardContent>
                            </Card>
                        ) : reports.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No reports yet</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Start making a difference by reporting your first hazard
                                    </p>
                                    <Button asChild>
                                        <a href="/report">Report a Hazard</a>
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            reports.map((report) => (
                                <Card key={report.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="flex items-center gap-2">
                                                    {report.hazard_type}
                                                    {getStatusBadge(report.status)}
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-4">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {report.ticket_id}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(report.created_at)}
                                                    </span>
                                                </CardDescription>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-sm font-semibold ${getSeverityColor(report.severity)}`}>
                                                    {report.severity}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Urgency: {report.urgency_score}/10
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <Badge variant="outline">{report.category}</Badge>
                                            <Button variant="ghost" size="sm" asChild>
                                                <a href={`/report/${report.ticket_id}`}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Details
                                                </a>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </TabsContent>

                    {/* Verifications Tab */}
                    <TabsContent value="verifications">
                        <Card>
                            <CardHeader>
                                <CardTitle>Verification Requests</CardTitle>
                                <CardDescription>
                                    Verify that reported issues have been resolved
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="py-8 text-center">
                                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">No pending verifications</p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* My Impact Tab */}
                    <TabsContent value="impact" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Civic Impact</CardTitle>
                                <CardDescription>
                                    See how you're making a difference in your community
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm font-medium">Reputation Progress</span>
                                        <span className="text-sm text-muted-foreground">
                                            {stats.reputationPoints} / 1000 points
                                        </span>
                                    </div>
                                    <Progress value={(stats.reputationPoints / 1000) * 100} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <FileText className="h-4 w-4" />
                                            <span className="text-sm">Hazards Reported</span>
                                        </div>
                                        <p className="text-2xl font-bold">{stats.totalReports}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <CheckCircle className="h-4 w-4" />
                                            <span className="text-sm">Verified Fixes</span>
                                        </div>
                                        <p className="text-2xl font-bold">{stats.resolved}</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <Award className="h-5 w-5 text-primary" />
                                        Badges Earned
                                    </h4>
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>No badges earned yet</p>
                                        <p className="text-sm">Keep reporting to unlock achievements!</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Notifications Tab */}
                    <TabsContent value="notifications">
                        <Card>
                            <CardHeader>
                                <CardTitle>Notifications</CardTitle>
                                <CardDescription>
                                    Stay updated on your reports and community activity
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="py-8 text-center">
                                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">No new notifications</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
            <Footer />
        </div>
    );
};

export default Dashboard;
