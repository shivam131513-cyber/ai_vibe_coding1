import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Camera, MapPin, FileText, Send, CheckCircle, Upload, X, Loader2, Copy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const steps = [
  { id: 1, title: "Capture", icon: Camera, description: "Take a photo of the hazard" },
  { id: 2, title: "Location", icon: MapPin, description: "Confirm the location" },
  { id: 3, title: "Details", icon: FileText, description: "Describe the issue" },
  { id: 4, title: "Submit", icon: Send, description: "Review and submit" },
];

const hazardTypes = [
  "Pothole",
  "Broken Sidewalk",
  "Street Light Out",
  "Flooding",
  "Debris",
  "Traffic Sign Damage",
  "Other",
];

const categories = ["Roads", "Water", "Sanitation", "Lighting", "Safety"];

export default function ReportHazard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [formData, setFormData] = useState({
    photo: null as File | null,
    photoPreview: "",
    location: "",
    latitude: 0,
    longitude: 0,
    hazardType: "",
    category: "Roads",
    description: "",
    severity: "Medium",
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setFormData({
        ...formData,
        photo: file,
        photoPreview: URL.createObjectURL(file),
      });
    }
  };

  const removePhoto = () => {
    setFormData({
      ...formData,
      photo: null,
      photoPreview: "",
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          toast.success("Location captured");
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Could not get location. Please enter manually.");
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  const generateTicketId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `CG-${timestamp}-${random}`;
  };

  const uploadPhoto = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('hazard-photos')
      .upload(fileName, file);

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('hazard-photos')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const calculateUrgencyScore = () => {
    let score = 5; // Base score

    // Severity impact
    if (formData.severity === "Critical") score += 4;
    else if (formData.severity === "High") score += 3;
    else if (formData.severity === "Medium") score += 1;

    // Category impact
    if (formData.category === "Safety") score += 2;
    else if (formData.category === "Water") score += 1;

    return Math.min(score, 10); // Cap at 10
  };

  const nextStep = () => {
    // Validation
    if (currentStep === 1 && !formData.photo) {
      toast.error("Please upload a photo");
      return;
    }
    if (currentStep === 2 && !formData.location) {
      toast.error("Please enter a location");
      return;
    }
    if (currentStep === 3 && !formData.hazardType) {
      toast.error("Please select a hazard type");
      return;
    }

    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to submit a report");
      navigate("/login");
      return;
    }

    if (!formData.photo) {
      toast.error("Photo is required");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Upload photo
      console.log('Step 1: Starting photo upload...');
      toast.loading("Uploading photo...");
      const photoUrl = await uploadPhoto(formData.photo);
      console.log('Photo uploaded successfully:', photoUrl);

      // 2. Generate ticket ID
      console.log('Step 2: Generating ticket ID...');
      const newTicketId = generateTicketId();
      setTicketId(newTicketId);
      console.log('Ticket ID generated:', newTicketId);

      // 3. Calculate urgency score
      console.log('Step 3: Calculating urgency score...');
      const urgencyScore = calculateUrgencyScore();
      console.log('Urgency score:', urgencyScore);

      // 4. Create report in database
      console.log('Step 4: Inserting report into database...');
      toast.loading("Submitting report...");

      const reportData = {
        ticket_id: newTicketId,
        user_id: user.id,
        hazard_type: formData.hazardType,
        category: formData.category,
        severity: formData.severity,
        urgency_score: urgencyScore,
        description: formData.description,
        location_lat: formData.latitude || null,
        location_lon: formData.longitude || null,
        location_address: formData.location,
        photo_url: photoUrl,
        status: 'sent',
      };

      console.log('Report data to insert:', reportData);

      const { data, error } = await supabase
        .from('reports')
        .insert(reportData)
        .select();

      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }

      console.log('Report inserted successfully:', data);

      toast.dismiss();
      toast.success("Report submitted successfully!");
      setCurrentStep(5); // Success state
    } catch (error: any) {
      console.error("Error submitting report:", error);
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      toast.dismiss();
      toast.error(`Failed to submit report: ${error.message || 'Please try again.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              <span className="gradient-text">Report a Hazard</span>
            </h1>
            <p className="text-muted-foreground">
              Help make your community safer by reporting urban hazards
            </p>
          </div>

          {/* Progress Steps */}
          {currentStep <= 4 && (
            <div className="flex justify-between mb-8 relative">
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-border -z-10" />
              <div
                className="absolute top-5 left-0 h-0.5 bg-primary -z-10 transition-all duration-300"
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              />
              {steps.map((step) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${step.id <= currentStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                      }`}
                  >
                    {step.id < currentStep ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${step.id <= currentStep ? "text-foreground" : "text-muted-foreground"
                    }`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Step Content */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>
                {currentStep === 1 && "Capture the Hazard"}
                {currentStep === 2 && "Confirm Location"}
                {currentStep === 3 && "Describe the Issue"}
                {currentStep === 4 && "Review & Submit"}
                {currentStep === 5 && "Report Submitted!"}
              </CardTitle>
              <CardDescription>
                {currentStep === 1 && "Take or upload a photo of the hazard"}
                {currentStep === 2 && "Verify the location of the hazard"}
                {currentStep === 3 && "Provide details about the hazard"}
                {currentStep === 4 && "Review your report before submitting"}
                {currentStep === 5 && "Thank you for helping improve your community"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Step 1: Photo Upload */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  {formData.photoPreview ? (
                    <div className="relative">
                      <img
                        src={formData.photoPreview}
                        alt="Hazard preview"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={removePhoto}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG or HEIC (MAX. 10MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                      />
                    </label>
                  )}
                </div>
              )}

              {/* Step 2: Location */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <MapPin className="h-12 w-12 mx-auto mb-2" />
                      <p>Map integration coming soon</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={getCurrentLocation}
                      >
                        Get Current Location
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Address or Location Description *</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Corner of Main St and 5th Ave"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                    {formData.latitude !== 0 && (
                      <p className="text-xs text-muted-foreground">
                        Coordinates: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Details */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Hazard Type *</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {hazardTypes.map((type) => (
                        <Button
                          key={type}
                          variant={formData.hazardType === type ? "default" : "outline"}
                          className="justify-start"
                          onClick={() => setFormData({ ...formData, hazardType: type })}
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {categories.map((cat) => (
                        <Button
                          key={cat}
                          variant={formData.category === cat ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFormData({ ...formData, category: cat })}
                        >
                          {cat}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the hazard in detail..."
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Severity *</Label>
                    <div className="flex gap-2">
                      {["Low", "Medium", "High", "Critical"].map((level) => (
                        <Button
                          key={level}
                          variant={formData.severity === level ? "default" : "outline"}
                          className="flex-1 capitalize"
                          onClick={() => setFormData({ ...formData, severity: level })}
                        >
                          {level}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  {formData.photoPreview && (
                    <img
                      src={formData.photoPreview}
                      alt="Hazard"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Location</span>
                      <span className="font-medium">{formData.location || "Not specified"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Hazard Type</span>
                      <span className="font-medium">{formData.hazardType || "Not specified"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Category</span>
                      <span className="font-medium">{formData.category}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Severity</span>
                      <span className="font-medium capitalize">{formData.severity}</span>
                    </div>

                    {/* GPS Coordinates Section */}
                    {(formData.latitude !== 0 || formData.longitude !== 0) && (
                      <div className="py-3 border-b">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            GPS Coordinates
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(`${formData.latitude}, ${formData.longitude}`);
                              toast.success('Coordinates copied!');
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-md">
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Latitude</p>
                              <p className="font-mono font-semibold">{formData.latitude.toFixed(6)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Longitude</p>
                              <p className="font-mono font-semibold">{formData.longitude.toFixed(6)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {formData.description && (
                      <div className="py-2">
                        <span className="text-muted-foreground">Description</span>
                        <p className="mt-1 font-medium">{formData.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 5: Success */}
              {currentStep === 5 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-emerald" />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2">Report Submitted Successfully!</h3>
                  <p className="text-muted-foreground mb-2">
                    Your report has been submitted. You'll receive updates on its status.
                  </p>
                  <div className="bg-muted p-4 rounded-lg mb-6 inline-block">
                    <p className="text-sm text-muted-foreground mb-1">Your Ticket ID</p>
                    <p className="text-2xl font-bold font-mono text-primary">{ticketId}</p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={() => navigate("/dashboard")}>
                      View Dashboard
                    </Button>
                    <Button onClick={() => {
                      setCurrentStep(1);
                      setFormData({
                        photo: null,
                        photoPreview: "",
                        location: "",
                        latitude: 0,
                        longitude: 0,
                        hazardType: "",
                        category: "Roads",
                        description: "",
                        severity: "Medium",
                      });
                    }}>
                      Report Another Hazard
                    </Button>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              {currentStep <= 4 && (
                <div className="flex justify-between mt-6 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1 || submitting}
                  >
                    Previous
                  </Button>
                  {currentStep < 4 ? (
                    <Button onClick={nextStep} disabled={submitting}>
                      Continue
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} className="gap-2" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Submit Report
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
