import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, User, Calendar, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Chats = () => {
  const navigate = useNavigate();
  const [familiesCount] = useState(10548);

  const chats = [
    {
      id: 1,
      name: "Анна",
      age: 28,
      photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      lastMessage: "Спасибо за приятное общение!",
      time: "15:30",
      unread: 2,
      readyForMeeting: true
    },
    {
      id: 2,
      name: "Мария",
      age: 26,
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
      lastMessage: "Было бы здорово встретиться",
      time: "14:20",
      unread: 0,
      readyForMeeting: false
    }
  ];

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

      <div className="container mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-foreground mb-6">Диалоги</h2>

        {/* Ready for Meeting Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-accent" size={20} />
            <h3 className="font-semibold text-foreground">Готовы к встрече</h3>
          </div>
          
          <div className="space-y-3">
            {chats.filter(chat => chat.readyForMeeting).map(chat => (
              <div 
                key={chat.id}
                className="bg-card rounded-2xl p-4 shadow-card hover:shadow-hover transition-all cursor-pointer border-2 border-accent/30"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img 
                      src={chat.photo} 
                      alt={chat.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent rounded-full border-2 border-card flex items-center justify-center">
                      <Calendar size={14} className="text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-foreground">{chat.name}, {chat.age}</h4>
                      <span className="text-xs text-muted-foreground">{chat.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                  </div>

                  {chat.unread > 0 && (
                    <Badge variant="default" className="bg-primary">
                      {chat.unread}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regular Chats */}
        <div>
          <h3 className="font-semibold text-foreground mb-4">Мои чаты</h3>
          
          <div className="space-y-3">
            {chats.filter(chat => !chat.readyForMeeting).map(chat => (
              <div 
                key={chat.id}
                className="bg-card rounded-2xl p-4 shadow-card hover:shadow-hover transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <img 
                    src={chat.photo} 
                    alt={chat.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-foreground">{chat.name}, {chat.age}</h4>
                      <span className="text-xs text-muted-foreground">{chat.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                  </div>

                  {chat.unread > 0 && (
                    <Badge variant="default" className="bg-primary">
                      {chat.unread}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {chats.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="mx-auto text-muted-foreground mb-4" size={48} />
            <h3 className="text-xl font-semibold text-foreground mb-2">Пока нет диалогов</h3>
            <p className="text-muted-foreground mb-6">Начните знакомиться, чтобы увидеть свои чаты здесь</p>
            <Button variant="hero" onClick={() => navigate('/profiles')}>
              Смотреть анкеты
            </Button>
          </div>
        )}
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
            <button className="flex flex-col items-center gap-1 text-primary">
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

export default Chats;
