import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { useEffect, useState } from "react";
import { TrendingUp, Cloud, Phone, Wifi, Users, Sprout } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading, profile } = useAuth();
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    console.log('Index page mounted');
    console.log('Auth loading:', loading);
    console.log('User:', user?.email || 'No user');
    console.log('Profile:', profile);
    
    setDebugInfo(`Loading: ${loading}, User: ${user ? 'authenticated' : 'not authenticated'}, Profile: ${profile ? 'loaded' : 'not loaded'}`);
    
    // Only redirect if we're not loading and we have a user and profile
    if (!loading && user && profile) {
      console.log('User authenticated with profile, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [user, loading, profile, navigate]);

  // Show loading spinner while authentication is being determined
  if (loading || (user && !profile)) {
    console.log('Showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading AgriCon...</p>
          <p className="text-xs text-muted-foreground mt-2">{debugInfo}</p>
        </div>
      </div>
    );
  }

  console.log('Rendering Index page content for:', user?.email || 'anonymous user');

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with fallback color */}
      <div 
        className="absolute inset-0 bg-green-800 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2532&auto=format&fit=crop&ixlib=rb-4.0.3')`,
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/lovable-uploads/75c8c960-b4e4-4750-b49d-5d32598a32f0.png" 
              alt="AgriCon Logo" 
              className="h-16 w-16 mr-4 drop-shadow-lg"
            />
            <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
              AgriCon
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto drop-shadow-md">
            AI-powered farming platform for Malawi's smallholder farmers
          </p>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto drop-shadow-md">
            Boost productivity, reduce losses, and connect directly to markets with real-time insights and expert guidance
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/auth')} 
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 shadow-lg"
            >
              Get Started
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/auth')}
              className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-3 shadow-lg"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="backdrop-blur-md bg-white/10 border-white/20 hover:bg-white/20 transition-all duration-300 shadow-xl">
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-green-400 mb-2" />
              <CardTitle className="text-white">Market Access</CardTitle>
              <CardDescription className="text-white/80">
                Real-time market prices and direct buyer connections for better income
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-white/70 space-y-1">
                <li>• Live market price updates</li>
                <li>• Direct buyer marketplace</li>
                <li>• Input supplier connections</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-white/10 border-white/20 hover:bg-white/20 transition-all duration-300 shadow-xl">
            <CardHeader>
              <Sprout className="h-8 w-8 text-blue-400 mb-2" />
              <CardTitle className="text-white">AI Diagnostics</CardTitle>
              <CardDescription className="text-white/80">
                Advanced pest detection and crop health analysis using AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-white/70 space-y-1">
                <li>• Photo-based pest identification</li>
                <li>• Soil health recommendations</li>
                <li>• Personalized farming advice</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-white/10 border-white/20 hover:bg-white/20 transition-all duration-300 shadow-xl">
            <CardHeader>
              <Cloud className="h-8 w-8 text-orange-400 mb-2" />
              <CardTitle className="text-white">Weather Alerts</CardTitle>
              <CardDescription className="text-white/80">
                Hyper-local weather forecasts and climate resilience tips
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-white/70 space-y-1">
                <li>• Hourly weather forecasts</li>
                <li>• Extreme weather alerts</li>
                <li>• Climate-smart farming tips</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-white/10 border-white/20 hover:bg-white/20 transition-all duration-300 shadow-xl">
            <CardHeader>
              <Users className="h-8 w-8 text-purple-400 mb-2" />
              <CardTitle className="text-white">Community Forum</CardTitle>
              <CardDescription className="text-white/80">
                Connect with fellow farmers and agricultural experts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-white/70 space-y-1">
                <li>• Q&A with experts</li>
                <li>• Peer-to-peer learning</li>
                <li>• Educational content</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-white/10 border-white/20 hover:bg-white/20 transition-all duration-300 shadow-xl">
            <CardHeader>
              <Wifi className="h-8 w-8 text-red-400 mb-2" />
              <CardTitle className="text-white">Offline Access</CardTitle>
              <CardDescription className="text-white/80">
                Critical features work even without internet connection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-white/70 space-y-1">
                <li>• Cached weather data</li>
                <li>• Offline record keeping</li>
                <li>• Auto-sync when online</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-white/10 border-white/20 hover:bg-white/20 transition-all duration-300 shadow-xl">
            <CardHeader>
              <Phone className="h-8 w-8 text-teal-400 mb-2" />
              <CardTitle className="text-white">Multi-Channel</CardTitle>
              <CardDescription className="text-white/80">
                Works on smartphones and basic phones via SMS/USSD
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-white/70 space-y-1">
                <li>• Smartphone app</li>
                <li>• SMS notifications</li>
                <li>• USSD quick access</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center backdrop-blur-md bg-white/10 border border-white/20 rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to Transform Your Farming?
          </h2>
          <p className="text-white/80 mb-6">
            Join thousands of Malawian farmers already using AgriCon to increase their yields and income
          </p>
          <Button 
            onClick={() => navigate('/auth')} 
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white px-12 py-3 shadow-lg"
          >
            Start Your Journey
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
