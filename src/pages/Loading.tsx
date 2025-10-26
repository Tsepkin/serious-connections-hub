import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import heroCouple from "@/assets/hero-couple.jpg";

const Loading = () => {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => navigate("/welcome"), 300);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroCouple})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto space-y-12">
        <div className="space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
            Знакомства с репутацией
          </h1>
          <p className="text-2xl md:text-3xl text-white/90 font-medium">
            Для тех, кто серьезно настроен
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <Progress value={progress} className="h-2 bg-white/20" />
          <p className="text-white/80 text-lg font-medium">{progress}%</p>
        </div>
      </div>
    </div>
  );
};

export default Loading;
