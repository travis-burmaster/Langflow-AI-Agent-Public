import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// Function to chunk text into smaller segments
function chunkText(text: string, maxChunkSize: number = 1000): string[] {
  const chunks: string[] = [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxChunkSize) {
      currentChunk += sentence;
    } else {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

async function getEmbedding(text: string): Promise<number[]> {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;

  if (!endpoint || !apiKey) {
    throw new Error('Azure OpenAI endpoint or API key not configured');
  }

  try {
    // Construct the full endpoint URL for embeddings
    const apiUrl = `${endpoint}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        input: text
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Azure API error (${response.status}): ${errorData}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error getting embedding:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { content, fileName } = await request.json();
    const supabase = createClient();

    // Get the current user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Chunk the document
    const chunks = chunkText(content);
    
    // Process each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      // Get embedding from Azure OpenAI
      const embedding = await getEmbedding(chunk);

      // Store in Supabase
      const { error: insertError } = await supabase
        .from('documents')
        .insert({
          content: chunk,
          embedding,
          metadata: {
            fileName,
            chunkIndex: i,
            totalChunks: chunks.length
          }
          //,user_id: session.user.id
        });

      if (insertError) {
        throw insertError;
      }
    }

    return NextResponse.json({ 
      success: true,
      message: `Document processed into ${chunks.length} chunks and stored successfully`
    });
  } catch (error) {
    console.error('Error processing document:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}