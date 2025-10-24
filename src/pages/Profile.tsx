import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, User, Shield, Star, Settings, Edit, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [familiesCount] = useState(10548);
  
  // Mock user data
  const userData = {
    name: "Иван",
    age: 32,
    city: "Москва",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    honestyRating: 96,
    about: "Предприниматель, люблю спорт, путешествия и активный отдых. Ценю честность и открытость в отношениях.",
    goals: "Ищу спутницу жизни для создания крепкой, счастливой семьи, основанной на доверии и любви.",
    stats: {
      matches: 15,
      meetings: 8,
      reviews: 5
    },
    reviews: [
      {
        author: "Елена",
        text: "Очень приятный и интересный собеседник, настроен серьезно.",
        rating: 5,
        date: "15 янв 2025"
      },
      {
        author: "Ольга",
        text: "Отличная встреча! Пунктуальный, вежливый, с хорошим чувством юмора.",
        rating: 5,
        date: "10 янв 2025"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20">
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

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Profile Header */}
        <div className="bg-card rounded-3xl shadow-card overflow-hidden mb-6 animate-fade-in">
          <div className="relative h-32 bg-gradient-romantic"></div>
          
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-16 mb-4">
              <img 
                src={userData.photo}
                alt={userData.name}
                className="w-32 h-32 rounded-full border-4 border-card object-cover shadow-card"
              />
              <div className="flex-1 pt-16">
                <h2 className="text-2xl font-bold text-foreground">{userData.name}, {userData.age}</h2>
                <p className="text-muted-foreground">{userData.city}</p>
              </div>
              <Button variant="outline" size="icon" className="mt-16">
                <Edit size={18} />
              </Button>
            </div>

            {/* Honesty Rating */}
            <div className="bg-gradient-subtle rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <Shield className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Рейтинг Честности</p>
                    <p className="text-3xl font-bold text-primary">{userData.honestyRating}%</p>
                  </div>
                </div>
                <TrendingUp className="text-primary" size={32} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                На основе {userData.stats.reviews} отзывов после встреч
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-muted rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{userData.stats.matches}</p>
                <p className="text-xs text-muted-foreground">Совпадений</p>
              </div>
              <div className="bg-muted rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{userData.stats.meetings}</p>
                <p className="text-xs text-muted-foreground">Встреч</p>
              </div>
              <div className="bg-muted rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{userData.stats.reviews}</p>
                <p className="text-xs text-muted-foreground">Отзывов</p>
              </div>
            </div>

            {/* About */}
            <div className="mb-4">
              <h3 className="font-semibold text-foreground mb-2">О себе</h3>
              <p className="text-muted-foreground">{userData.about}</p>
            </div>

            {/* Goals */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">Цели в семейной жизни</h3>
              <p className="text-muted-foreground">{userData.goals}</p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-card rounded-3xl shadow-card p-6 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Star className="text-accent" />
            Отзывы обо мне
          </h3>

          {userData.reviews.length > 0 ? (
            <div className="space-y-4">
              {userData.reviews.map((review, idx) => (
                <div key={idx} className="bg-muted rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-foreground">{review.author}</span>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < review.rating ? "text-accent fill-accent" : "text-muted-foreground/30"}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{review.text}</p>
                  <p className="text-xs text-muted-foreground">{review.date}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Star className="mx-auto text-muted-foreground mb-3" size={40} />
              <p className="text-muted-foreground">Пока нет отзывов</p>
              <p className="text-sm text-muted-foreground mt-2">
                Отзывы появятся после ваших первых встреч
              </p>
            </div>
          )}
        </div>

        {/* Settings Button */}
        <Button variant="outline" className="w-full mb-6">
          <Settings className="mr-2" size={18} />
          Настройки и приватность
        </Button>

        {/* Premium Card */}
        <div className="bg-gradient-romantic rounded-3xl p-6 text-white shadow-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-2xl font-bold mb-2">Премиум подписка</h3>
          <p className="text-white/90 mb-4">Используйте свое время с максимальной эффективностью</p>
          
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-2">
              <Shield className="mt-1 flex-shrink-0" size={16} />
              <span className="text-sm">Неограниченные лайки и просмотры</span>
            </li>
            <li className="flex items-start gap-2">
              <TrendingUp className="mt-1 flex-shrink-0" size={16} />
              <span className="text-sm">Приоритет в ленте</span>
            </li>
            <li className="flex items-start gap-2">
              <Star className="mt-1 flex-shrink-0" size={16} />
              <span className="text-sm">Расширенная статистика</span>
            </li>
          </ul>

          <Button variant="secondary" className="w-full bg-white text-primary hover:bg-white/90">
            Оформить подписку от 490₽/мес
          </Button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex justify-around py-4">
            <button 
              className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => navigate('/profiles')}
            >
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
            <button className="flex flex-col items-center gap-1 text-primary">
              <User size={24} />
              <span className="text-xs font-medium">Профиль</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Profile;
