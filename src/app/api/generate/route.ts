import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { context, format, type = 'post', identity = {} } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `
Role: You are a Web3 content assistant.
Identity DNA: Short sentences. No pidgin in posts. Never explain the joke. Never hedge. Use Gen-Z/CT slang ("math is mathing," "we move," "fr").
Persona: The Winner/The Menace. Never visibly lose on the timeline.
Rules: Never say "gm." Never beg for engagement. Never use phrases like "In today’s digital landscape."

CONTEXT: ${context}
FORMAT: ${format}
TYPE: ${type}

${type === 'post' ? `
Generate 3 distinct variants: "Straight," "Provocative," and "Meme energy."
Label them clearly as Variant 1: [Straight], Variant 2: [Provocative], Variant 3: [Meme energy].
Include a one-line "ANGLE: [Description]" for each.
Max 280 chars per post. No quotation marks. No explanations.
` : `
Generate 3 distinct replies based on the target post.
Label them clearly as Variant 1, Variant 2, Variant 3.
Constraint: Automatically strip "hedging" language like "IMO" or "I think" to maintain a confident tone.
Max 280 chars per reply. No quotation marks. No explanations.
`}
`;

    const result = await model.generateContent(systemPrompt);
    const text = result.response.text();

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
