import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
    User,
    Mail,
    Globe,
    Bell,
    Moon,
    LogOut,
    Trash2,
    Camera,
    Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Profile = () => {
    const { user, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || "");
    const [profile, setProfile] = useState({
        name: "",
        email: user?.email || "",
        city: "",
        ward: "",
        preferredLanguage: "en",
        emailNotifications: true,
        pushNotifications: false,
    });

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', user?.id)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                // If user doesn't exist in users table, that's okay
                return;
            }

            if (data) {
                setProfile({
                    name: data.name || user?.user_metadata?.full_name || "",
                    email: data.email,
                    city: data.city || "",
                    ward: data.ward || "",
                    preferredLanguage: data.preferred_language || "en",
                    emailNotifications: true,
                    pushNotifications: false,
                });
                if (data.avatar_url) {
                    setAvatarUrl(data.avatar_url);
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB");
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error("Please upload an image file");
            return;
        }

        setUploadingAvatar(true);

        try {
            console.log('Starting avatar upload...');
            console.log('User ID:', user?.id);
            console.log('File:', file.name, file.type, file.size);

            // Check if user is authenticated
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error('You must be logged in to upload an avatar');
            }

            // Upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${user?.id}/avatar.${fileExt}`;

            console.log('Uploading to:', fileName);

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, {
                    upsert: true,
                    contentType: file.type
                });

            if (uploadError) {
                console.error('Upload error:', uploadError);
                throw uploadError;
            }

            console.log('Upload successful:', uploadData);

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            const newAvatarUrl = urlData.publicUrl;
            console.log('Public URL:', newAvatarUrl);

            // Update user profile in database
            const { error: updateError } = await supabase
                .from('users')
                .update({ avatar_url: newAvatarUrl })
                .eq('id', user?.id);

            if (updateError) {
                console.error('Database update error:', updateError);
                // If update fails, it might be because user doesn't exist in users table
                // Try to insert instead
                const { error: insertError } = await supabase
                    .from('users')
                    .insert({
                        id: user?.id,
                        email: user?.email,
                        name: profile.name || user?.email?.split('@')[0],
                        avatar_url: newAvatarUrl
                    });

                if (insertError) {
                    console.error('Insert error:', insertError);
                    throw insertError;
                }
            }

            setAvatarUrl(newAvatarUrl);
            toast.success("Avatar updated successfully!");

            // Reset file input
            e.target.value = '';
        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            toast.error(error.message || "Failed to upload avatar. Check console for details.");
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            // Use upsert to insert if doesn't exist, update if exists
            const { error } = await supabase
                .from('users')
                .upsert({
                    id: user?.id,
                    email: user?.email,
                    name: profile.name,
                    city: profile.city,
                    ward: profile.ward,
                }, {
                    onConflict: 'id'
                });

            if (error) {
                console.error('Error saving profile:', error);
                throw error;
            }

            toast.success('Profile updated successfully!');

            // Reload the page to refresh all components with new data
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } catch (error: any) {
            console.error('Error updating profile:', error);
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            toast.success('Signed out successfully');
            navigate('/');
        } catch (error) {
            toast.error('Failed to sign out');
        }
    };

    const handleDeleteAccount = async () => {
        try {
            // In a real app, you'd call a backend endpoint to handle account deletion
            toast.error('Account deletion is not yet implemented');
        } catch (error) {
            toast.error('Failed to delete account');
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 container max-w-4xl py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-display font-bold mb-2">Profile Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your account settings and preferences
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Profile Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>
                                Update your personal information and profile picture
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Avatar */}
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={avatarUrl} />
                                    <AvatarFallback className="text-2xl">
                                        {profile.name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <input
                                        type="file"
                                        id="avatar-upload"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                        disabled={uploadingAvatar}
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => document.getElementById('avatar-upload')?.click()}
                                        disabled={uploadingAvatar}
                                    >
                                        {uploadingAvatar ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Camera className="h-4 w-4 mr-2" />
                                                Change Avatar
                                            </>
                                        )}
                                    </Button>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        PNG, JPG (MAX. 5MB)
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            {/* Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    <User className="h-4 w-4 inline mr-2" />
                                    Full Name
                                </Label>
                                <Input
                                    id="name"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    placeholder="Enter your full name"
                                />
                            </div>

                            {/* Email (Read-only) */}
                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    <Mail className="h-4 w-4 inline mr-2" />
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    value={profile.email}
                                    disabled
                                    className="bg-muted"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Email cannot be changed
                                </p>
                            </div>

                            {/* Language */}
                            <div className="space-y-2">
                                <Label htmlFor="language">
                                    <Globe className="h-4 w-4 inline mr-2" />
                                    Preferred Language
                                </Label>
                                <select
                                    id="language"
                                    value={profile.preferredLanguage}
                                    onChange={(e) => setProfile({ ...profile, preferredLanguage: e.target.value })}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="en">English</option>
                                    <option value="hi">Hindi (हिंदी)</option>
                                </select>
                            </div>

                            <Button onClick={handleSaveProfile} disabled={loading}>
                                {loading ? "Saving..." : "Save Changes"}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Preferences */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Preferences</CardTitle>
                            <CardDescription>
                                Customize your experience and notification settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Email Notifications */}
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="flex items-center gap-2">
                                        <Bell className="h-4 w-4" />
                                        Email Notifications
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receive updates about your reports via email
                                    </p>
                                </div>
                                <Switch
                                    checked={profile.emailNotifications}
                                    onCheckedChange={(checked) =>
                                        setProfile({ ...profile, emailNotifications: checked })
                                    }
                                />
                            </div>

                            <Separator />

                            {/* Push Notifications */}
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="flex items-center gap-2">
                                        <Bell className="h-4 w-4" />
                                        Push Notifications
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Get instant alerts for important updates
                                    </p>
                                </div>
                                <Switch
                                    checked={profile.pushNotifications}
                                    onCheckedChange={(checked) =>
                                        setProfile({ ...profile, pushNotifications: checked })
                                    }
                                    disabled
                                />
                            </div>

                            <Separator />

                            {/* Dark Mode */}
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="flex items-center gap-2">
                                        <Moon className="h-4 w-4" />
                                        Dark Mode
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Toggle between light and dark themes
                                    </p>
                                </div>
                                <Switch
                                    checked={theme === "dark"}
                                    onCheckedChange={toggleTheme}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Account Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Actions</CardTitle>
                            <CardDescription>
                                Manage your account security and data
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Sign Out */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Sign Out</p>
                                    <p className="text-sm text-muted-foreground">
                                        Sign out of your account on this device
                                    </p>
                                </div>
                                <Button variant="outline" onClick={handleSignOut}>
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Sign Out
                                </Button>
                            </div>

                            <Separator />

                            {/* Delete Account */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-destructive">Delete Account</p>
                                    <p className="text-sm text-muted-foreground">
                                        Permanently delete your account and all data
                                    </p>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive">
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete Account
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete your
                                                account and remove all your data from our servers, including all
                                                your reports and civic contributions.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleDeleteAccount}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                Delete Account
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Profile;
