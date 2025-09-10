import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Heart, Trash2, MessageCircle, Users, Mail, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface NetworkingMessage {
  id: string;
  message_type: string;
  recipient_name: string;
  recipient_title: string | null;
  company: string;
  purpose: string | null;
  generated_message: string;
  is_favorite: boolean;
  created_at: string;
}

const messageTypeLabels = {
  linkedin: { label: "LinkedIn", icon: Users, color: "bg-blue-500" },
  informational: { label: "Informational", icon: MessageCircle, color: "bg-green-500" },
  "recruiter-followup": { label: "Recruiter Follow-up", icon: Mail, color: "bg-purple-500" },
  "mentor-request": { label: "Mentorship", icon: Users, color: "bg-orange-500" }
};

export default function MessageHistory() {
  const [messages, setMessages] = useState<NetworkingMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('networking_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      toast({
        title: "Error loading messages",
        description: "Failed to load your message history.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (message: NetworkingMessage) => {
    try {
      await navigator.clipboard.writeText(message.generated_message);
      setCopiedId(message.id);
      setTimeout(() => setCopiedId(null), 2000);
      
      // Track analytics
      await supabase.from('message_analytics').insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        message_id: message.id,
        action_type: 'copied'
      });

      toast({
        title: "Message copied!",
        description: "Your message has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy message to clipboard.",
        variant: "destructive",
      });
    }
  };

  const toggleFavorite = async (message: NetworkingMessage) => {
    try {
      const { error } = await supabase
        .from('networking_messages')
        .update({ is_favorite: !message.is_favorite })
        .eq('id', message.id);

      if (error) throw error;

      setMessages(prev => 
        prev.map(m => 
          m.id === message.id 
            ? { ...m, is_favorite: !m.is_favorite }
            : m
        )
      );

      // Track analytics
      await supabase.from('message_analytics').insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        message_id: message.id,
        action_type: 'favorited'
      });

      toast({
        title: message.is_favorite ? "Removed from favorites" : "Added to favorites",
        description: message.is_favorite ? "Message removed from your favorites." : "Message saved to your favorites.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorite status.",
        variant: "destructive",
      });
    }
  };

  const deleteMessage = async (message: NetworkingMessage) => {
    try {
      const { error } = await supabase
        .from('networking_messages')
        .delete()
        .eq('id', message.id);

      if (error) throw error;

      setMessages(prev => prev.filter(m => m.id !== message.id));
      
      toast({
        title: "Message deleted",
        description: "Your message has been permanently deleted.",
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete message.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className="shadow-soft border-0">
        <CardHeader>
          <CardTitle>Your Message History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading your messages...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (messages.length === 0) {
    return (
      <Card className="shadow-soft border-0">
        <CardHeader>
          <CardTitle>Your Message History</CardTitle>
          <CardDescription>
            Your generated networking messages will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No messages generated yet.</p>
            <p className="text-sm">Create your first networking message above!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft border-0">
      <CardHeader>
        <CardTitle>Your Message History</CardTitle>
        <CardDescription>
          {messages.length} message{messages.length === 1 ? '' : 's'} generated
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {messages.map((message) => {
          const typeInfo = messageTypeLabels[message.message_type as keyof typeof messageTypeLabels];
          const TypeIcon = typeInfo.icon;
          const isCopied = copiedId === message.id;
          
          return (
            <Card key={message.id} className="relative border border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${typeInfo.color} text-white`}>
                      <TypeIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {typeInfo.label}
                        </Badge>
                        {message.is_favorite && (
                          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                        )}
                      </div>
                      <h4 className="font-medium">{message.recipient_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {message.recipient_title && `${message.recipient_title} at `}{message.company}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {message.purpose && (
                  <p className="text-sm text-muted-foreground mb-3 p-3 bg-muted/30 rounded-lg">
                    <strong>Purpose:</strong> {message.purpose}
                  </p>
                )}
                <div className="bg-trust p-4 rounded-lg border border-trust-foreground/10 mb-4">
                  <pre className="whitespace-pre-wrap text-sm text-trust-foreground font-mono leading-relaxed">
                    {message.generated_message}
                  </pre>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(message)}
                      className="gap-2"
                    >
                      {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {isCopied ? "Copied!" : "Copy"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleFavorite(message)}
                      className={`gap-2 ${message.is_favorite ? 'text-red-600 border-red-200 hover:bg-red-50' : ''}`}
                    >
                      <Heart className={`h-4 w-4 ${message.is_favorite ? 'fill-current' : ''}`} />
                      {message.is_favorite ? "Unfavorite" : "Favorite"}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMessage(message)}
                    className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
}