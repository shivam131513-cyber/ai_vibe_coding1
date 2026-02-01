import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { MapPin, Filter, AlertTriangle } from "lucide-react";

interface Report {
  id: string;
  ticket_id: string;
  hazard_type: string;
  category: string;
  severity: string;
  status: string;
  location_lat: number;
  location_lon: number;
  location_address: string;
  created_at: string;
  urgency_score: number;
}

const Heatmap = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching reports:', fetchError);
        throw new Error(fetchError.message);
      }

      setReports(data || []);
    } catch (err: any) {
      console.error('Error in fetchReports:', err);
      setError(err.message || 'Failed to load reports');
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const hasLocation = report.location_lat && report.location_lon;
    const severityMatch = selectedSeverity === "all" || report.severity === selectedSeverity;
    const statusMatch = selectedStatus === "all" || report.status === selectedStatus;
    return hasLocation && severityMatch && statusMatch;
  });

  const reportsWithLocation = reports.filter(r => r.location_lat && r.location_lon).length;

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      Critical: "bg-red-500",
      High: "bg-orange-500",
      Moderate: "bg-yellow-500",
      Low: "bg-green-500",
    };
    return colors[severity] || "bg-gray-500";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold mb-2">Hazard Heatmap</h1>
          <p className="text-muted-foreground">
            Visualize reported hazards across your city
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Severity</label>
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Severities</option>
                  <option value="Low">Low</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Statuses</option>
                  <option value="sent">Sent</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Map View</CardTitle>
            <CardDescription>
              {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''} with location data
              {reports.length > 0 && ` (${reportsWithLocation} of ${reports.length} total)`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[600px] flex items-center justify-center bg-muted rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading map...</p>
                </div>
              </div>
            ) : error ? (
              <div className="h-[600px] flex items-center justify-center bg-muted rounded-lg">
                <div className="text-center max-w-md px-4">
                  <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Failed to Load Data</h3>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <Button onClick={fetchReports}>Try Again</Button>
                </div>
              </div>
            ) : (
              <div className="min-h-[600px]">
                {filteredReports.length === 0 ? (
                  <div className="h-[600px] flex items-center justify-center bg-muted/30 rounded-lg">
                    <div className="text-center">
                      <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Reports Found</h3>
                      <p className="text-muted-foreground">
                        No reports with location data match your filters
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredReports.map((report) => (
                      <Card key={report.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <Badge className={`${getSeverityColor(report.severity)} text-white`}>
                              {report.severity}
                            </Badge>
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <CardTitle className="text-base mt-2">{report.hazard_type}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium">Location:</span>
                              <p className="text-muted-foreground">
                                {report.location_address || `${report.location_lat.toFixed(4)}, ${report.location_lon.toFixed(4)}`}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">Status:</span>
                              <Badge variant="outline" className="ml-2">
                                {report.status}
                              </Badge>
                            </div>
                            <div>
                              <span className="font-medium">Ticket:</span>
                              <span className="text-muted-foreground ml-2">{report.ticket_id}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Critical
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {reports.filter(r => r.severity === 'Critical').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                High Priority
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {reports.filter(r => r.severity === 'High').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Resolved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {reports.filter(r => r.status === 'resolved').length}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Heatmap;
