import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Heart, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Conversation {
  id: string;
  other_user: {
    id: string;
    name: string;
    photos: string[];
  };
  last_message: string;
  last_message_time: string;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

const Chats = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat);
      
      const channel = supabase
        .channel(`messages:${selectedChat}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${selectedChat}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as Message]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedChat]);

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          id,
          user1_id,
          user2_id,
          user1:profiles!conversations_user1_id_fkey(id, name, photos),
          user2:profiles!conversations_user2_id_fkey(id, name, photos)
        `)
        .or(`user1_id.eq.${user!.id},user2_id.eq.${user!.id}`);

      if (error) throw error;

      const formattedConversations = await Promise.all(
        (data || []).map(async (conv: any) => {
          const otherUser = conv.user1_id === user!.id ? conv.user2 : conv.user1;
          
          const { data: lastMsg } = await supabase
            .from("messages")
            .select("content, created_at")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            id: conv.id,
            other_user: otherUser,
            last_message: lastMsg?.content || "Начните беседу",
            last_message_time: lastMsg?.created_at || conv.created_at,
          };
        })
      );

      setConversations(formattedConversations);
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

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setMessages(data || []);
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const { error } = await supabase
        .from("messages")
        .insert({
          conversation_id: selectedChat,
          sender_id: user!.id,
          content: newMessage.trim(),
        });

      if (error) throw error;

      setNewMessage("");
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <p className="text-foreground">Загрузка...</p>
      </div>
    );
  }

  const selectedConversation = conversations.find(c => c.id === selectedChat);

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20">
      <div className="bg-gradient-romantic p-4 shadow-card">
        <div className="max-w-2xl mx-auto relative">
          {selectedChat && (
            <Button
              variant="ghost"
              onClick={() => setSelectedChat(null)}
              className="text-white absolute left-0"
            >
              ← Назад
            </Button>
          )}
          <h1 className="text-xl font-bold text-white text-center">
            {selectedChat ? selectedConversation?.other_user.name : "Диалоги"}
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        {!selectedChat ? (
          conversations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">У вас пока нет диалогов</p>
              <p className="text-sm text-muted-foreground">
                Начните знакомиться, чтобы появились беседы
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedChat(conversation.id)}
                >
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      <img
                        src={conversation.other_user.photos[0] || "/placeholder.svg"}
                        alt={conversation.other_user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">
                        {conversation.other_user.name}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.last_message}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )
        ) : (
          <div>
            <div className="space-y-4 mb-20">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender_id === user!.id ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-2xl ${
                      message.sender_id === user!.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="fixed bottom-16 left-0 right-0 bg-card border-t border-border p-4">
              <div className="max-w-2xl mx-auto flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Введите сообщение..."
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                />
                <Button onClick={sendMessage} size="icon" variant="hero">
                  <Send size={20} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border py-3">
        <div className="flex justify-around max-w-2xl mx-auto">
          <Button variant="ghost" className="flex flex-col items-center gap-1" onClick={() => navigate("/profiles")}>
            <Heart size={24} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Анкеты</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1">
            <span className="text-2xl">💬</span>
            <span className="text-xs text-primary font-semibold">Диалоги</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1" onClick={() => navigate("/profile")}>
            <span className="text-2xl">👤</span>
            <span className="text-xs text-muted-foreground">Профиль</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chats;
