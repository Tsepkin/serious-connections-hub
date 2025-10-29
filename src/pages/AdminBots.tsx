import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, UserPlus, MessageSquare } from "lucide-react";

const AdminBots = () => {
  const [creatingBots, setCreatingBots] = useState(false);
  const [processingResponses, setProcessingResponses] = useState(false);
  const [updatingPhotos, setUpdatingPhotos] = useState(false);

  const createBots = async () => {
    setCreatingBots(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-bots');
      
      if (error) throw error;

      toast({
        title: "Боты созданы!",
        description: `Создано ${data.created} ботов`,
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCreatingBots(false);
    }
  };

  const processResponses = useCallback(async () => {
    setProcessingResponses(true);
    try {
      const { data, error } = await supabase.functions.invoke('bot-responder');
      
      if (error) throw error;

      toast({
        title: "Обработка завершена",
        description: `Запланировано: ${data.responses_scheduled}, Отправлено: ${data.responses_sent}`,
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingResponses(false);
    }
  }, []);

  const updateBotPhotos = async () => {
    setUpdatingPhotos(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-bot-photos');
      
      if (error) throw error;

      toast({
        title: "Фото обновлены!",
        description: `Обновлено: ${data.updated}/${data.total} ботов`,
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdatingPhotos(false);
    }
  };

  // Auto-process every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      processResponses();
    }, 30000);

    return () => clearInterval(interval);
  }, [processResponses]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Управление ботами</h1>
          <p className="text-muted-foreground">Создавайте ботов и управляйте их ответами</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Создать ботов
              </CardTitle>
              <CardDescription>
                Создать 50 реалистичных профилей ботов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={createBots}
                disabled={creatingBots}
                className="w-full"
                size="lg"
              >
                {creatingBots ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Создание...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Создать 50 ботов
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Обновить фото
              </CardTitle>
              <CardDescription>
                Сгенерировать AI фото для всех ботов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={updateBotPhotos}
                disabled={updatingPhotos}
                variant="secondary"
                className="w-full"
                size="lg"
              >
                {updatingPhotos ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Генерация...
                  </>
                ) : (
                  "Обновить фото"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Обработка ответов
              </CardTitle>
              <CardDescription>
                Запустить обработку сообщений и отправку ответов ботов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={processResponses}
                disabled={processingResponses}
                variant="secondary"
                className="w-full"
                size="lg"
              >
                {processingResponses ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Обработка...
                  </>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Обработать ответы
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              • Боты автоматически отвечают на сообщения с задержкой от 20 секунд до 30 минут
            </p>
            <p>
              • Ответы генерируются с помощью AI и учитывают контекст разговора
            </p>
            <p>
              • Обработка ответов запускается автоматически каждые 30 секунд
            </p>
            <p>
              • Каждый бот имеет уникальный профиль с именем, возрастом, интересами
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminBots;