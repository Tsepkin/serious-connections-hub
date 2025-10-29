import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Heart, Send, Calendar, MessageCircle, User, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  meeting_requested_by_user1: boolean;
  meeting_requested_by_user2: boolean;
  meeting_confirmed: boolean;
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
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId && conversations.length > 0) {
      setSelectedChat(conversationId);
    }
  }, [searchParams, conversations]);

  useEffect(() => {
    if (selectedChat) {
      const conv = conversations.find(c => c.id === selectedChat);
      setCurrentConversation(conv || null);
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
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'conversations',
            filter: `id=eq.${selectedChat}`,
          },
          (payload) => {
            const updated = payload.new as any;
            setCurrentConversation(prev => prev ? { ...prev, ...updated } : null);
            setConversations(prev => prev.map(c => c.id === selectedChat ? { ...c, ...updated } : c));
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'typing_indicators',
            filter: `conversation_id=eq.${selectedChat}`,
          },
          (payload) => {
            if (payload.eventType === 'DELETE') {
              const deletedData = payload.old as any;
              if (deletedData.user_id !== user!.id) {
                setIsOtherUserTyping(false);
              }
            } else {
              const typingData = payload.new as any;
              if (typingData.user_id !== user!.id) {
                setIsOtherUserTyping(typingData.is_typing);
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedChat, conversations, user]);

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          id,
          user1_id,
          user2_id,
          meeting_requested_by_user1,
          meeting_requested_by_user2,
          meeting_confirmed,
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
            user1_id: conv.user1_id,
            user2_id: conv.user2_id,
            meeting_requested_by_user1: conv.meeting_requested_by_user1,
            meeting_requested_by_user2: conv.meeting_requested_by_user2,
            meeting_confirmed: conv.meeting_confirmed,
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

  const updateTypingStatus = async (isTyping: boolean) => {
    if (!selectedChat || !user) return;

    try {
      if (isTyping) {
        await supabase
          .from("typing_indicators")
          .upsert({
            conversation_id: selectedChat,
            user_id: user.id,
            is_typing: true,
            updated_at: new Date().toISOString(),
          });
      } else {
        await supabase
          .from("typing_indicators")
          .delete()
          .eq("conversation_id", selectedChat)
          .eq("user_id", user.id);
      }
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  };

  const handleInputChange = (value: string) => {
    setNewMessage(value);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set typing to true
    if (value.trim()) {
      updateTypingStatus(true);

      // Set timeout to stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        updateTypingStatus(false);
      }, 2000);
    } else {
      updateTypingStatus(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      // Clear typing status
      await updateTypingStatus(false);

      const { error } = await supabase
        .from("messages")
        .insert({
          conversation_id: selectedChat,
          sender_id: user!.id,
          content: newMessage.trim(),
        });

      if (error) throw error;

      setNewMessage("");

      // Trigger bot response immediately
      try {
        await supabase.functions.invoke('bot-responder');
      } catch (botError) {
        console.error('Error triggering bot response:', botError);
        // Don't show error to user, just log it
      }
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const requestMeeting = async () => {
    if (!currentConversation || !user) return;

    try {
      const isUser1 = currentConversation.user1_id === user.id;
      const updateField = isUser1 ? "meeting_requested_by_user1" : "meeting_requested_by_user2";
      const otherUserRequested = isUser1 ? currentConversation.meeting_requested_by_user2 : currentConversation.meeting_requested_by_user1;

      const { error } = await supabase
        .from("conversations")
        .update({ [updateField]: true })
        .eq("id", currentConversation.id);

      if (error) throw error;

      // Send system message
      await supabase
        .from("messages")
        .insert({
          conversation_id: currentConversation.id,
          sender_id: user.id,
          content: otherUserRequested ? "🗓️ Встреча подтверждена!" : "🗓️ Предложил(а) встретиться",
        });

      toast({
        title: otherUserRequested ? "Встреча подтверждена!" : "Приглашение отправлено",
        description: otherUserRequested ? "Не забудьте оценить встречу после" : "Ждем подтверждения от собеседника",
      });
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
              {isOtherUserTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[70%] p-3 rounded-2xl bg-muted text-foreground flex items-center gap-2">
                    <Pencil size={16} className="animate-pulse" />
                    <span className="text-sm text-muted-foreground">печатает...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="fixed bottom-16 left-0 right-0 bg-card border-t border-border p-4 space-y-2">
              <div className="max-w-2xl mx-auto space-y-2">
                {currentConversation?.meeting_confirmed && (
                  <div className="bg-success/10 border border-success rounded-lg p-3 text-center">
                    <p className="text-sm font-semibold text-success">
                      ✓ Встреча подтверждена! Теперь можете оценить встречу на странице Анкеты
                    </p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="Введите сообщение..."
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <Button onClick={sendMessage} size="icon" variant="hero">
                    <Send size={20} />
                  </Button>
                </div>
                {currentConversation && !currentConversation.meeting_confirmed && (
                  <>
                    {(() => {
                      const isUser1 = currentConversation.user1_id === user!.id;
                      const iRequestedMeeting = isUser1 ? currentConversation.meeting_requested_by_user1 : currentConversation.meeting_requested_by_user2;
                      const otherUserRequestedMeeting = isUser1 ? currentConversation.meeting_requested_by_user2 : currentConversation.meeting_requested_by_user1;

                      if (otherUserRequestedMeeting && !iRequestedMeeting) {
                        return (
                          <div className="space-y-2">
                            <p className="text-sm text-center text-muted-foreground">
                              {currentConversation.other_user.name} предложил(а) встретиться
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                onClick={requestMeeting}
                                variant="default"
                                className="w-full"
                              >
                                <Calendar className="mr-2" size={16} />
                                Встретиться
                              </Button>
                              <Button
                                onClick={async () => {
                                  try {
                                    const updateField = isUser1 ? "meeting_requested_by_user2" : "meeting_requested_by_user1";
                                    await supabase
                                      .from("conversations")
                                      .update({ [updateField]: false })
                                      .eq("id", currentConversation.id);
                                    
                                    await supabase
                                      .from("messages")
                                      .insert({
                                        conversation_id: currentConversation.id,
                                        sender_id: user!.id,
                                        content: "❌ Отклонил(а) встречу",
                                      });

                                    toast({
                                      title: "Встреча отклонена",
                                      description: "Вы отклонили приглашение на встречу",
                                    });
                                  } catch (error: any) {
                                    toast({
                                      title: "Ошибка",
                                      description: error.message,
                                      variant: "destructive",
                                    });
                                  }
                                }}
                                variant="outline"
                                className="w-full"
                              >
                                Не встретиться
                              </Button>
                            </div>
                          </div>
                        );
                      }

                      if (iRequestedMeeting && !otherUserRequestedMeeting) {
                        return (
                          <Button
                            variant="outline"
                            className="w-full"
                            disabled
                          >
                            <Calendar className="mr-2" size={20} />
                            Ожидаем подтверждения...
                          </Button>
                        );
                      }

                      if (!iRequestedMeeting && !otherUserRequestedMeeting) {
                        return (
                          <Button
                            onClick={requestMeeting}
                            variant="outline"
                            className="w-full"
                          >
                            <Calendar className="mr-2" size={20} />
                            Давай встретимся
                          </Button>
                        );
                      }

                      return null;
                    })()}
                  </>
                )}
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
            <MessageCircle size={24} className="text-primary" />
            <span className="text-xs text-primary font-semibold">Диалоги</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1" onClick={() => navigate("/profile")}>
            <User size={24} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Профиль</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chats;
