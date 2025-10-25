import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { profileSchema } from "@/lib/validations";

const CreateProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    city: "",
    phone: "",
    aboutMe: "",
    values: "",
    familyGoals: "",
  });

  useEffect(() => {
    // Check if user is authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
        // Pre-fill phone if available
        if (session.user.phone) {
          setFormData(prev => ({ ...prev, phone: session.user.phone || "" }));
        }
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast({
        title: "Ошибка",
        description: "Пользователь не авторизован",
        variant: "destructive",
      });
      return;
    }

    // Validate form data
    const validation = profileSchema.safeParse({
      name: formData.name,
      age: parseInt(formData.age),
      city: formData.city,
      phone: formData.phone,
      about_me: formData.aboutMe,
      values: formData.values,
      family_goals: formData.familyGoals,
      photo_url: "",
    });

    if (!validation.success) {
      toast({
        title: "Ошибка валидации",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        name: formData.name,
        age: parseInt(formData.age),
        city: formData.city,
        phone: formData.phone,
        about_me: formData.aboutMe,
        values: formData.values,
        family_goals: formData.familyGoals,
      });

    if (error) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Успешно",
        description: "Профиль создан!",
      });
      navigate("/profiles");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Создайте свой профиль</CardTitle>
          <CardDescription>
            Заполните информацию о себе, чтобы начать знакомиться
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Имя *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={loading}
                  placeholder="Ваше имя"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Возраст *</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  required
                  disabled={loading}
                  min="18"
                  max="100"
                  placeholder="18"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Город *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                  disabled={loading}
                  placeholder="Москва"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Телефон *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  disabled={loading}
                  placeholder="+79001234567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aboutMe">О себе *</Label>
              <Textarea
                id="aboutMe"
                value={formData.aboutMe}
                onChange={(e) => setFormData({ ...formData, aboutMe: e.target.value })}
                required
                disabled={loading}
                rows={4}
                placeholder="Расскажите о себе (минимум 10 символов)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="values">Ценности *</Label>
              <Textarea
                id="values"
                value={formData.values}
                onChange={(e) => setFormData({ ...formData, values: e.target.value })}
                required
                disabled={loading}
                rows={4}
                placeholder="Что для вас важно в жизни? (минимум 10 символов)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="familyGoals">Семейные цели *</Label>
              <Textarea
                id="familyGoals"
                value={formData.familyGoals}
                onChange={(e) => setFormData({ ...formData, familyGoals: e.target.value })}
                required
                disabled={loading}
                rows={4}
                placeholder="Какую семью вы хотите создать? (минимум 10 символов)"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Сохранение..." : "Создать профиль"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateProfile;
