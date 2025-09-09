import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, MessageCircle, Users, Mail, ArrowRight, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type MessageType = "linkedin" | "informational" | "recruiter-followup" | "mentor-request";

interface MessageData {
  recipientName: string;
  recipientTitle: string;
  company: string;
  purpose: string;
  messageType: MessageType;
}

const messageTemplates = {
  linkedin: {
    title: "LinkedIn Connection Request",
    icon: Users,
    description: "Professional connection request for LinkedIn",
    template: (data: MessageData) => 
      `Hi ${data.recipientName},\n\nI'm a student and came across your profile. I was impressed by your work at ${data.company}. ${data.purpose}\n\nI'd love to connect and learn from your experience in the field.\n\nBest regards`
  },
  informational: {
    title: "Informational Interview Request",
    icon: MessageCircle,
    description: "Request a brief informational interview",
    template: (data: MessageData) => 
      `Subject: Informational Interview Request\n\nDear ${data.recipientName},\n\nI hope this email finds you well. I'm a student and discovered your profile through LinkedIn. I was impressed by your career journey at ${data.company}.\n\n${data.purpose}\n\nI would be incredibly grateful for 15-20 minutes of your time to learn about your experience and gain insights into the industry. I'm particularly interested in understanding:\n\n• Your career path and key decisions\n• Advice for someone entering the field\n• Current trends and challenges in the industry\n\nI'm flexible with timing and happy to work around your schedule. Would a brief phone call or video chat be possible in the coming weeks?\n\nThank you for considering my request. I understand you have a busy schedule and truly appreciate any time you can spare.\n\nBest regards`
  },
  "recruiter-followup": {
    title: "Recruiter Follow-up",
    icon: Mail,
    description: "Follow up after meeting with a recruiter",
    template: (data: MessageData) => 
      `Subject: Following up on our conversation\n\nHi ${data.recipientName},\n\nThank you for taking the time to speak with me about opportunities at ${data.company}. ${data.purpose}\n\nI wanted to follow up and reiterate my strong interest in joining your team. Based on our conversation, I'm even more excited about the possibility of contributing to ${data.company}'s mission.\n\nI've attached my updated resume and would be happy to provide any additional information you might need. Please let me know if there are any next steps I should be aware of.\n\nI look forward to hearing from you.\n\nBest regards`
  },
  "mentor-request": {
    title: "Mentorship Request",
    icon: Users,
    description: "Request ongoing mentorship relationship",
    template: (data: MessageData) => 
      `Subject: Mentorship Opportunity\n\nDear ${data.recipientName},\n\nI hope you're doing well. I'm a student and came across your profile. I was inspired by your career achievements at ${data.company}.\n\n${data.purpose}\n\nI'm writing to inquire about the possibility of a mentoring relationship. I'm passionate about growing in this field and would greatly value guidance from someone with your experience and expertise.\n\nI understand that mentoring is a significant commitment, and I want to assure you that I would:\n\n• Come prepared to our conversations with specific questions\n• Respect your time and schedule\n• Take action on the advice you provide\n• Keep you updated on my progress\n\nWould you be open to a brief conversation to discuss this possibility? I'm happy to accommodate your schedule and preferred communication method.\n\nThank you for considering this request.\n\nRespectfully`
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
    purpose: "",
    messageType: "linkedin"
  });
  
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const { toast } = useToast();

  const handleGenerate = () => {
    const template = messageTemplates[messageData.messageType];
    const message = template.template(messageData);
    setGeneratedMessage(message);
    setActiveStep(3);
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

  const isFormValid = messageData.recipientName && messageData.company;
  const currentTemplate = messageTemplates[messageData.messageType];

  return (
    <div className="min-h-screen bg-gradient-subtle py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-foreground">Networking Coach</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Craft professional, personalized messages to connect with alumni, recruiters, and mentors confidently. 
            No more awkward networking - just authentic, effective communication.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold transition-all ${
                activeStep >= 1 ? 'bg-primary text-primary-foreground shadow-professional' : 'bg-muted text-muted-foreground'
              }`}>
                1
              </div>
              <span className={`text-sm font-medium ${activeStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                Choose Type
              </span>
            </div>
            <div className={`h-0.5 w-20 transition-all ${activeStep >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className="flex items-center space-x-2">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold transition-all ${
                activeStep >= 2 ? 'bg-primary text-primary-foreground shadow-professional' : 'bg-muted text-muted-foreground'
              }`}>
                2
              </div>
              <span className={`text-sm font-medium ${activeStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                Fill Details
              </span>
            </div>
            <div className={`h-0.5 w-20 transition-all ${activeStep >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className="flex items-center space-x-2">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold transition-all ${
                activeStep >= 3 ? 'bg-primary text-primary-foreground shadow-professional' : 'bg-muted text-muted-foreground'
              }`}>
                3
              </div>
              <span className={`text-sm font-medium ${activeStep >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                Get Message
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Message Type Selection */}
          <Card className="lg:col-span-1 shadow-soft border-0 h-fit">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Choose Message Type
              </CardTitle>
              <CardDescription className="text-base">
                Select the type of message you want to send
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(messageTemplates).map(([key, template]) => {
                const TemplateIcon = template.icon;
                const isSelected = messageData.messageType === key;
                return (
                  <Button
                    key={key}
                    variant={isSelected ? "default" : "outline"}
                    className={`w-full p-4 h-auto transition-all text-left ${
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-professional border-primary' 
                        : 'hover:bg-trust hover:text-trust-foreground hover:border-accent border-border'
                    }`}
                    onClick={() => {
                      setMessageData(prev => ({...prev, messageType: key as MessageType}));
                      setActiveStep(Math.max(activeStep, 1));
                    }}
                  >
                    <div className="flex flex-col w-full">
                      <div className="flex items-center gap-2 mb-1">
                        <TemplateIcon className="h-4 w-4 flex-shrink-0" />
                        <span className="font-medium text-sm leading-tight">{template.title}</span>
                      </div>
                      <span className="text-xs opacity-80 text-left">{template.description}</span>
                    </div>
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          {/* Input Form */}
          <Card className="lg:col-span-2 shadow-soft border-0">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl flex items-center gap-2">
                <currentTemplate.icon className="h-5 w-5 text-primary" />
                {currentTemplate.title} Details
              </CardTitle>
              <CardDescription className="text-base">
                Fill in the information to generate your personalized message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipientName" className="text-sm font-medium">Recipient's Name *</Label>
                  <Input
                    id="recipientName"
                    value={messageData.recipientName}
                    onChange={(e) => {
                      setMessageData(prev => ({...prev, recipientName: e.target.value}));
                      if (e.target.value && activeStep < 2) setActiveStep(2);
                    }}
                    placeholder="e.g., Sarah Johnson"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipientTitle" className="text-sm font-medium">Their Job Title</Label>
                  <Input
                    id="recipientTitle"
                    value={messageData.recipientTitle}
                    onChange={(e) => setMessageData(prev => ({...prev, recipientTitle: e.target.value}))}
                    placeholder="e.g., Software Engineer"
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="text-sm font-medium">Company *</Label>
                <Input
                  id="company"
                  value={messageData.company}
                  onChange={(e) => setMessageData(prev => ({...prev, company: e.target.value}))}
                  placeholder="e.g., Microsoft"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose" className="text-sm font-medium">Purpose/Context</Label>
                <Textarea
                  id="purpose"
                  value={messageData.purpose}
                  onChange={(e) => setMessageData(prev => ({...prev, purpose: e.target.value}))}
                  placeholder="Why are you reaching out? What specific interest or connection do you have with this person or company?"
                  rows={4}
                  className="resize-none"
                />
              </div>

              <Button 
                onClick={handleGenerate} 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-professional h-12 text-base font-medium"
                disabled={!isFormValid}
              >
                Generate Message
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Generated Message & Tips */}
          <div className="lg:col-span-1 space-y-6">
            {generatedMessage && (
              <Card className="shadow-soft border-0">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Your Message</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      className="gap-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-trust p-4 rounded-lg border border-trust-foreground/10">
                    <pre className="whitespace-pre-wrap text-sm text-trust-foreground font-mono leading-relaxed">
                      {generatedMessage}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Conversation Starters */}
            <Card className="shadow-soft border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-accent" />
                  Conversation Starters
                </CardTitle>
                <CardDescription>
                  Great questions for informational interviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {conversationStarters.slice(0, 6).map((starter, index) => (
                    <div key={index} className="text-sm text-muted-foreground border-l-2 border-accent/30 pl-3 py-1">
                      {starter}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}