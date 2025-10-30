import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";

const emailSchema = z.string().email("Введите корректный email");
const phoneSchema = z.string().regex(/^\+?[1-9]\d{10,14}$/, "Введите корректный номер телефона (например, +79991234567)");
const passwordSchema = z.string().min(6, "Пароль должен содержать минимум 6 символов");

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuthAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Check if profile exists
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", session.user.id)
          .maybeSingle();
        
        if (profile) {
          navigate("/profiles");
        } else {
          navigate("/onboarding");
        }
      }
    };

    checkAuthAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && event === "SIGNED_IN") {
        // Check if profile exists
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", session.user.id)
          .maybeSingle();
        
        if (profile) {
          navigate("/profiles");
        } else {
          navigate("/onboarding");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const passwordValidation = passwordSchema.safeParse(password);
    if (!passwordValidation.success) {
      toast({
        title: "Ошибка валидации",
        description: passwordValidation.error.errors[0].message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (authMethod === "email") {
      const emailValidation = emailSchema.safeParse(email);
      if (!emailValidation.success) {
        toast({
          title: "Ошибка валидации",
          description: emailValidation.error.errors[0].message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast({
            title: "Ошибка входа",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (error) {
          toast({
            title: "Ошибка регистрации",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Регистрация успешна!",
            description: "Теперь войдите в свой аккаунт",
          });
          setIsLogin(true);
        }
      }
    } else {
      const phoneValidation = phoneSchema.safeParse(phone);
      if (!phoneValidation.success) {
        toast({
          title: "Ошибка валидации",
          description: phoneValidation.error.errors[0].message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          phone,
          password,
        });

        if (error) {
          toast({
            title: "Ошибка входа",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        const { error } = await supabase.auth.signUp({
          phone,
          password,
        });

        if (error) {
          toast({
            title: "Ошибка регистрации",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Регистрация успешна!",
            description: "Теперь войдите в свой аккаунт",
          });
          setIsLogin(true);
        }
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Создай семью</CardTitle>
          <CardDescription className="text-center">
            {isLogin ? "Войдите в свой аккаунт" : "Создайте новый аккаунт"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={isLogin ? "login" : "signup"} onValueChange={(v) => setIsLogin(v === "login")}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="signup">Регистрация</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Tabs value={authMethod} onValueChange={(v) => setAuthMethod(v as "email" | "phone")}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="email">Email</TabsTrigger>
                  <TabsTrigger value="phone">Телефон</TabsTrigger>
                </TabsList>

                <form onSubmit={handleAuth} className="space-y-4">
                  <TabsContent value="email" className="mt-0 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="example@mail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Пароль</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="phone" className="mt-0 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-phone">Номер телефона</Label>
                      <Input
                        id="login-phone"
                        type="tel"
                        placeholder="+79991234567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        disabled={loading}
                      />
                      <p className="text-sm text-muted-foreground">
                        Введите номер в международном формате
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-phone-password">Пароль</Label>
                      <Input
                        id="login-phone-password"
                        type="password"
                        placeholder="••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                  </TabsContent>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Вход..." : "Войти"}
                  </Button>
                </form>
              </Tabs>
            </TabsContent>

            <TabsContent value="signup">
              <Tabs value={authMethod} onValueChange={(v) => setAuthMethod(v as "email" | "phone")}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="email">Email</TabsTrigger>
                  <TabsTrigger value="phone">Телефон</TabsTrigger>
                </TabsList>

                <form onSubmit={handleAuth} className="space-y-4">
                  <TabsContent value="email" className="mt-0 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="example@mail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Пароль</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Минимум 6 символов"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="phone" className="mt-0 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">Номер телефона</Label>
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="+79991234567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        disabled={loading}
                      />
                      <p className="text-sm text-muted-foreground">
                        Введите номер в международном формате
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone-password">Пароль</Label>
                      <Input
                        id="signup-phone-password"
                        type="password"
                        placeholder="Минимум 6 символов"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                  </TabsContent>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Регистрация..." : "Зарегистрироваться"}
                  </Button>
                </form>
              </Tabs>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
