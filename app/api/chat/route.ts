import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

function formatMessageAsHTML(text: string): string {
  return text
    // Convert URLs to clickable links
    .replace(/\[(.*?)\]\((https?:\/\/[^\s]+)\)/g, '<a href="$2" target="_blank" class="text-blue-500 hover:text-blue-700 underline">$1</a>')
    // Format lists
    .replace(/^\s*[-*]\s+(.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*?<\/li>\s*)+/gs, '<ul class="list-disc pl-4 my-2">$&</ul>')
    // Format paragraphs
    .split('\n\n')
    .map(p => p.trim())
    .filter(p => p)
    .map(p => `<p class="mb-4">${p}</p>`)
    .join('');
}

export const maxDuration = 60;

export async function POST(request: Request) {
  const supabase = createClient();

  try {
    const { message, sessionId, title } = await request.json();
    
    if (!message) return NextResponse.json({ error: 'Message is required' }, { status: 400 });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized');

    const { error: userMessageError } = await supabase
      .from('chat_sessions')
      .insert({
        session_id: sessionId,
        user_id: user.id,
        title: title || message.substring(0, 50) + '...',
        sender: 'user',
        content: message
      });

    if (userMessageError) throw userMessageError;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);

    try {
      if (!process.env.LANGFLOW_API_URL || !process.env.LANGFLOW_API_KEY) {
        throw new Error('Langflow API configuration missing');
      }

      const response = await fetch(process.env.LANGFLOW_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LANGFLOW_API_KEY}`
        },
        body: JSON.stringify({
          input_value: message,
          output_type: "chat",
          input_type: "chat",
          tweaks: {}
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(`Langflow API error: ${response.status} - ${responseText}`);
      }

      const langflowData = await response.json();
      let aiMessage = '';

      if (langflowData.outputs?.[0]?.outputs?.[0]?.results?.message?.text) {
        aiMessage = langflowData.outputs[0].outputs[0].results.message.text;
      } else if (langflowData.outputs?.[0]?.outputs?.[0]?.artifacts?.message) {
        aiMessage = langflowData.outputs[0].outputs[0].artifacts.message;
      } else {
        console.error('Unexpected Langflow response structure:', JSON.stringify(langflowData, null, 2));
        aiMessage = 'Unable to parse AI response';
      }

      const formattedHTML = formatMessageAsHTML(aiMessage);

      const { error: aiMessageError } = await supabase
        .from('chat_sessions')
        .insert({
          session_id: sessionId,
          user_id: user.id,
          title: title || message.substring(0, 50) + '...',
          sender: 'ai',
          content: aiMessage
        });

      if (aiMessageError) throw aiMessageError;

      return NextResponse.json({ 
        message: aiMessage,
        html: formattedHTML,
        success: true
      });

    } catch (err: any) {
      if (err?.name === 'AbortError') {
        throw new Error('Langflow API request timed out');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }

  } catch (error) {
    console.error('Error in chat API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}