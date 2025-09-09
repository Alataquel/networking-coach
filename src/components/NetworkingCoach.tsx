import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Check, MessageCircle, Users, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type MessageType = "linkedin" | "informational" | "recruiter-followup" | "mentor-request";

interface MessageData {
  recipientName: string;
  recipientTitle: string;
  company: string;
  studentName: string;
  university: string;
  major: string;
  purpose: string;
  messageType: MessageType;
}

const messageTemplates = {
  linkedin: {
    title: "LinkedIn Connection Request",
    icon: Users,
    template: (data: MessageData) => 
      `Hi ${data.recipientName},\n\nI'm ${data.studentName}, a ${data.major} student at ${data.university}. I came across your profile and was impressed by your work at ${data.company}. ${data.purpose}\n\nI'd love to connect and learn from your experience in the field.\n\nBest regards,\n${data.studentName}`
  },
  informational: {
    title: "Informational Interview Request",
    icon: MessageCircle,
    template: (data: MessageData) => 
      `Subject: Informational Interview Request - ${data.major} Student at ${data.university}\n\nDear ${data.recipientName},\n\nI hope this email finds you well. My name is ${data.studentName}, and I'm a ${data.major} student at ${data.university}. I discovered your profile through LinkedIn and was impressed by your career journey at ${data.company}.\n\n${data.purpose}\n\nI would be incredibly grateful for 15-20 minutes of your time to learn about your experience and gain insights into the industry. I'm particularly interested in understanding:\n\n• Your career path and key decisions\n• Advice for someone entering the field\n• Current trends and challenges in the industry\n\nI'm flexible with timing and happy to work around your schedule. Would a brief phone call or video chat be possible in the coming weeks?\n\nThank you for considering my request. I understand you have a busy schedule and truly appreciate any time you can spare.\n\nBest regards,\n${data.studentName}\n${data.university}\n[Your Phone Number]\n[Your Email]`
  },
  "recruiter-followup": {
    title: "Recruiter Follow-up",
    icon: Mail,
    template: (data: MessageData) => 
      `Subject: Following up on our conversation - ${data.studentName}\n\nHi ${data.recipientName},\n\nThank you for taking the time to speak with me about opportunities at ${data.company}. ${data.purpose}\n\nI wanted to follow up and reiterate my strong interest in joining your team. Based on our conversation, I'm even more excited about the possibility of contributing to ${data.company}'s mission.\n\nI've attached my updated resume and would be happy to provide any additional information you might need. Please let me know if there are any next steps I should be aware of.\n\nI look forward to hearing from you.\n\nBest regards,\n${data.studentName}\n${data.university}\n[Your Phone Number]\n[Your Email]`
  },
  "mentor-request": {
    title: "Mentorship Request",
    icon: Users,
    template: (data: MessageData) => 
      `Subject: Mentorship Opportunity - ${data.major} Student at ${data.university}\n\nDear ${data.recipientName},\n\nI hope you're doing well. My name is ${data.studentName}, and I'm a ${data.major} student at ${data.university}. I came across your profile and was inspired by your career achievements at ${data.company}.\n\n${data.purpose}\n\nI'm writing to inquire about the possibility of a mentoring relationship. I'm passionate about growing in this field and would greatly value guidance from someone with your experience and expertise.\n\nI understand that mentoring is a significant commitment, and I want to assure you that I would:\n\n• Come prepared to our conversations with specific questions\n• Respect your time and schedule\n• Take action on the advice you provide\n• Keep you updated on my progress\n\nWould you be open to a brief conversation to discuss this possibility? I'm happy to accommodate your schedule and preferred communication method.\n\nThank you for considering this request.\n\nRespectfully,\n${data.studentName}\n${data.university}\n[Your Phone Number]\n[Your Email]`
  }
};

const conversationStarters = [
  "I noticed you transitioned from [previous role] to [current role]. What motivated that change?",
  "What's the most rewarding aspect of working at [company]?",
  "What skills do you think are most important for someone entering this field?",
  "How do you stay current with industry trends and developments?",
  "What would you do differently if you were starting your career today?",
  "Can you tell me about a typical day in your role?",
  "What's the biggest challenge facing your industry right now?",
  "How did you build your network when you were starting out?"
];

export default function NetworkingCoach() {
  const [messageData, setMessageData] = useState<MessageData>({
    recipientName: "",
    recipientTitle: "",
    company: "",
    studentName: "",
    university: "",
    major: "",
    purpose: "",
    messageType: "linkedin"
  });
  
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerate = () => {
    const template = messageTemplates[messageData.messageType];
    const message = template.template(messageData);
    setGeneratedMessage(message);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Message copied!",
      description: "Your message has been copied to clipboard.",
    });
  };

  const currentTemplate = messageTemplates[messageData.messageType];
  const Icon = currentTemplate.icon;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Networking Coach 🤝</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Craft professional, personalized messages to connect with alumni, recruiters, and mentors confidently.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-primary" />
              {currentTemplate.title}
            </CardTitle>
            <CardDescription>
              Fill in the details to generate a personalized message
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="messageType">Message Type</Label>
              <Select 
                value={messageData.messageType} 
                onValueChange={(value: MessageType) => 
                  setMessageData(prev => ({...prev, messageType: value}))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linkedin">LinkedIn Connection</SelectItem>
                  <SelectItem value="informational">Informational Interview</SelectItem>
                  <SelectItem value="recruiter-followup">Recruiter Follow-up</SelectItem>
                  <SelectItem value="mentor-request">Mentorship Request</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recipientName">Recipient Name</Label>
                <Input
                  id="recipientName"
                  value={messageData.recipientName}
                  onChange={(e) => setMessageData(prev => ({...prev, recipientName: e.target.value}))}
                  placeholder="John Smith"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientTitle">Their Title</Label>
                <Input
                  id="recipientTitle"
                  value={messageData.recipientTitle}
                  onChange={(e) => setMessageData(prev => ({...prev, recipientTitle: e.target.value}))}
                  placeholder="Software Engineer"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={messageData.company}
                onChange={(e) => setMessageData(prev => ({...prev, company: e.target.value}))}
                placeholder="Tech Corp"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentName">Your Name</Label>
                <Input
                  id="studentName"
                  value={messageData.studentName}
                  onChange={(e) => setMessageData(prev => ({...prev, studentName: e.target.value}))}
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="university">University</Label>
                <Input
                  id="university"
                  value={messageData.university}
                  onChange={(e) => setMessageData(prev => ({...prev, university: e.target.value}))}
                  placeholder="University of..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="major">Major/Field of Study</Label>
              <Input
                id="major"
                value={messageData.major}
                onChange={(e) => setMessageData(prev => ({...prev, major: e.target.value}))}
                placeholder="Computer Science"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose/Context</Label>
              <Textarea
                id="purpose"
                value={messageData.purpose}
                onChange={(e) => setMessageData(prev => ({...prev, purpose: e.target.value}))}
                placeholder="Why are you reaching out? What specific interest or connection do you have?"
                rows={3}
              />
            </div>

            <Button 
              onClick={handleGenerate} 
              className="w-full bg-professional hover:bg-professional/90"
              disabled={!messageData.recipientName || !messageData.studentName}
            >
              Generate Message
            </Button>
          </CardContent>
        </Card>

        {/* Generated Message */}
        <div className="space-y-4">
          {generatedMessage && (
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Generated Message</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="gap-2"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-trust p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm text-trust-foreground font-mono">
                    {generatedMessage}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conversation Starters */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Conversation Starters 💡</CardTitle>
              <CardDescription>
                Great questions to ask during informational interviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {conversationStarters.map((starter, index) => (
                  <li key={index} className="text-sm text-muted-foreground border-l-2 border-accent pl-3">
                    {starter}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}