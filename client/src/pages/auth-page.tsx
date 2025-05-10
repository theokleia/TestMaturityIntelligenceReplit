import { useState } from "react";
import { Redirect } from "wouter";
import { useAuth, loginSchema, registerSchema } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Sparkles, ArrowRight, Lock, Mail, User } from "lucide-react";

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("login");
  
  // Initialize forms regardless of user state (to avoid hook errors)
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      fullName: "",
    },
  });

  // If user is already logged in, redirect to home
  if (user) {
    return <Redirect to="/" />;
  }

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left column - forms */}
      <div className="w-full lg:w-1/2 bg-[#0B0F19] p-8 flex flex-col justify-center space-y-6">
        <div className="max-w-md mx-auto w-full">
          <div className="mb-8 text-center">
            <div className="h-16 w-16 mx-auto mb-4 bg-[#192347] rounded-md flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-[#4F7AFF]" />
            </div>
            <h1 className="text-4xl font-bold mb-3 text-white">
              ATMosFera
            </h1>
            <p className="text-gray-400">
              The advanced test management platform powered by AI
            </p>
          </div>

          <div className="w-full p-[1px] rounded-md bg-gradient-to-r from-blue-900/60 via-purple-800/60 to-blue-900/60 mb-8">
            <div className="w-full rounded-md bg-[#0B0F19] p-0 flex">
              <button 
                onClick={() => setActiveTab("login")} 
                className={`flex-1 py-2.5 px-4 text-center rounded-sm transition-colors ${
                  activeTab === "login" 
                    ? "bg-gradient-to-r from-[#2B3A6A] to-[#2B3A6A] text-white" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Login
              </button>
              <button 
                onClick={() => setActiveTab("register")} 
                className={`flex-1 py-2.5 px-4 text-center rounded-sm transition-colors ${
                  activeTab === "register" 
                    ? "bg-gradient-to-r from-[#2B3A6A] to-[#2B3A6A] text-white" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Register
              </button>
            </div>
          </div>
            
          {activeTab === "login" && (
            <div className="rounded-md border border-[#1F2B50] bg-[#111827] shadow">
              <div className="p-5 border-b border-[#1F2B50]">
                <h3 className="text-xl font-semibold text-white">Login to your account</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Enter your credentials to access the platform
                </p>
              </div>
              <div className="p-5">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-2.5 h-4 w-4 text-blue-400" />
                              <Input 
                                placeholder="Your username" 
                                className="pl-9 border-[#1F2B50] bg-[#0B0F19] focus:border-blue-600 focus:ring-1 focus:ring-blue-600" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-blue-400" />
                              <Input 
                                type="password" 
                                placeholder="Your password" 
                                className="pl-9 border-[#1F2B50] bg-[#0B0F19] focus:border-blue-600 focus:ring-1 focus:ring-blue-600" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-[#253461] to-[#1F2B50] hover:from-[#2e3f73] hover:to-[#29375e] border-[#1F2B50]"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <div className="flex items-center">
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          <span>Logging in...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <span>Login</span>
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </div>
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          )}

          {activeTab === "register" && (
            <div className="rounded-md border border-[#1F2B50] bg-[#111827] shadow">
              <div className="p-5 border-b border-[#1F2B50]">
                <h3 className="text-xl font-semibold text-white">Create an account</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Sign up to start using the platform
                </p>
              </div>
              <div className="p-5">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-2.5 h-4 w-4 text-blue-400" />
                              <Input 
                                placeholder="Choose a username" 
                                className="pl-9 border-[#1F2B50] bg-[#0B0F19] focus:border-blue-600 focus:ring-1 focus:ring-blue-600" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-2.5 h-4 w-4 text-blue-400" />
                              <Input 
                                placeholder="Your full name" 
                                className="pl-9 border-[#1F2B50] bg-[#0B0F19] focus:border-blue-600 focus:ring-1 focus:ring-blue-600" 
                                value={field.value || ''}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                                ref={field.ref}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-blue-400" />
                              <Input 
                                type="email" 
                                placeholder="Your email address" 
                                className="pl-9 border-[#1F2B50] bg-[#0B0F19] focus:border-blue-600 focus:ring-1 focus:ring-blue-600" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-blue-400" />
                              <Input 
                                type="password" 
                                placeholder="Create a password" 
                                className="pl-9 border-[#1F2B50] bg-[#0B0F19] focus:border-blue-600 focus:ring-1 focus:ring-blue-600" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-[#253461] to-[#1F2B50] hover:from-[#2e3f73] hover:to-[#29375e] border-[#1F2B50]"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <div className="flex items-center">
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          <span>Creating account...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <span>Create Account</span>
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </div>
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Right column - hero section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 to-indigo-900 flex-col justify-center items-center p-12">
        <div className="max-w-lg mx-auto text-center space-y-8">
          <div className="mb-8">
            <div className="bg-blue-500/20 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6">
              <Sparkles className="h-10 w-10 text-blue-300" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Elevate Your Testing Process
            </h2>
            <p className="text-blue-100 text-lg">
              ATMosFera brings intelligence to your testing workflow with AI-powered features and comprehensive test management.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mt-8">
            <div className="bg-blue-800/30 backdrop-blur-sm rounded-lg p-4 flex flex-col items-center">
              <div className="h-10 w-10 rounded-full bg-blue-700/30 flex items-center justify-center mb-2">
                <Mail className="h-5 w-5 text-blue-300" />
              </div>
              <h3 className="font-semibold text-white">Smart Test Analytics</h3>
              <p className="text-blue-200 text-sm text-center mt-1">
                Gain insights from your testing data through AI analysis
              </p>
            </div>
            <div className="bg-blue-800/30 backdrop-blur-sm rounded-lg p-4 flex flex-col items-center">
              <div className="h-10 w-10 rounded-full bg-blue-700/30 flex items-center justify-center mb-2">
                <User className="h-5 w-5 text-blue-300" />
              </div>
              <h3 className="font-semibold text-white">Maturity Framework</h3>
              <p className="text-blue-200 text-sm text-center mt-1">
                Track your testing evolution with our maturity model
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}