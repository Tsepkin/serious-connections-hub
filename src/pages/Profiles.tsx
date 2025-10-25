import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, X, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfileCard from "@/components/ProfileCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Profile {
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
}

const Profiles = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [metBefore, setMetBefore] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfiles();
    }
  }, [user]);

  useEffect(() => {
    if (currentProfile) {
      checkIfMet();
    }
  }, [currentIndex]);

  const fetchProfiles = async () => {
    try {
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("gender, looking_for")
        .eq("id", user!.id)
        .maybeSingle();

      if (!myProfile) {
        navigate("/create-profile");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("gender", myProfile.looking_for)
        .eq("looking_for", myProfile.gender)
        .neq("id", user!.id);

      if (error) throw error;

      setProfiles(data || []);
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

  const checkIfMet = async () => {
    if (!currentProfile) return;

    const { data } = await supabase
      .from("meetings")
      .select("*")
      .or(`and(user1_id.eq.${user!.id},user2_id.eq.${currentProfile.id}),and(user1_id.eq.${currentProfile.id},user2_id.eq.${user!.id})`)
      .maybeSingle();

    setMetBefore(!!data);
  };

  const handleMeetingConfirmation = async () => {
    if (!currentProfile) return;

    try {
      const user1Id = user!.id < currentProfile.id ? user!.id : currentProfile.id;
      const user2Id = user!.id < currentProfile.id ? currentProfile.id : user!.id;
      const isUser1 = user!.id === user1Id;

      const { data: existingMeeting } = await supabase
        .from("meetings")
        .select("*")
        .eq("user1_id", user1Id)
        .eq("user2_id", user2Id)
        .maybeSingle();

      if (existingMeeting) {
        const updateField = isUser1 ? "confirmed_by_user1" : "confirmed_by_user2";
        
        await supabase
          .from("meetings")
          .update({ [updateField]: true })
          .eq("id", existingMeeting.id);
      } else {
        await supabase
          .from("meetings")
          .insert({
            user1_id: user1Id,
            user2_id: user2Id,
            [isUser1 ? "confirmed_by_user1" : "confirmed_by_user2"]: true,
          });
      }

      setMetBefore(true);
      toast({
        title: "Отмечено",
        description: "Теперь вы можете оценить встречу",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLike = async () => {
    if (!currentProfile || !metBefore) return;

    try {
      await supabase
        .from("likes")
        .insert({
          user_id: user!.id,
          liked_user_id: currentProfile.id,
        });

      const { data: mutualLike } = await supabase
        .from("likes")
        .select("*")
        .eq("user_id", currentProfile.id)
        .eq("liked_user_id", user!.id)
        .maybeSingle();

      if (mutualLike) {
        const user1Id = user!.id < currentProfile.id ? user!.id : currentProfile.id;
        const user2Id = user!.id < currentProfile.id ? currentProfile.id : user!.id;

        await supabase
          .from("conversations")
          .insert({
            user1_id: user1Id,
            user2_id: user2Id,
          });

        toast({
          title: "Взаимная симпатия!",
          description: "Теперь вы можете начать общаться",
        });
      } else {
        toast({
          title: "Лайк отправлен",
          description: "Ожидаем ответной реакции",
        });
      }

      nextProfile();
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDislike = () => {
    if (!metBefore) return;
    nextProfile();
  };

  const nextProfile = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <p className="text-foreground">Загрузка...</p>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-foreground mb-4">Нет доступных анкет</h2>
        <p className="text-muted-foreground mb-6">Попробуйте зайти позже</p>
        <Button onClick={() => navigate("/profile")}>
          К моему профилю
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20">
      <div className="bg-gradient-romantic p-4 shadow-card">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Button variant="ghost" onClick={() => navigate("/welcome")} className="text-white">
            <ArrowLeft size={24} />
          </Button>
          <h1 className="text-xl font-bold text-white">Анкеты</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <div className="bg-card rounded-3xl shadow-card overflow-hidden">
          <div className="relative aspect-[3/4] bg-muted">
            <img 
              src={currentProfile.photos[0] || "/placeholder.svg"}
              alt={currentProfile.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
              <h2 className="text-3xl font-bold mb-2">{currentProfile.name}, {currentProfile.age}</h2>
              <p className="text-white/90">{currentProfile.city}</p>
            </div>
            <div className="absolute top-4 right-4 bg-card/95 backdrop-blur-sm rounded-2xl px-4 py-2">
              <div className="text-xs text-muted-foreground">Рейтинг</div>
              <div className="text-lg font-bold text-primary">{currentProfile.honesty_rating}%</div>
            </div>
          </div>
          <div className="p-6">
            <h3 className="font-semibold text-foreground mb-2">О себе</h3>
            <p className="text-muted-foreground">{currentProfile.about_me}</p>
          </div>
        </div>

        {!metBefore && (
          <div className="mt-4">
            <Button
              onClick={handleMeetingConfirmation}
              className="w-full"
              variant="outline"
            >
              <Calendar className="mr-2" size={20} />
              Мы встретились
            </Button>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Отметьте встречу, чтобы иметь возможность оценить
            </p>
          </div>
        )}

        {metBefore && (
          <div className="flex gap-4 mt-6">
            <Button
              onClick={handleDislike}
              variant="outline"
              size="lg"
              className="flex-1 h-16"
            >
              <X size={32} />
            </Button>
            <Button
              onClick={handleLike}
              variant="hero"
              size="lg"
              className="flex-1 h-16"
            >
              <Heart size={32} />
            </Button>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border py-3">
        <div className="flex justify-around max-w-2xl mx-auto">
          <Button variant="ghost" className="flex flex-col items-center gap-1">
            <Heart size={24} className="text-primary" />
            <span className="text-xs text-primary font-semibold">Анкеты</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1" onClick={() => navigate("/chats")}>
            <span className="text-2xl">💬</span>
            <span className="text-xs text-muted-foreground">Диалоги</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1" onClick={() => navigate("/profile")}>
            <span className="text-2xl">👤</span>
            <span className="text-xs text-muted-foreground">Профиль</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profiles;
