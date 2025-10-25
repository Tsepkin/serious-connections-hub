import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Calendar, ArrowLeft, MessageCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReviewDialog from "@/components/ReviewDialog";
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
  const [meetingConfirmed, setMeetingConfirmed] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfiles();
    }
  }, [user]);

  useEffect(() => {
    const currentProfile = profiles[currentIndex];
    if (currentProfile) {
      checkMeetingStatus();
    }
  }, [currentIndex, profiles]);

  const fetchProfiles = async () => {
    try {
      console.log("Fetching profiles...");
      
      const { data: myProfile, error: profileError } = await supabase
        .from("profiles")
        .select("gender, looking_for")
        .eq("id", user!.id)
        .maybeSingle();

      console.log("My profile:", myProfile);

      if (profileError) {
        console.error("Profile error:", profileError);
        throw profileError;
      }

      if (!myProfile) {
        console.log("No profile found, redirecting to create-profile");
        navigate("/create-profile");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("gender", myProfile.looking_for)
        .eq("looking_for", myProfile.gender)
        .neq("id", user!.id);

      console.log("Fetched profiles:", data);

      if (error) throw error;

      setProfiles(data || []);
    } catch (error: any) {
      console.error("Error in fetchProfiles:", error);
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkMeetingStatus = async () => {
    const profile = profiles[currentIndex];
    if (!profile) return;

    // Check if there's a confirmed meeting
    const { data: conversation } = await supabase
      .from("conversations")
      .select("id, meeting_confirmed, meeting_date")
      .or(`and(user1_id.eq.${user!.id},user2_id.eq.${profile.id}),and(user1_id.eq.${profile.id},user2_id.eq.${user!.id})`)
      .eq("meeting_confirmed", true)
      .maybeSingle();

    setMeetingConfirmed(!!conversation);
    setConversationId(conversation?.id || null);
  };

  const confirmMeeting = async () => {
    if (!currentProfile || !conversationId) return;
    setShowReviewDialog(true);
  };

  const submitReview = async (rating: number, comment: string, isLike: boolean) => {
    if (!currentProfile || !conversationId) return;

    try {
      // Create meeting record
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

      // Create review
      await supabase
        .from("reviews")
        .insert({
          reviewer_id: user!.id,
          reviewed_id: currentProfile.id,
          conversation_id: conversationId,
          rating: rating,
          comment: comment || null,
        });

      if (isLike) {
        await supabase
          .from("likes")
          .insert({
            user_id: user!.id,
            liked_user_id: currentProfile.id,
          });
      }

      setShowReviewDialog(false);
      toast({
        title: "Отзыв отправлен",
        description: "Спасибо за вашу оценку!",
      });

      nextProfile();
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleStartChat = async () => {
    if (!currentProfile) return;

    try {
      const user1Id = user!.id < currentProfile.id ? user!.id : currentProfile.id;
      const user2Id = user!.id < currentProfile.id ? currentProfile.id : user!.id;

      const { data: existingConversation } = await supabase
        .from("conversations")
        .select("id")
        .eq("user1_id", user1Id)
        .eq("user2_id", user2Id)
        .maybeSingle();

      let conversationId = existingConversation?.id;

      if (!conversationId) {
        const { data: newConversation, error } = await supabase
          .from("conversations")
          .insert({
            user1_id: user1Id,
            user2_id: user2Id,
          })
          .select("id")
          .single();

        if (error) throw error;
        conversationId = newConversation.id;
      }

      navigate(`/chats?conversation=${conversationId}`);
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLike = async () => {
    if (!currentProfile) return;

    try {
      await supabase
        .from("likes")
        .insert({
          user_id: user!.id,
          liked_user_id: currentProfile.id,
        });

      toast({
        title: "Лайк отправлен",
        description: `Вы поставили лайк ${currentProfile.name}`,
      });

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
            
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleStartChat}
                className="flex-1"
                variant="default"
              >
                <MessageCircle className="mr-2" size={20} />
                Написать
              </Button>
            </div>

            <div className="flex gap-3 mt-3">
              <Button
                onClick={handleLike}
                className="flex-1"
                variant="outline"
              >
                <ThumbsUp className="mr-2" size={20} />
                Лайк
              </Button>
              <Button
                onClick={handleDislike}
                className="flex-1"
                variant="outline"
              >
                <ThumbsDown className="mr-2" size={20} />
                Дизлайк
              </Button>
            </div>
          </div>
        </div>

        {meetingConfirmed && (
          <div className="mt-4">
            <Button
              onClick={confirmMeeting}
              className="w-full"
              variant="hero"
            >
              <Calendar className="mr-2" size={20} />
              Мы встретились - Оценить встречу
            </Button>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Оцените встречу с {currentProfile.name}
            </p>
          </div>
        )}

        {!meetingConfirmed && (
          <div className="mt-4 text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Чтобы оценить встречу, сначала предложите встретиться в чате
            </p>
          </div>
        )}
      </div>

      <ReviewDialog
        open={showReviewDialog}
        onClose={() => setShowReviewDialog(false)}
        onSubmit={submitReview}
        profileName={currentProfile.name}
      />

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
