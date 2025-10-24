import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, X, Calendar, MapPin, Shield, Star } from "lucide-react";

interface Review {
  author: string;
  text: string;
  rating: number;
}

interface Profile {
  id: number;
  name: string;
  age: number;
  city: string;
  photo: string;
  honestyRating: number;
  about: string;
  goals: string;
  reviews: Review[];
}

interface ProfileCardProps {
  profile: Profile;
  onLike: () => void;
  onDislike: () => void;
  onMeetingRequest: () => void;
}

const ProfileCard = ({ profile, onLike, onDislike, onMeetingRequest }: ProfileCardProps) => {
  return (
    <div className="bg-card rounded-3xl shadow-card overflow-hidden max-w-md w-full animate-fade-in">
      {/* Photo */}
      <div className="relative aspect-[3/4] bg-muted">
        <img 
          src={profile.photo} 
          alt={profile.name}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay Info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
          <h2 className="text-3xl font-bold mb-2">{profile.name}, {profile.age}</h2>
          <div className="flex items-center gap-2 text-white/90">
            <MapPin size={16} />
            <span>{profile.city}</span>
          </div>
        </div>

        {/* Honesty Rating Badge */}
        <div className="absolute top-4 right-4">
          <div className="bg-card/95 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-card">
            <div className="flex items-center gap-2">
              <Shield className="text-primary" size={20} />
              <div>
                <div className="text-xs text-muted-foreground">Рейтинг</div>
                <div className="text-lg font-bold text-primary">{profile.honestyRating}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* About */}
        <div>
          <h3 className="font-semibold text-foreground mb-2">О себе</h3>
          <p className="text-muted-foreground">{profile.about}</p>
        </div>

        {/* Goals */}
        <div>
          <h3 className="font-semibold text-foreground mb-2">Цели в семейной жизни</h3>
          <p className="text-muted-foreground">{profile.goals}</p>
        </div>

        {/* Reviews */}
        {profile.reviews.length > 0 && (
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Star className="text-accent" size={18} />
              Отзывы после встреч
            </h3>
            <div className="space-y-3">
              {profile.reviews.slice(0, 2).map((review, idx) => (
                <div key={idx} className="bg-muted rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm text-foreground">{review.author}</span>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < review.rating ? "text-accent fill-accent" : "text-muted-foreground/30"}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.text}</p>
                </div>
              ))}
            </div>
            {profile.reviews.length > 2 && (
              <button className="text-sm text-primary hover:underline mt-2">
                Показать все отзывы ({profile.reviews.length})
              </button>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button 
            variant="outline" 
            size="icon"
            className="h-14 w-14 rounded-full hover:border-destructive hover:text-destructive"
            onClick={onDislike}
          >
            <X size={24} />
          </Button>
          
          <Button 
            variant="hero"
            className="flex-1 rounded-full"
            onClick={onMeetingRequest}
          >
            <Calendar className="mr-2" size={18} />
            ИДЕМ НА СВИДАНИЕ
          </Button>
          
          <Button 
            variant="outline"
            size="icon"
            className="h-14 w-14 rounded-full hover:border-primary hover:text-primary hover:bg-primary/5"
            onClick={onLike}
          >
            <Heart size={24} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
