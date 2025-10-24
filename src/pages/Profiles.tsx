import { useState } from "react";
import ProfileCard from "@/components/ProfileCard";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, User, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock data
const mockProfiles = [
  {
    id: 1,
    name: "Анна",
    age: 28,
    city: "Москва",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop",
    honestyRating: 98,
    about: "Люблю путешествия, книги и долгие разговоры за чашкой кофе. Работаю в IT, ценю искренность и доброту.",
    goals: "Мечтаю о крепкой семье, где царит взаимопонимание и поддержка. Хочу двоих детей и собаку.",
    reviews: [
      {
        author: "Дмитрий",
        text: "Очень приятное общение, искренний и открытый человек. Рекомендую!",
        rating: 5
      },
      {
        author: "Сергей",
        text: "Отличная встреча, интересный собеседник с серьезными намерениями.",
        rating: 5
      }
    ]
  },
  {
    id: 2,
    name: "Мария",
    age: 26,
    city: "Санкт-Петербург",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop",
    honestyRating: 95,
    about: "Психолог по образованию, люблю йогу и здоровый образ жизни. Ценю честность и эмоциональную зрелость.",
    goals: "Ищу партнера для создания гармоничной семьи, основанной на доверии и взаимном росте.",
    reviews: [
      {
        author: "Алексей",
        text: "Замечательный человек, очень позитивная и целеустремленная.",
        rating: 5
      }
    ]
  }
];

const Profiles = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [familiesCount] = useState(10548);

  const currentProfile = mockProfiles[currentIndex];

  const handleLike = () => {
    console.log("Liked profile:", currentProfile.id);
    nextProfile();
  };

  const handleDislike = () => {
    console.log("Disliked profile:", currentProfile.id);
    nextProfile();
  };

  const handleMeetingRequest = () => {
    console.log("Meeting request for:", currentProfile.id);
    // В реальном приложении здесь будет логика отправки запроса на встречу
  };

  const nextProfile = () => {
    if (currentIndex < mockProfiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // Loop back to first profile
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-romantic bg-clip-text text-transparent">
              Создай семью
            </h1>
            
            <div className="flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2">
              <Heart className="text-primary" size={18} />
              <span className="text-sm font-semibold text-foreground">
                <span className="text-primary">{familiesCount.toLocaleString()}</span> семей
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          {currentProfile && (
            <ProfileCard
              profile={currentProfile}
              onLike={handleLike}
              onDislike={handleDislike}
              onMeetingRequest={handleMeetingRequest}
            />
          )}
        </div>

        {currentIndex === mockProfiles.length - 1 && (
          <div className="text-center mt-8">
            <p className="text-muted-foreground">Это все профили на сегодня</p>
            <Button 
              variant="hero" 
              className="mt-4"
              onClick={() => navigate('/welcome')}
            >
              Вернуться на главную
            </Button>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex justify-around py-4">
            <button className="flex flex-col items-center gap-1 text-primary">
              <Heart size={24} />
              <span className="text-xs font-medium">Анкеты</span>
            </button>
            <button 
              className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => navigate('/chats')}
            >
              <MessageCircle size={24} />
              <span className="text-xs font-medium">Диалоги</span>
            </button>
            <button 
              className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => navigate('/profile')}
            >
              <User size={24} />
              <span className="text-xs font-medium">Профиль</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Profiles;
