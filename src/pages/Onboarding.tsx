import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Shield, Users, Heart } from "lucide-react";

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      navigate('/create-profile');
    }
  };

  const handleSkip = () => {
    navigate('/create-profile');
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-full h-2 rounded-full mx-1 transition-all duration-300 ${
                  s <= step ? 'bg-gradient-romantic' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">Шаг {step} из 3</p>
        </div>

        {/* Content Card */}
        <div className="bg-card rounded-3xl shadow-card p-8 md:p-12 animate-fade-in">
          {step === 1 && (
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-romantic rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="text-white" size={40} />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Ваша цель</h2>
              <p className="text-muted-foreground mb-8">Что вы ищете в нашем приложении?</p>
              
              <div className="bg-gradient-romantic p-6 rounded-2xl shadow-card">
                <CheckCircle2 className="text-white mx-auto mb-3" size={32} />
                <h3 className="text-2xl font-bold text-white mb-2">Создать семью</h3>
                <p className="text-white/90">Это единственная цель, которую мы поддерживаем</p>
              </div>

              <p className="text-sm text-muted-foreground mt-6">
                Это сразу отсекает случайных пользователей
              </p>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="w-20 h-20 bg-gradient-trust rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="text-white" size={40} />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4 text-center">Система репутации</h2>
              <p className="text-center text-muted-foreground mb-8">
                Наша уникальная система делает знакомства честными
              </p>

              <div className="space-y-4">
                <div className="flex gap-4 items-start p-4 bg-muted rounded-xl">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="text-white" size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Рейтинг Честности</h4>
                    <p className="text-sm text-muted-foreground">
                      Ваш рейтинг растет за качественное общение и подтвержденные встречи
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-4 bg-muted rounded-xl">
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="text-white" size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Честные отзывы</h4>
                    <p className="text-sm text-muted-foreground">
                      Оставляйте и читайте отзывы только после реальных встреч
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-4 bg-muted rounded-xl">
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="text-white" size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Прозрачность</h4>
                    <p className="text-sm text-muted-foreground">
                      Все анкеты открыты. Выбирайте осознанно
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-romantic rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="text-white" size={40} />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Все готово!</h2>
              <p className="text-muted-foreground mb-8">
                Теперь вы можете начать знакомиться с людьми, которые разделяют ваши серьезные намерения
              </p>

              <div className="bg-gradient-subtle p-6 rounded-2xl border-2 border-primary/20">
                <h3 className="text-xl font-semibold text-foreground mb-3">Помните:</h3>
                <ul className="text-left space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-1 flex-shrink-0" size={16} />
                    <span>Будьте честны в своей анкете</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-1 flex-shrink-0" size={16} />
                    <span>Уважайте других пользователей</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-1 flex-shrink-0" size={16} />
                    <span>Оставляйте честные отзывы после встреч</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4 mt-8">
            <Button 
              variant="ghost" 
              onClick={handleSkip}
              className="flex-1"
            >
              Пропустить
            </Button>
            <Button 
              variant="hero" 
              onClick={handleNext}
              className="flex-1"
            >
              {step === 3 ? 'Начать' : 'Далее'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
