import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
    ArrowLeft,
    MapPin,
    Calendar,
    AlertTriangle,
    Share2,
    Copy,
    CheckCircle2,
    Clock,
    User,
    Image as ImageIcon
} from "lucide-react";
import { format } from "date-fns";

interface Report {
    id: string;
    ticket_id: string;
    user_id: string;
    hazard_type: string;
    category: string;
    severity: string;
    urgency_score: number;
    description: string;
    location_lat: number;
    location_lon: number;
    location_address: string;
    photo_url: string;
    status: string;
    created_at: string;
    updated_at: string;
    users?: {
        name: string;
        email: string;
        avatar_url: string;
    };
}

const ReportDetail = () => {
    const { ticketId } = useParams<{ ticketId: string }>();
    const navigate = useNavigate();
    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReport();
    }, [ticketId]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            console.log('Fetching report with ticket_id:', ticketId);

            const { data, error } = await supabase
                .from('reports')
                .select(`
          *,
          users (
            name,
            email,
            avatar_url
          )
        `)
                .eq('ticket_id', ticketId)
                .single();

            console.log('Query result:', { data, error });

            if (error) {
                console.error('Supabase error details:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                throw error;
            }

            if (!data) {
                console.error('No data returned for ticket_id:', ticketId);
                throw new Error('Report not found');
            }

            console.log('Report loaded successfully:', data);
            setReport(data);
        } catch (error: any) {
            console.error('Error fetching report:', error);
            toast.error(`Failed to load report details: ${error.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        const url = window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `CivicGuard Report: ${report?.ticket_id}`,
                    text: `Check out this hazard report: ${report?.hazard_type}`,
                    url: url,
                });
                toast.success('Shared successfully!');
            } catch (error) {
                // User cancelled share
            }
        } else {
            // Fallback: copy to clipboard
            handleCopyLink();
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
    };

    const getSeverityColor = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'critical':
                return 'bg-red-500';
            case 'high':
                return 'bg-orange-500';
            case 'moderate':
                return 'bg-yellow-500';
            case 'low':
                return 'bg-green-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'resolved':
            case 'verified':
                return 'bg-green-500';
            case 'in_progress':
                return 'bg-blue-500';
            case 'acknowledged':
                return 'bg-yellow-500';
            case 'sent':
                return 'bg-gray-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'resolved':
            case 'verified':
                return <CheckCircle2 className="h-5 w-5" />;
            case 'in_progress':
                return <Clock className="h-5 w-5" />;
            default:
                return <AlertTriangle className="h-5 w-5" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 container max-w-5xl py-8">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-muted rounded w-1/4"></div>
                        <div className="h-64 bg-muted rounded"></div>
                        <div className="h-48 bg-muted rounded"></div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!report) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 container max-w-5xl py-8">
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <AlertTriangle className="h-16 w-16 text-muted-foreground mb-4" />
                            <h2 className="text-2xl font-bold mb-2">Report Not Found</h2>
                            <p className="text-muted-foreground mb-4">
                                The report you're looking for doesn't exist or has been removed.
                            </p>
                            <Button onClick={() => navigate('/dashboard')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Dashboard
                            </Button>
                        </CardContent>
                    </Card>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 container max-w-5xl py-8">
                {/* Header */}
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/dashboard')}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>

                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-display font-bold mb-2">
                                Report Details
                            </h1>
                            <p className="text-muted-foreground">
                                Ticket ID: <span className="font-mono font-semibold">{report.ticket_id}</span>
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleCopyLink}>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Link
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleShare}>
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Report Information */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-2xl">{report.hazard_type}</CardTitle>
                                        <CardDescription className="mt-1">
                                            {report.category}
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Badge className={`${getSeverityColor(report.severity)} text-white`}>
                                            {report.severity}
                                        </Badge>
                                        <Badge className={`${getStatusColor(report.status)} text-white`}>
                                            {getStatusIcon(report.status)}
                                            <span className="ml-1 capitalize">{report.status.replace('_', ' ')}</span>
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2">Description</h3>
                                    <p className="text-muted-foreground">{report.description}</p>
                                </div>

                                <Separator />

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-sm">Location</p>
                                            <p className="text-sm text-muted-foreground">
                                                {report.location_address || 'Location not specified'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-sm">Reported On</p>
                                            <p className="text-sm text-muted-foreground">
                                                {format(new Date(report.created_at), 'PPP')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-sm">Urgency Score</p>
                                            <p className="text-sm text-muted-foreground">
                                                {report.urgency_score}/10
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-sm">Reported By</p>
                                            <p className="text-sm text-muted-foreground">
                                                {report.users?.name || 'Anonymous'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Coordinates Section - Prominent Display */}
                                {report.location_lat && report.location_lon && (
                                    <>
                                        <Separator />
                                        <div className="bg-muted/50 p-4 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-semibold text-sm flex items-center gap-2">
                                                    <MapPin className="h-4 w-4" />
                                                    GPS Coordinates
                                                </h3>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(`${report.location_lat}, ${report.location_lon}`);
                                                        toast.success('Coordinates copied!');
                                                    }}
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">Latitude</p>
                                                    <p className="font-mono text-sm font-semibold">{report.location_lat.toFixed(6)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">Longitude</p>
                                                    <p className="font-mono text-sm font-semibold">{report.location_lon.toFixed(6)}</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full mt-3"
                                                onClick={() => window.open(`https://www.google.com/maps?q=${report.location_lat},${report.location_lon}`, '_blank')}
                                            >
                                                <MapPin className="h-3 w-3 mr-2" />
                                                View on Google Maps
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Photo */}
                        {report.photo_url && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ImageIcon className="h-5 w-5" />
                                        Hazard Photo
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <img
                                        src={report.photo_url}
                                        alt="Hazard"
                                        className="w-full rounded-lg object-cover max-h-96"
                                    />
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Status Timeline</CardTitle>
                                <CardDescription>Track the progress of this report</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Current Status */}
                                    <div className="flex gap-3">
                                        <div className={`h-10 w-10 rounded-full ${getStatusColor(report.status)} flex items-center justify-center text-white`}>
                                            {getStatusIcon(report.status)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold capitalize">
                                                {report.status.replace('_', ' ')}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(report.updated_at), 'PPp')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Created */}
                                    <div className="flex gap-3">
                                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                            <Clock className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold">Report Created</p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(report.created_at), 'PPp')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Map Preview */}
                        {report.location_lat && report.location_lon && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5" />
                                        Location
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                                        <p className="text-sm text-muted-foreground">
                                            Map preview coming soon
                                        </p>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {report.location_lat.toFixed(6)}, {report.location_lon.toFixed(6)}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ReportDetail;
