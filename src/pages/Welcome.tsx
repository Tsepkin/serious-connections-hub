import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Heart, Shield, Users } from "lucide-react";
import heroImage from "@/assets/hero-couple.jpg";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-secondary/70 to-accent/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-20 text-center">
          <div className="animate-fade-in">
            {/* Family Counter */}
            <div className="inline-flex items-center gap-2 bg-card/90 backdrop-blur-sm rounded-full px-6 py-3 mb-8 shadow-card">
              <Heart className="text-primary" size={20} />
              <span className="text-foreground font-semibold">Уже <span className="text-primary">10,548</span> семей создано</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
              Знакомства с репутацией
            </h1>
            <p className="text-2xl md:text-3xl text-white/95 mb-12 drop-shadow-md max-w-3xl mx-auto">
              Для тех, кто серьезно настроен создать семью
            </p>

            {/* CTA Button */}
            <Button 
              variant="hero" 
              size="xl"
              onClick={() => navigate('/onboarding')}
              className="mb-16"
            >
              Начать серьезные отношения
            </Button>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
              <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-6 shadow-card hover:shadow-hover transition-all duration-300 animate-fade-in">
                <div className="w-12 h-12 bg-gradient-romantic rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Рейтинг Честности</h3>
                <p className="text-muted-foreground">Прозрачная система репутации на основе реального опыта</p>
              </div>

              <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-6 shadow-card hover:shadow-hover transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="w-12 h-12 bg-gradient-trust rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Честные отзывы</h3>
                <p className="text-muted-foreground">Только после реальных встреч с проверкой подлинности</p>
              </div>

              <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-6 shadow-card hover:shadow-hover transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="w-12 h-12 bg-gradient-romantic rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Серьезные намерения</h3>
                <p className="text-muted-foreground">Все пользователи нацелены на создание семьи</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Welcome;
