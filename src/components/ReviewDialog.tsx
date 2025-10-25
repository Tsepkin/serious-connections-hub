import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Heart, X } from "lucide-react";

interface ReviewDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string, isLike: boolean) => void;
  profileName: string;
}

const ReviewDialog = ({ open, onClose, onSubmit, profileName }: ReviewDialogProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isLike, setIsLike] = useState<boolean | null>(null);

  const handleSubmit = () => {
    if (rating === 0 || isLike === null) return;
    onSubmit(rating, comment, isLike);
    // Reset state
    setRating(0);
    setComment("");
    setIsLike(null);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Оцените встречу с {profileName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div>
            <p className="text-sm font-medium mb-3">Ваша оценка честности:</p>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={
                      star <= (hoveredRating || rating)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Ваше впечатление:</p>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Расскажите о встрече (необязательно)"
              rows={4}
            />
          </div>

          <div>
            <p className="text-sm font-medium mb-3">Хотите продолжить общение?</p>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={isLike === false ? "destructive" : "outline"}
                size="lg"
                className="flex-1"
                onClick={() => setIsLike(false)}
              >
                <X size={24} className="mr-2" />
                Нет
              </Button>
              <Button
                type="button"
                variant={isLike === true ? "hero" : "outline"}
                size="lg"
                className="flex-1"
                onClick={() => setIsLike(true)}
              >
                <Heart size={24} className="mr-2" />
                Да
              </Button>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || isLike === null}
            className="w-full"
            variant="hero"
          >
            Отправить отзыв
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;