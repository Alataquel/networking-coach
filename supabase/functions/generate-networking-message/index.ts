import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messageType, recipientName, recipientTitle, company, purpose } = await req.json();

    console.log('Generating message with params:', { messageType, recipientName, company });

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create a system prompt based on the message type
    const systemPrompts = {
      linkedin: `You are an expert at writing professional LinkedIn connection requests. Create concise, personalized messages that are warm but professional. Keep them under 300 characters (LinkedIn's limit). Focus on genuine interest and specific reasons for connecting.`,
      
      informational: `You are an expert at writing professional informational interview requests. Create thoughtful, respectful emails that show genuine interest in learning. Include specific questions about their career journey and industry insights. Be humble and acknowledge their valuable time.`,
      
      "recruiter-followup": `You are an expert at writing professional recruiter follow-up messages. Create engaging follow-ups that reiterate interest, highlight relevant qualifications, and maintain momentum in the conversation. Be enthusiastic but not pushy.`,
      
      "mentor-request": `You are an expert at writing mentorship request messages. Create thoughtful, respectful requests that demonstrate genuine commitment to learning and growth. Show appreciation for their expertise and be specific about what kind of guidance you're seeking.`
    };

    // Build the user prompt with all available information
    let userPrompt = `Please write a ${messageType === 'linkedin' ? 'LinkedIn connection request' : 'professional email'} with the following details:

- Message type: ${messageType}
- Recipient's name: ${recipientName}
- Company: ${company}`;

    if (recipientTitle) {
      userPrompt += `\n- Recipient's title: ${recipientTitle}`;
    }

    if (purpose) {
      userPrompt += `\n- Purpose/context: ${purpose}`;
    }

    userPrompt += `\n\nPlease make this message:
- Personalized and genuine
- Professional but approachable
- Specific to their role and company
- Concise and well-structured
${messageType === 'linkedin' ? '- Under 300 characters for LinkedIn' : '- Include a clear subject line if it\'s an email'}

Generate ONLY the message content, no additional explanations or formatting.`;

    console.log('Sending request to OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompts[messageType as keyof typeof systemPrompts] },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('OpenAI full response:', JSON.stringify(data, null, 2));
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected OpenAI response structure:', data);
      throw new Error('Invalid response structure from OpenAI');
    }
    
    const generatedMessage = data.choices[0].message.content;
    console.log('Extracted message:', generatedMessage);
    
    if (!generatedMessage || generatedMessage.trim() === '') {
      console.error('Empty message generated');
      throw new Error('OpenAI returned an empty message');
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: generatedMessage.trim()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-networking-message function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});