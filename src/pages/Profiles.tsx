import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Calendar, ArrowLeft, MessageCircle, ThumbsUp, ThumbsDown, User, X } from "lucide-react";
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

interface Review {
  id: string;
  reviewer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_name: string;
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
  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  // Hide swipe hint after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowSwipeHint(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfiles();
    }
  }, [user]);

  useEffect(() => {
    const currentProfile = profiles[currentIndex];
    if (currentProfile) {
      checkMeetingStatus();
      fetchProfileStats();
    }
  }, [currentIndex, profiles]);

  const fetchProfiles = async () => {
    try {
      console.log("Fetching profiles...");
      
      // Get user's profile to filter by looking_for
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("looking_for")
        .eq("id", user!.id)
        .single();

      // Fetch profiles excluding current user and matching gender preferences
      const { data: allProfiles, error } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", user!.id)
        .eq("gender", myProfile?.looking_for || "female");

      if (error) throw error;

      // Shuffle profiles
      const shuffled = (allProfiles || []).sort(() => Math.random() - 0.5);

      console.log("Fetched profiles:", shuffled);
      setProfiles(shuffled);
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

    if (conversation) {
      // Check if user already left a review
      const { data: existingReview } = await supabase
        .from("reviews")
        .select("id")
        .eq("reviewer_id", user!.id)
        .eq("conversation_id", conversation.id)
        .maybeSingle();

      // Show button only if meeting is confirmed and user hasn't reviewed yet
      setMeetingConfirmed(!existingReview);
      setConversationId(conversation.id);
    } else {
      setMeetingConfirmed(false);
      setConversationId(null);
    }
  };

  const fetchProfileStats = async () => {
    const profile = profiles[currentIndex];
    if (!profile) return;

    // Fetch likes count
    const { count: likesCount } = await supabase
      .from("likes")
      .select("*", { count: 'exact', head: true })
      .eq("liked_user_id", profile.id);

    setLikesCount(likesCount || 0);

    // Fetch dislikes count
    const { count: dislikesCount } = await supabase
      .from("dislikes")
      .select("*", { count: 'exact', head: true })
      .eq("disliked_user_id", profile.id);

    setDislikesCount(dislikesCount || 0);

    // Fetch reviews with reviewer names
    const { data: reviewsData } = await supabase
      .from("reviews")
      .select(`
        id,
        reviewer_id,
        rating,
        comment,
        created_at,
        profiles!reviews_reviewer_id_fkey(name)
      `)
      .eq("reviewed_id", profile.id)
      .order("created_at", { ascending: false });

    if (reviewsData) {
      const formattedReviews = reviewsData.map((review: any) => ({
        id: review.id,
        reviewer_id: review.reviewer_id,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
        reviewer_name: review.profiles?.name || "Аноним",
      }));
      setReviews(formattedReviews);
    }
  };

  const confirmMeeting = async () => {
    if (!currentProfile || !conversationId) return;
    setShowReviewDialog(true);
  };

  const submitReview = async (rating: number, comment: string, isLike: boolean) => {
    if (!currentProfile || !conversationId) return;

    try {
      console.log("Submitting review...", { rating, comment, isLike, conversationId });
      
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
        const { error: updateError } = await supabase
          .from("meetings")
          .update({ [updateField]: true })
          .eq("id", existingMeeting.id);
        
        if (updateError) {
          console.error("Error updating meeting:", updateError);
          throw updateError;
        }
      } else {
        const { error: insertError } = await supabase
          .from("meetings")
          .insert({
            user1_id: user1Id,
            user2_id: user2Id,
            [isUser1 ? "confirmed_by_user1" : "confirmed_by_user2"]: true,
          });
        
        if (insertError) {
          console.error("Error creating meeting:", insertError);
          throw insertError;
        }
      }

      // Create review
      const { error: reviewError } = await supabase
        .from("reviews")
        .insert({
          reviewer_id: user!.id,
          reviewed_id: currentProfile.id,
          conversation_id: conversationId,
          rating: rating,
          comment: comment || null,
        });

      if (reviewError) {
        console.error("Error creating review:", reviewError);
        throw reviewError;
      }

      console.log("Review created successfully");

      if (isLike) {
        const { error: likeError } = await supabase
          .from("likes")
          .insert({
            user_id: user!.id,
            liked_user_id: currentProfile.id,
          });
        
        if (likeError) {
          console.error("Error creating like:", likeError);
          // Don't throw, continue anyway
        }
      }

      setShowReviewDialog(false);
      toast({
        title: "Отзыв отправлен",
        description: "Спасибо за вашу оценку!",
      });

      // Refresh reviews, stats and meeting status
      await Promise.all([fetchProfileStats(), checkMeetingStatus()]);
    } catch (error: any) {
      console.error("Error in submitReview:", error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось отправить отзыв",
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

  const handleDislike = async () => {
    if (!currentProfile || !meetingConfirmed) {
      toast({
        title: "Ошибка",
        description: "Дизлайк можно поставить только после встречи",
        variant: "destructive",
      });
      return;
    }

    try {
      await supabase
        .from("dislikes")
        .insert({
          user_id: user!.id,
          disliked_user_id: currentProfile.id,
        });

      toast({
        title: "Дизлайк отправлен",
        description: `Вы поставили дизлайк ${currentProfile.name}`,
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

  const nextProfile = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handleSkip = () => {
    setSwipeDirection('left');
    setTimeout(() => {
      nextProfile();
      setSwipeDirection(null);
    }, 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      setShowSwipeHint(false);
      handleSkip();
    } else if (isRightSwipe) {
      setShowSwipeHint(false);
      handleLike();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
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
        {showSwipeHint && (
          <div className="mb-4 bg-primary/10 border border-primary rounded-lg p-3 animate-pulse">
            <p className="text-sm text-center text-primary font-medium">
              💡 Свайп влево = пропустить, вправо = лайк
            </p>
          </div>
        )}
        
        <div
          ref={cardRef}
          className={`bg-card rounded-3xl shadow-card overflow-hidden transition-all duration-300 ${
            swipeDirection === 'left' ? 'animate-slide-out-right opacity-0' : ''
          }`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
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
            <div className="absolute top-4 right-4 bg-card/95 backdrop-blur-sm rounded-2xl px-4 py-2 flex items-center gap-3">
              <div>
                <div className="text-xs text-muted-foreground">Рейтинг</div>
                <div className="text-lg font-bold text-primary">{currentProfile.honesty_rating}%</div>
              </div>
              <div className="border-l border-border pl-3 flex items-center gap-3">
                <div className="flex items-center gap-1 text-success">
                  <ThumbsUp size={16} />
                  <span className="text-sm font-semibold">{likesCount}</span>
                </div>
                <div className="flex items-center gap-1 text-destructive">
                  <ThumbsDown size={16} />
                  <span className="text-sm font-semibold">{dislikesCount}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <h3 className="font-semibold text-foreground mb-2">О себе</h3>
            <p className="text-muted-foreground">{currentProfile.about_me}</p>
            
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleSkip}
                variant="outline"
                size="icon"
                className="h-14 w-14 rounded-full hover:border-muted-foreground"
              >
                <X size={24} />
              </Button>
              <Button
                onClick={handleStartChat}
                className="flex-1"
                variant="default"
              >
                <MessageCircle className="mr-2" size={20} />
                Написать
              </Button>
              <Button
                onClick={handleLike}
                variant="outline"
                size="icon"
                className="h-14 w-14 rounded-full hover:border-primary hover:text-primary"
              >
                <Heart size={24} />
              </Button>
            </div>

            {meetingConfirmed && (
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
            )}

            {reviews.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-foreground mb-3">Отзывы ({reviews.length})</h3>
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground">{review.reviewer_name}</span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < review.rating ? "text-primary" : "text-muted-foreground"}>
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(review.created_at).toLocaleDateString("ru-RU")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
            <User size={24} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Профиль</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profiles;
