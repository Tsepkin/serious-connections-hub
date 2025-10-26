import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { z } from "zod";

const emailSchema = z.string().email("Введите корректный email");
const phoneSchema = z.string().regex(/^\+?[1-9]\d{10,14}$/, "Введите корректный номер телефона (например, +79991234567)");
const otpSchema = z.string().length(6, "Код должен содержать 6 цифр");

const Auth = () => {
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    
    if (authMethod === "email") {
      const validation = emailSchema.safeParse(email);
      if (!validation.success) {
        toast({
          title: "Ошибка валидации",
          description: validation.error.errors[0].message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`
        }
      });

      if (error) {
        toast({
          title: "Ошибка",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setOtpSent(true);
        toast({
          title: "Код отправлен!",
          description: "Проверьте вашу почту",
        });
      }
    } else {
      const validation = phoneSchema.safeParse(phone);
      if (!validation.success) {
        toast({
          title: "Ошибка валидации",
          description: validation.error.errors[0].message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });

      if (error) {
        toast({
          title: "Ошибка",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setOtpSent(true);
        toast({
          title: "Код отправлен!",
          description: "Проверьте ваши SMS",
        });
      }
    }
    
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = otpSchema.safeParse(otp);
    if (!validation.success) {
      toast({
        title: "Ошибка валидации",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.verifyOtp(
      authMethod === "email" 
        ? { email, token: otp, type: "email" }
        : { phone, token: otp, type: "sms" }
    );

    if (error) {
      toast({
        title: "Ошибка верификации",
        description: error.message,
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  const handleBack = () => {
    setOtpSent(false);
    setOtp("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Создай семью</CardTitle>
          <CardDescription className="text-center">
            {otpSent ? "Введите код подтверждения" : "Войдите в свой аккаунт"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!otpSent ? (
            <Tabs value={authMethod} onValueChange={(v) => setAuthMethod(v as "email" | "phone")}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="phone">Телефон</TabsTrigger>
              </TabsList>
              
              <form onSubmit={handleSendOtp} className="space-y-4">
                <TabsContent value="email" className="mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@mail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="phone" className="mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Номер телефона</Label>
                    <Input
                      id="phone"
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
                </TabsContent>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Отправка..." : "Отправить код"}
                </Button>
              </form>
            </Tabs>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label>Код подтверждения</Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                    disabled={loading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Введите 6-значный код из {authMethod === "email" ? "письма" : "SMS"}
                </p>
              </div>
              
              <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
                {loading ? "Проверка..." : "Подтвердить"}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={handleBack}
                disabled={loading}
              >
                Назад
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
