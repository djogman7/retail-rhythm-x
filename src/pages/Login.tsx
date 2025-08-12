import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Eye, EyeOff } from "lucide-react";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [credentials, setCredentials] = useState({ nom: "", motPasse: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiService.login(credentials.nom, credentials.motPasse);
      
      if (response.success && response.data) {
        // Store user data
        localStorage.setItem('userData', JSON.stringify(response.data));
        localStorage.setItem('userToken', 'authenticated'); // Simple token for demo
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${response.data.nom}!`,
        });
        
        navigate('/');
      } else {
        toast({
          title: "Login failed",
          description: response.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login error",
        description: "Unable to connect to the server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <BarChart3 className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Stock Weaver</h1>
              <p className="text-sm text-muted-foreground">Dashboard Login</p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <Card className="bg-gradient-card shadow-soft">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign in</CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              Enter your credentials to access the dashboard
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Username</Label>
                <Input
                  id="nom"
                  type="text"
                  placeholder="Enter your username"
                  value={credentials.nom}
                  onChange={(e) => setCredentials(prev => ({ ...prev, nom: e.target.value }))}
                  required
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="motPasse">Password</Label>
                <div className="relative">
                  <Input
                    id="motPasse"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={credentials.motPasse}
                    onChange={(e) => setCredentials(prev => ({ ...prev, motPasse: e.target.value }))}
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-primary shadow-glow"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo credentials info */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            Demo: Use your backend credentials to access the dashboard
          </p>
        </div>
      </div>
    </div>
  );
}