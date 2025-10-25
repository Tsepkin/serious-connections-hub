import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Settings, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  name: string;
  age: number;
  city: string;
  about_me: string;
  photos: string[];
  honesty_rating: number;
  total_ratings: number;
  gender: string;
  looking_for: string;
  children: string;
  smoking: string;
  alcohol: string;
  zodiac_sign: string;
  values: string;
  family_goals: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();

      if (error) throw error;

      setProfile(data);
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/welcome");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <p className="text-foreground">Загрузка...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-foreground mb-4">Профиль не найден</h2>
        <Button onClick={() => navigate("/create-profile")}>
          Создать профиль
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20">
      <div className="bg-gradient-romantic p-4 shadow-card">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <h1 className="text-xl font-bold text-white">Мой Профиль</h1>
          <Button variant="ghost" onClick={handleLogout} className="text-white">
            <LogOut size={20} />
          </Button>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-4">
        <Card className="overflow-hidden">
          <div className="aspect-square relative">
            <img
              src={profile.photos[0] || "/placeholder.svg"}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {profile.name}, {profile.age}
            </h2>
            <p className="text-muted-foreground mb-4">{profile.city}</p>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Рейтинг честности: </span>
                <span className="font-semibold text-primary">{profile.honesty_rating}%</span>
                <span className="text-muted-foreground"> ({profile.total_ratings} оценок)</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-foreground mb-1">О себе</h3>
                <p className="text-sm text-muted-foreground">{profile.about_me}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Детали анкеты</h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Ищу: </span>
              <span className="text-foreground">
                {profile.looking_for === "male" ? "Мужчину" : "Женщину"}
              </span>
            </div>
            {profile.children && (
              <div>
                <span className="text-muted-foreground">Дети: </span>
                <span className="text-foreground">
                  {profile.children === "yes" ? "Да" : profile.children === "no" ? "Нет" : "Не скажу"}
                </span>
              </div>
            )}
            {profile.smoking && (
              <div>
                <span className="text-muted-foreground">Курение: </span>
                <span className="text-foreground">
                  {profile.smoking === "smoke" ? "Курю" : profile.smoking === "not_smoke" ? "Не курю" : "Нейтрально"}
                </span>
              </div>
            )}
            {profile.alcohol && (
              <div>
                <span className="text-muted-foreground">Алкоголь: </span>
                <span className="text-foreground">
                  {profile.alcohol === "drink" ? "Употребляю" : profile.alcohol === "not_drink" ? "Не употребляю" : "Иногда"}
                </span>
              </div>
            )}
            {profile.zodiac_sign && (
              <div>
                <span className="text-muted-foreground">Знак зодиака: </span>
                <span className="text-foreground">{profile.zodiac_sign}</span>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-3">Мои ценности</h3>
          <p className="text-sm text-muted-foreground">{profile.values}</p>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-3">Семейные цели</h3>
          <p className="text-sm text-muted-foreground">{profile.family_goals}</p>
        </Card>

        <Button
          onClick={() => navigate("/create-profile")}
          className="w-full"
          variant="outline"
        >
          <Settings className="mr-2" size={20} />
          Редактировать профиль
        </Button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border py-3">
        <div className="flex justify-around max-w-2xl mx-auto">
          <Button variant="ghost" className="flex flex-col items-center gap-1" onClick={() => navigate("/profiles")}>
            <Heart size={24} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Анкеты</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1" onClick={() => navigate("/chats")}>
            <span className="text-2xl">💬</span>
            <span className="text-xs text-muted-foreground">Диалоги</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1">
            <span className="text-2xl">👤</span>
            <span className="text-xs text-primary font-semibold">Профиль</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
