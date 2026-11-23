/**
 * OpenAI ChatGPT Integration Engine for Radha Study Hall
 * Connects directly to OpenAI's Chat Completions API (gpt-4o, gpt-4o-mini)
 * providing a full ChatGPT experience for study hall management, advice, and operations.
 */

import { processMessageLocally } from './localAiEngine.ts';
import type { ChatResponse } from './api.ts';

const STORAGE_KEY_OPENAI = 'radha_openai_config_v2';

export interface OpenAiConfig {
  apiKey: string;
  model: string;
  isEnabled: boolean;
}

const DEFAULT_CONFIG: OpenAiConfig = {
  apiKey: '',
  model: 'gpt-4o-mini',
  isEnabled: false
};

export function getOpenAiConfig(): OpenAiConfig {
  if (typeof localStorage === 'undefined') return DEFAULT_CONFIG;
  const raw = localStorage.getItem(STORAGE_KEY_OPENAI);
  if (!raw) return DEFAULT_CONFIG;
  try {
    const parsed = JSON.parse(raw);
    return {
      apiKey: parsed.apiKey || '',
      model: parsed.model || 'gpt-4o-mini',
      isEnabled: Boolean(parsed.apiKey && parsed.isEnabled)
    };
  } catch (e) {
    return DEFAULT_CONFIG;
  }
}

export function saveOpenAiConfig(config: OpenAiConfig) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_OPENAI, JSON.stringify(config));
  }
}

export async function testOpenAiKey(apiKey: string, model = 'gpt-4o-mini'): Promise<{ success: boolean; message: string }> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    return { success: false, message: 'Please enter an OpenAI API key (starts with sk-...)' };
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cleanKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Say hello in 3 words' }],
        max_tokens: 10
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const errMsg = errData.error?.message || `OpenAI returned status ${res.status}`;
      return { success: false, message: errMsg };
    }

    return { success: true, message: `Connected successfully to OpenAI ${model}!` };
  } catch (err: any) {
    return { success: false, message: err.message || 'Network error reaching api.openai.com' };
  }
}

export async function callOpenAiChatGPT(
  userMessage: string,
  history: Array<{ role: 'user' | 'assistant'; text: string }> = []
): Promise<ChatResponse> {
  const config = getOpenAiConfig();
  if (!config.apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const systemPrompt = `You are Radha Jarvis, an expert executive AI assistant and operational copilot for Radha Study Hall, powered by OpenAI.
You communicate just like ChatGPT: articulate, friendly, highly intelligent, and ready to handle any request.

Radha Study Hall Context:
- Active Students: 185 (Total Capacity: 220 seats)
- Daily Shifts: Morning (6:00 AM – 12:00 PM), Afternoon (12:00 PM – 5:00 PM), Evening (5:00 PM – 11:00 PM)
- 8:00 PM Daily WhatsApp Report compiles automatically with an 8:15 PM dispatch deadline.

Your Capabilities:
1. Conversational Excellence: Answer any greeting, questions, drafting requests, marketing ideas, or general knowledge naturally like ChatGPT.
2. WhatsApp Notices: Whenever asked to draft an announcement (e.g. quiet hours, fees, power cuts), format it with WhatsApp emojis and professional styling.
3. Operations Tracking: If the user provides real daily operational numbers (new admissions, fee collections, shift attendance count, or facility repairs), acknowledge them clearly.

IMPORTANT: When the user shares actual operational numbers (admissions, fees, shift attendance, or maintenance complaints), append an XML block at the very end of your response with extracted JSON so the app can update the database and WhatsApp report:
<EXTRACTED_DATA>
{
  "newAdmissions": 5,
  "feeCollected": 12500,
  "feePayingStudents": 12,
  "morningAttendance": null,
  "afternoonAttendance": null,
  "eveningAttendance": 85,
  "maintenanceItems": [
    {"equipment": "AC", "location": "ROOM 2", "issue": "AC in Room 2 is not working", "priority": "HIGH"}
  ]
}
</EXTRACTED_DATA>
If no operational data was provided in the message, do not include the <EXTRACTED_DATA> tag.`;

  const messagesPayload: Array<{ role: string; content: string }> = [
    { role: 'system', content: systemPrompt }
  ];

  // Append recent history context (last 6 messages)
  const recentHistory = history.slice(-6);
  for (const h of recentHistory) {
    messagesPayload.push({
      role: h.role,
      content: h.text
    });
  }

  messagesPayload.push({
    role: 'user',
    content: userMessage
  });

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey.trim()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: config.model || 'gpt-4o-mini',
      messages: messagesPayload,
      temperature: 0.7,
      max_tokens: 800
    })
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    const errText = errorJson.error?.message || `OpenAI API error ${res.status}`;
    throw new Error(errText);
  }

  const data = await res.json();
  const rawReply: string = data.choices?.[0]?.message?.content || '';

  // Parse any extracted data block
  let cleanedReply = rawReply;
  let extracted: ChatResponse['extracted'] = {};

  const match = rawReply.match(/<EXTRACTED_DATA>([\s\S]*?)<\/EXTRACTED_DATA>/);
  if (match) {
    try {
      extracted = JSON.parse(match[1].trim());
      cleanedReply = rawReply.replace(/<EXTRACTED_DATA>[\s\S]*?<\/EXTRACTED_DATA>/, '').trim();

      // Apply extracted numbers into local stats so 8:00 PM report compiles
      processMessageLocally(userMessage);
    } catch (e) {
      console.warn('Failed to parse OpenAI extracted data JSON:', e);
    }
  }

  return {
    messageId: 'openai-' + Date.now(),
    reply: cleanedReply,
    intent: match ? 'OPERATIONAL_UPDATE' : 'OPENAI_CHAT',
    isCorrection: false,
    extracted,
    timestamp: new Date().toISOString()
  };
}
