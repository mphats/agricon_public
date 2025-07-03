
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, Phone, MapPin, Sprout, Save, Mail, MessageCircle } from 'lucide-react';
import { MobileNav } from '@/components/MobileNav';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type CropType = Database['public']['Enums']['crop_type'];

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [district, setDistrict] = useState('');
  const [farmSize, setFarmSize] = useState('');
  const [primaryCrops, setPrimaryCrops] = useState<CropType[]>([]);

  // Fetch user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      console.log('Fetching profile for user:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Profile fetch error:', error);
        throw error;
      }
      
      console.log('Profile data:', data);
      return data;
    },
    enabled: !!user?.id,
  });

  // Load profile data into form
  useEffect(() => {
    if (profile) {
      console.log('Loading profile data into form:', profile);
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setPhoneNumber(profile.phone_number || '');
      setDistrict(profile.location_district || '');
      setFarmSize(profile.farm_size_acres?.toString() || '');
      setPrimaryCrops(profile.primary_crops || []);
    }
  }, [profile]);

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (data: {
      first_name: string;
      last_name: string;
      phone_number: string;
      location_district: string;
      farm_size_acres: number | null;
      primary_crops: CropType[];
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('Updating profile with data:', data);

      const { data: result, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: data.first_name,
          last_name: data.last_name,
          phone_number: data.phone_number,
          location_district: data.location_district,
          farm_size_acres: data.farm_size_acres,
          primary_crops: data.primary_crops,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        throw error;
      }
      
      console.log('Profile updated successfully:', result);
      return result;
    },
    onSuccess: () => {
      console.log('Profile update mutation successful');
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: any) => {
      console.error('Profile update mutation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started');
    console.log('Current form values:', {
      firstName,
      lastName,
      phoneNumber,
      district,
      farmSize,
      primaryCrops
    });
    
    // Basic validation
    if (!firstName.trim() || !lastName.trim()) {
      console.log('Validation failed: missing first or last name');
      toast({
        title: "Validation Error",
        description: "First name and last name are required.",
        variant: "destructive",
      });
      return;
    }

    const updateData = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone_number: phoneNumber.trim(),
      location_district: district,
      farm_size_acres: farmSize ? parseFloat(farmSize) : null,
      primary_crops: primaryCrops,
    };
    
    console.log('Submitting update with:', updateData);
    updateProfile.mutate(updateData);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleContactSupport = () => {
    // Create a support inquiry
    const subject = "Support Request";
    const body = `Hello AgriCon Support Team,

I need assistance with:
[Please describe your issue here]

User Details:
- Name: ${firstName} ${lastName}
- Email: ${user?.email}
- District: ${district}

Thank you for your help.`;

    // Open email client
    window.location.href = `mailto:support@agricon.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleHelpCenter = () => {
    // Navigate to help center (you can replace this with actual help content)
    toast({
      title: "Help Center",
      description: "Opening help documentation...",
    });
    
    // For now, show a simple help dialog with common topics
    const helpTopics = [
      "How to update market prices",
      "Using AI diagnostics for crop diseases",
      "Setting up weather alerts",
      "Participating in community forums",
      "Managing your farm profile"
    ];
    
    toast({
      title: "Common Help Topics",
      description: helpTopics.join(", "),
    });
  };

  const cropOptions: CropType[] = [
    'maize', 'beans', 'vegetables', 'cassava', 'rice', 
    'tobacco', 'groundnuts', 'soybean', 'cotton'
  ];

  const handleCropToggle = (crop: CropType) => {
    setPrimaryCrops(prev => 
      prev.includes(crop)
        ? prev.filter(c => c !== crop)
        : [...prev, crop]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="h-6 w-6 text-green-600 mr-2" />
              <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Your basic account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <Input
                value={user?.email || ''}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed. Contact support if needed.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal and farming details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter your first name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter your last name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Phone Number
                </label>
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  type="tel"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  District
                </label>
                <Select value={district} onValueChange={setDistrict}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your district" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lilongwe">Lilongwe</SelectItem>
                    <SelectItem value="Blantyre">Blantyre</SelectItem>
                    <SelectItem value="Mzuzu">Mzuzu</SelectItem>
                    <SelectItem value="Zomba">Zomba</SelectItem>
                    <SelectItem value="Kasungu">Kasungu</SelectItem>
                    <SelectItem value="Mangochi">Mangochi</SelectItem>
                    <SelectItem value="Salima">Salima</SelectItem>
                    <SelectItem value="Machinga">Machinga</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Farm Size (Acres)
                </label>
                <Input
                  value={farmSize}
                  onChange={(e) => setFarmSize(e.target.value)}
                  placeholder="Enter farm size in acres"
                  type="number"
                  step="0.1"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Sprout className="h-4 w-4 inline mr-1" />
                  Primary Crops
                </label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {cropOptions.map((crop) => (
                    <div key={crop} className="flex items-center space-x-2">
                      <Checkbox
                        id={crop}
                        checked={primaryCrops.includes(crop)}
                        onCheckedChange={() => handleCropToggle(crop)}
                      />
                      <label
                        htmlFor={crop}
                        className="text-sm capitalize cursor-pointer"
                      >
                        {crop}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* App Settings */}
        <Card>
          <CardHeader>
            <CardTitle>App Settings</CardTitle>
            <CardDescription>
              Customize your app experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">SMS Notifications</h4>
                <p className="text-sm text-gray-600">Receive important alerts via SMS</p>
              </div>
              <Checkbox defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Weather Alerts</h4>
                <p className="text-sm text-gray-600">Get notified about weather changes</p>
              </div>
              <Checkbox defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Market Price Updates</h4>
                <p className="text-sm text-gray-600">Receive market price notifications</p>
              </div>
              <Checkbox defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Support & Help */}
        <Card>
          <CardHeader>
            <CardTitle>Support & Help</CardTitle>
            <CardDescription>
              Get assistance and find answers to your questions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleHelpCenter}
            >
              <Settings className="h-4 w-4 mr-2" />
              Help Center
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleContactSupport}
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/forum')}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Community Forum
            </Button>
            <div className="text-center pt-4 text-sm text-gray-500">
              AgriCon - Version 1.0.0
            </div>
          </CardContent>
        </Card>
      </div>

      <MobileNav />
    </div>
  );
};

export default Profile;
