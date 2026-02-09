import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    console.log('=== Starting evaluate-translation ===')
    
    // Check if API key exists
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found in environment')
      throw new Error('API Key not configured')
    }
    
    console.log('API Key found:', GEMINI_API_KEY.substring(0, 10) + '...')
    
    const body = await req.json()
    console.log('Request body:', body)
    
    const { originalPhrase, userTranslation, level, language } = body

    const prompt = `You are an English teacher evaluating a translation. Evaluate the following English translation from ${language}.

Original phrase in ${language}: "${originalPhrase}"
Student's English translation: "${userTranslation}"
Student's level: ${level}

Respond with ONLY a valid JSON object (no markdown, no code blocks) with these exact keys:
{
  "score": <number from 0 to 10>,
  "correction": "<the perfect English translation>",
  "explanation": "<pedagogical explanation in ${language}>",
  "tips": ["<tip 1 in ${language}>", "<tip 2 in ${language}>"]
}

Important: Return ONLY the JSON object, nothing else.`

    console.log('Calling Gemini API...')
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }),
      }
    )

    console.log('Gemini response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', errorText)
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('Gemini response data:', JSON.stringify(data))
    
    if (!data.candidates || data.candidates.length === 0) {
      console.error('No candidates in response')
      throw new Error('No response from Gemini')
    }
    
    let textResponse = data.candidates[0]?.content?.parts?.[0]?.text?.trim() || "{}"
    console.log('Raw text response:', textResponse)
    
    // Remove markdown code blocks if present
    textResponse = textResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    console.log('Cleaned text response:', textResponse)
    
    // Try to parse JSON
    let evaluation
    try {
      evaluation = JSON.parse(textResponse)
      console.log('Parsed evaluation:', evaluation)
    } catch (parseError) {
      console.error('Failed to parse JSON:', textResponse)
      console.error('Parse error:', parseError.message)
      throw new Error('Invalid JSON response from Gemini')
    }
    
    // Validate required fields
    if (!evaluation.score || !evaluation.correction || !evaluation.explanation || !evaluation.tips) {
      console.error('Missing required fields:', evaluation)
      throw new Error('Incomplete response from Gemini')
    }

    console.log('=== Success! Returning evaluation ===')
    
    return new Response(
      JSON.stringify(evaluation),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (error) {
    console.error('=== Error in evaluate-translation ===')
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    
    return new Response(
      JSON.stringify({
        score: 0,
        correction: "Could not evaluate. Please try again.",
        explanation: "Ocorreu um erro ao processar sua resposta.",
        tips: ["Tente novamente em instantes."],
        debug: error.message // Temporary debug info
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})
