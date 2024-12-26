import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

const AZURE_ENDPOINT = process.env.AZURE_OPENAI_API_ENDPOINT;
const AZURE_KEY = process.env.AZURE_OPENAI_API_KEY;
const DEPLOYMENT_NAME = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

async function getEmbedding(text: string) {
  try {
    const response = await fetch(
      `${AZURE_ENDPOINT}/openai/deployments/${DEPLOYMENT_NAME}/embeddings?api-version=2024-02-15-preview`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': AZURE_KEY!,
        },
        body: JSON.stringify({
          input: text,
          model: 'text-embedding-ada-002'
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error getting embedding:', error);
    throw error;
  }
}

async function processDocument(text: string, metadata: any) {
  // Split text into chunks (simplified version)
  const chunkSize = 1000;
  const overlap = 100;
  const chunks = [];
  
  for (let i = 0; i < text.length; i += chunkSize - overlap) {
    chunks.push(text.slice(i, i + chunkSize));
  }

  const supabase = createClient();

  // Process each chunk
  for (const chunk of chunks) {
    const embedding = await getEmbedding(chunk);

    // Store in Supabase
    const { error } = await supabase
      .from('document_embeddings')
      .insert([
        {
          content: chunk,
          embedding,
          metadata
        }
      ]);

    if (error) throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { fileUrl, fileName, fileType } = await request.json();

    // Download the file content
    const response = await fetch(fileUrl);
    const text = await response.text();

    // Process the document
    await processDocument(text, { fileName, fileType });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing document:', error);
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    );
  }
}
