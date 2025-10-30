import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Loader2 } from "lucide-react";

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  userId: string;
}

export const PhotoUpload = ({ photos, onPhotosChange, userId }: PhotoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadPhoto = async (file: File) => {
    // Support HEIC and other image formats from iPhone
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    const isValidImage = validTypes.includes(file.type.toLowerCase()) || file.type.startsWith('image/');
    
    if (!isValidImage) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, загрузите изображение (JPG, PNG, WEBP, HEIC)",
        variant: "destructive",
      });
      return null;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Ошибка",
        description: "Размер файла не должен превышать 10 МБ",
        variant: "destructive",
      });
      return null;
    }

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast({
          title: "Ошибка загрузки",
          description: `Не удалось загрузить фото: ${uploadError.message}`,
          variant: "destructive",
        });
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      console.error('Upload exception:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при загрузке фото. Попробуйте еще раз.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    if (photos.length >= 9) {
      toast({
        title: "Лимит достигнут",
        description: "Максимум 9 фотографий",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const file = e.target.files[0];
    const url = await uploadPhoto(file);
    
    if (url) {
      onPhotosChange([...photos, url]);
      toast({
        title: "Успешно",
        description: "Фотография загружена",
      });
    }
    
    setUploading(false);
    e.target.value = '';
  };

  const removePhoto = async (index: number) => {
    const photoUrl = photos[index];
    const fileName = photoUrl.split('/profile-photos/')[1];
    
    if (fileName) {
      await supabase.storage
        .from('profile-photos')
        .remove([fileName]);
    }

    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
    
    toast({
      title: "Успешно",
      description: "Фотография удалена",
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-xl overflow-hidden bg-muted border-2 border-dashed border-border"
          >
            {photos[index] ? (
              <>
                <img
                  src={photos[index]}
                  alt={`Фото ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <label className="flex items-center justify-center h-full cursor-pointer hover:bg-muted/80 transition-colors">
                <input
                  type="file"
                  accept="image/*,image/heic,image/heif"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={uploading || photos.length >= 9}
                />
                {uploading && photos.length === index ? (
                  <Loader2 className="animate-spin text-muted-foreground" size={24} />
                ) : (
                  <Upload className="text-muted-foreground" size={24} />
                )}
              </label>
            )}
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground text-center">
        Загружено {photos.length} из 9 фотографий
      </p>
    </div>
  );
};
