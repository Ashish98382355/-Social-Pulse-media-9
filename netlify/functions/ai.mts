import type { Context } from '@netlify/functions'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({})

const PROMPTS: Record<string, (text: string, ctx?: string) => string> = {
  enhance: (text) =>
    `You are a social media expert. Rewrite this post to be more engaging, impactful and shareable while preserving the original meaning. Keep it under 280 characters. Return only the improved post text, no quotes or explanation.\n\nOriginal: ${text}`,
  summarize: (text) =>
    `Summarize this social media post in one concise, clear sentence. Return only the summary.\n\nPost: ${text}`,
  sentiment: (text) =>
    `Analyze the emotional tone of this text. Return ONLY one of these exact words: Positive, Negative, or Neutral.\n\nText: ${text}`,
  hashtags: (text) =>
    `Generate 5 highly relevant trending hashtags for this social media post. Return only the hashtags separated by spaces, starting each with #.\n\nPost: ${text}`,
  tone: (text, ctx) =>
    `Rewrite this social media post in a ${ctx} tone while keeping the same core message. Return only the rewritten text.\n\nOriginal: ${text}`,
  reply: (text) =>
    `Suggest a thoughtful, engaging reply to this social media post. Keep it under 120 characters and make it genuine. Return only the reply text.\n\nPost: ${text}`,
  viral_score: (text) =>
    `Rate the viral potential of this social media post on a scale from 1 to 100. Consider engagement potential, emotional impact, shareability, and relevance. Return ONLY the numeric score.\n\nPost: ${text}`,
  safety: (text) =>
    `Evaluate if this text is safe for a public social media platform. Check for harmful content, hate speech, personal information exposure, or inappropriate content. Reply with "SAFE" or "UNSAFE: [brief reason]".\n\nText: ${text}`,
  complete: (text) =>
    `Complete this unfinished social media post naturally and engagingly. Continue from where it ends. Return the full completed post (original + completion), max 280 characters.\n\nIncomplete post: ${text}`,
  image_prompt: (text) =>
    `Create a detailed, vivid image generation prompt for an AI image creator based on this social media post. Make it artistic and specific. Return only the image prompt.\n\nPost: ${text}`,
}

export default async (req: Request, _context: Context) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const body = await req.json()
    const { action, text, context: ctx } = body as {
      action: string
      text: string
      context?: string
    }

    if (!action || !text) {
      return Response.json({ error: 'action and text are required' }, { status: 400 })
    }

    const promptFn = PROMPTS[action]
    if (!promptFn) {
      return Response.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }

    const prompt = promptFn(text, ctx)

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    })

    return Response.json({ result: response.text?.trim() ?? '' })
  } catch (err) {
    console.error('AI function error:', err)
    return Response.json({ error: 'AI request failed' }, { status: 500 })
  }
}

export const config = {
  path: '/api/ai',
}
