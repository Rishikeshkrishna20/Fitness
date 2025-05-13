import React, { useState } from 'react';
import { LogIn, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
  onShowRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onShowRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch("http://127.0.0.1:8000/api/users/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Login failed");
      }

      const data = await res.json();
      console.log("Login response data:", data);
      console.log("User data:", data.user);
      console.log("User weight:", data.user.weight);
      
      // Store complete user data in localStorage
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));
      alert("✅ Login successful");

      // Redirect to the dashboard
      window.location.href = "/";
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || 'An error occurred');
    }
  };

  return (
    <div className='flex justify-center items-center min-h-screen'>
    <Card className="w-full max-w-md shadow-lg animate-fade-in">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
          <div className="bg-health-light p-4 rounded-full">
            <User className="w-8 h-8 text-health-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
        <CardDescription className="text-center">
          Sign in to continue to your LifePulse account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a href="#" className="text-xs text-health-primary hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="pl-10 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full bg-health-primary hover:bg-health-secondary">
            <LogIn className="w-5 h-5 mr-2" />
            Sign In
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col">
        <div className="relative w-full my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Or</span>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => {
    console.log('Switching to Register');
    // onShowRegister();
    navigate('/register');
  }}
        >
          Create an account
        </Button>
        <p className="text-xs text-center text-gray-500 mt-4">
          By continuing, you agree to our{" "}
          <a href="#" className="text-health-primary hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-health-primary hover:underline">
            Privacy Policy
          </a>
        </p>
      </CardFooter>
    </Card>
    </div>
  );
};

export default LoginForm;
