import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { profileSchema } from "@/lib/validations";
import { PhotoUpload } from "@/components/PhotoUpload";
import { Loader2 } from "lucide-react";

const zodiacSigns = [
  "Овен", "Телец", "Близнецы", "Рак", "Лев", "Дева",
  "Весы", "Скорпион", "Стрелец", "Козерог", "Водолей", "Рыбы"
];

const CreateProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    age: 18,
    city: "",
    phone: "",
    about_me: "",
    values: "",
    family_goals: "",
    gender: "",
    looking_for: "",
    children: "",
    smoking: "",
    alcohol: "",
    zodiac_sign: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }
      
      setUserId(session.user.id);
      
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();
      
      if (existingProfile) {
        navigate("/profiles");
      }
      
      if (session.user.phone) {
        setFormData(prev => ({ ...prev, phone: session.user.phone || "" }));
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validation = profileSchema.safeParse({
        ...formData,
        age: Number(formData.age),
        children: formData.children || undefined,
        smoking: formData.smoking || undefined,
        alcohol: formData.alcohol || undefined,
        zodiac_sign: formData.zodiac_sign || undefined,
        photos: photos,
      });

      if (!validation.success) {
        toast({
          title: "Ошибка валидации",
          description: validation.error.errors[0].message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("profiles").insert([{
        id: userId,
        name: validation.data.name,
        age: validation.data.age,
        city: validation.data.city,
        phone: validation.data.phone,
        about_me: validation.data.about_me,
        values: validation.data.values,
        family_goals: validation.data.family_goals,
        gender: validation.data.gender,
        looking_for: validation.data.looking_for,
        children: validation.data.children,
        smoking: validation.data.smoking,
        alcohol: validation.data.alcohol,
        zodiac_sign: validation.data.zodiac_sign,
        photos: validation.data.photos || [],
      }]);

      if (error) throw error;

      toast({
        title: "Профиль создан!",
        description: "Теперь вы можете начать знакомиться",
      });

      navigate("/profiles");
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

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-6 md:p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Создайте свою анкету</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photos Section */}
            <div>
              <Label className="text-base font-semibold mb-4 block">Фотографии</Label>
              <PhotoUpload photos={photos} onPhotosChange={setPhotos} userId={userId} />
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Имя *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="age">Возраст *</Label>
                <Input
                  id="age"
                  type="number"
                  min="18"
                  max="100"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 18 })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="gender">Пол *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите пол" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Мужчина</SelectItem>
                    <SelectItem value="female">Женщина</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="looking_for">Кого ищете *</Label>
                <Select
                  value={formData.looking_for}
                  onValueChange={(value) => setFormData({ ...formData, looking_for: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Мужчину</SelectItem>
                    <SelectItem value="female">Женщину</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="city">Город *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Телефон *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="children">Дети</Label>
                <Select
                  value={formData.children}
                  onValueChange={(value) => setFormData({ ...formData, children: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Да</SelectItem>
                    <SelectItem value="no">Нет</SelectItem>
                    <SelectItem value="not_say">Не скажу</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="smoking">Отношение к курению</Label>
                <Select
                  value={formData.smoking}
                  onValueChange={(value) => setFormData({ ...formData, smoking: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smoke">Курю</SelectItem>
                    <SelectItem value="not_smoke">Не курю</SelectItem>
                    <SelectItem value="neutral">Отношусь нейтрально</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="alcohol">Отношение к алкоголю</Label>
                <Select
                  value={formData.alcohol}
                  onValueChange={(value) => setFormData({ ...formData, alcohol: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="drink">Употребляю</SelectItem>
                    <SelectItem value="not_drink">Не употребляю</SelectItem>
                    <SelectItem value="sometimes">Иногда</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="zodiac_sign">Знак Зодиака</Label>
                <Select
                  value={formData.zodiac_sign}
                  onValueChange={(value) => setFormData({ ...formData, zodiac_sign: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите знак" />
                  </SelectTrigger>
                  <SelectContent>
                    {zodiacSigns.map((sign) => (
                      <SelectItem key={sign} value={sign}>{sign}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="about_me">О себе *</Label>
                <Textarea
                  id="about_me"
                  value={formData.about_me}
                  onChange={(e) => setFormData({ ...formData, about_me: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="values">Ваши ценности *</Label>
                <Textarea
                  id="values"
                  value={formData.values}
                  onChange={(e) => setFormData({ ...formData, values: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="family_goals">Семейные цели *</Label>
                <Textarea
                  id="family_goals"
                  value={formData.family_goals}
                  onChange={(e) => setFormData({ ...formData, family_goals: e.target.value })}
                  rows={3}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              variant="hero"
              disabled={loading || photos.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Создание...
                </>
              ) : (
                "Создать профиль"
              )}
            </Button>
            
            {photos.length === 0 && (
              <p className="text-sm text-destructive text-center">
                Загрузите хотя бы одну фотографию
              </p>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreateProfile;
