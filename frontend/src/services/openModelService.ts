/**
 * Autonomous Open AI Models Service for Radha Study Hall
 * Fetches real-time AI responses using open AI models directly (Zero API keys / Zero configuration required).
 */

import { processMessageLocally } from './localAiEngine.ts';
import { processJarvisMessage, getJarvisMemories } from './jarvisEngine.ts';
import type { ChatResponse } from './api.ts';

const SYSTEM_PROMPT = `You are Radha Jarvis, the intelligent executive AI copilot for Radha Study Hall.
You communicate just like ChatGPT: articulate, friendly, concise, and helpful. You can answer general questions, give study hall guidance, draft notices, calculate revenues, and log daily operations.

Radha Study Hall Profile:
- Active Students: 185 (Total capacity: 220 seats)
- Daily Operational Shifts:
  * Morning Shift: 6:00 AM – 12:00 PM
  * Afternoon Shift: 12:00 PM – 5:00 PM
  * Evening Shift: 5:00 PM – 11:00 PM
- Daily 8:00 PM WhatsApp Group Report is sent to administrators by 8:15 PM deadline.

Operational Rules:
1. When greeted (e.g., "hi", "hello", "hii", "hey"), respond warmly and ask how you can help with Radha Study Hall today.
2. When asked for suggestions, notice drafts, rules, or calculations, provide a well-structured, clear, actionable response.
3. If the user provides operational numbers (such as new admissions, fee collection amounts, shift attendance counts, or maintenance issues), acknowledge them clearly in your response and append a structured JSON block at the very end in this format:
<EXTRACTED_DATA>
{
  "newAdmissions": null,
  "feeCollected": null,
  "feePayingStudents": null,
  "eveningAttendance": null,
  "morningAttendance": null
}
</EXTRACTED_DATA>
Only include <EXTRACTED_DATA> when real numbers were mentioned.`;

export async function fetchOpenAiModelResponse(
  userMessage: string,
  history: Array<{ role: 'user' | 'assistant'; text: string }> = []
): Promise<ChatResponse> {
  const trimmed = userMessage.trim();

  // Inject user-taught operational memories into context
  const memories = getJarvisMemories();
  const memoryContext = memories.length > 0 
    ? `\n\nLearned Study Hall Custom Rules:\n${memories.map(m => `- [${m.category.toUpperCase()}] ${m.title}: ${m.content}`).join('\n')}`
    : '';

  const fullSystemPrompt = SYSTEM_PROMPT + memoryContext;

  // Try 1: Direct Open AI Model Inference (POST JSON)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const messages = [
      { role: 'system', content: fullSystemPrompt },
      ...history.slice(-4).map(h => ({ role: h.role, content: h.text })),
      { role: 'user', content: trimmed }
    ];

    const res = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/plain, application/json'
      },
      body: JSON.stringify({
        messages,
        model: 'openai',
        seed: 42
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().length > 0 && !text.includes('Free limit reached')) {
        return handleModelOutput(trimmed, text);
      }
    }
  } catch (err) {
    console.warn('Open Model POST attempt timed out or failed, trying GET endpoint fallback...', err);
  }

  // Try 2: Open Model GET Fallback
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const queryUrl = `https://text.pollinations.ai/${encodeURIComponent(trimmed)}?system=${encodeURIComponent(fullSystemPrompt)}&model=openai`;
    const res = await fetch(queryUrl, {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().length > 0 && !text.includes('Free limit reached')) {
        return handleModelOutput(trimmed, text);
      }
    }
  } catch (err) {
    console.warn('Open Model GET attempt failed, engaging built-in Jarvis engine...', err);
  }

  // Try 3: Built-in Autonomous Jarvis Copilot Engine (Guaranteed 100% offline uptime)
  return processJarvisMessage(trimmed);
}

function handleModelOutput(originalText: string, rawReply: string): ChatResponse {
  let cleanedReply = rawReply;
  let extracted: ChatResponse['extracted'] = {};

  // Check if model emitted operational data block
  const match = rawReply.match(/<EXTRACTED_DATA>([\s\S]*?)<\/EXTRACTED_DATA>/);
  if (match) {
    try {
      extracted = JSON.parse(match[1].trim());
      cleanedReply = rawReply.replace(/<EXTRACTED_DATA>[\s\S]*?<\/EXTRACTED_DATA>/, '').trim();
      processMessageLocally(originalText);
    } catch (e) {
      console.warn('Error parsing model extracted block:', e);
    }
  } else {
    // If user provided numbers, run local extractor as well to ensure dashboard stats update
    const local = processMessageLocally(originalText);
    if (local.extracted && Object.keys(local.extracted).length > 0) {
      extracted = local.extracted;
    }
  }

  return {
    messageId: 'open-model-' + Date.now(),
    reply: cleanedReply,
    intent: match ? 'OPERATIONAL_UPDATE' : 'OPEN_AI_CHAT',
    isCorrection: false,
    extracted,
    timestamp: new Date().toISOString()
  };
}
