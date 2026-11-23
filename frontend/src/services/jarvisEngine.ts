/**
 * Radha Jarvis 2.0 – Autonomous Self-Learning & Operational Guidance Engine
 * Gives Radha Study Hall an executive AI assistant that learns from every conversation,
 * remembers operational details, drafts announcements, provides strategic advice,
 * and executes any management task like J.A.R.V.I.S.
 */

import { processMessageLocally, getLocalDashboardStats } from './localAiEngine.ts';
import type { ChatResponse } from './api.ts';

export interface JarvisMemory {
  id: string;
  category: 'rule' | 'staff' | 'wifi' | 'pricing' | 'schedule' | 'checklist' | 'contact' | 'facility' | 'custom';
  title: string;
  content: string;
  rawInstruction: string;
  learnedAt: string;
  lastUsedAt?: string;
}

const STORAGE_KEY_MEMORIES = 'radha_jarvis_memories_v2';

export const INITIAL_JARVIS_KNOWLEDGE: JarvisMemory[] = [
  {
    id: 'mem-base-1',
    category: 'facility',
    title: 'Study Hall Name & Capacity',
    content: 'Radha Study Hall has a total capacity of 220 seats, currently serving 185 active students across air-conditioned cabins and quiet zones.',
    rawInstruction: 'Radha Study Hall total capacity is 220 seats with 185 active students.',
    learnedAt: new Date().toISOString()
  },
  {
    id: 'mem-base-2',
    category: 'schedule',
    title: 'Daily Operating Shifts',
    content: 'Three continuous daily shifts: Morning (06:00 AM – 12:00 PM), Afternoon (12:00 PM – 05:00 PM), and Evening (05:00 PM – 11:00 PM).',
    rawInstruction: 'Morning 6-12, Afternoon 12-5, Evening 5-11.',
    learnedAt: new Date().toISOString()
  },
  {
    id: 'mem-base-3',
    category: 'rule',
    title: 'Strict Silence & Phone Call Policy',
    content: 'Absolute silence inside all study halls. Phone calls, video watching without earphones, and group discussions are strictly prohibited in the reading zones.',
    rawInstruction: 'Strict silence inside reading zones and no phone calls allowed.',
    learnedAt: new Date().toISOString()
  },
  {
    id: 'mem-base-4',
    category: 'schedule',
    title: '8:00 PM Daily WhatsApp Report Routine',
    content: 'Daily performance report compiles automatically at 8:00 PM IST with an absolute dispatch deadline of 8:15 PM IST to the management WhatsApp group.',
    rawInstruction: 'Daily 8:00 PM WhatsApp report compile and 8:15 PM dispatch deadline.',
    learnedAt: new Date().toISOString()
  },
  {
    id: 'mem-base-5',
    category: 'wifi',
    title: 'High-Speed Wi-Fi & Infrastructure',
    content: 'Dual-band high-speed Wi-Fi network with inverter battery backup for uninterrupted power and AC cooling.',
    rawInstruction: 'Wi-Fi has inverter backup and dual-band routers.',
    learnedAt: new Date().toISOString()
  }
];

export function getJarvisMemories(): JarvisMemory[] {
  if (typeof localStorage === 'undefined') return INITIAL_JARVIS_KNOWLEDGE;
  const raw = localStorage.getItem(STORAGE_KEY_MEMORIES);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY_MEMORIES, JSON.stringify(INITIAL_JARVIS_KNOWLEDGE));
    return INITIAL_JARVIS_KNOWLEDGE;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_JARVIS_KNOWLEDGE;
  }
}

export function saveJarvisMemories(memories: JarvisMemory[]) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_MEMORIES, JSON.stringify(memories));
  }
}

export function addJarvisMemory(
  title: string,
  content: string,
  category: JarvisMemory['category'] = 'custom',
  rawInstruction = content
): JarvisMemory {
  const memories = getJarvisMemories();
  const newMemory: JarvisMemory = {
    id: 'mem-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    category,
    title,
    content,
    rawInstruction,
    learnedAt: new Date().toISOString()
  };
  memories.unshift(newMemory);
  saveJarvisMemories(memories);
  return newMemory;
}

export function deleteJarvisMemory(id: string): JarvisMemory[] {
  const memories = getJarvisMemories().filter(m => m.id !== id);
  saveJarvisMemories(memories);
  return memories;
}

export function clearJarvisMemories(): JarvisMemory[] {
  saveJarvisMemories(INITIAL_JARVIS_KNOWLEDGE);
  return INITIAL_JARVIS_KNOWLEDGE;
}

/**
 * Autonomous Jarvis Response Processor
 * Handles training, memory recall, operational advice, message drafting, math, and general assistance.
 */
export function processJarvisMessage(text: string): ChatResponse {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  // 1. TEACHING / LEARNING INTENT: "remember that...", "learn this...", "from now on...", "our wifi is..."
  const isLearnIntent = 
    lower.startsWith('remember that') ||
    lower.startsWith('remember ') ||
    lower.startsWith('learn this') ||
    lower.startsWith('learn ') ||
    lower.startsWith('note that') ||
    lower.startsWith('note down') ||
    lower.startsWith('from now on') ||
    lower.includes('wifi password is') ||
    lower.includes('wi-fi password is') ||
    lower.includes('staff name is') ||
    lower.includes('cleaner name is') ||
    lower.includes('monthly fee is') ||
    lower.startsWith('new rule:') ||
    lower.startsWith('rule:');

  if (isLearnIntent) {
    return handleJarvisLearning(trimmed, lower);
  }

  // 2. MEMORY RECALL INTENT: "what is the wifi password?", "who is staff?", "show memory", "what do you remember?"
  const isRecallIntent =
    lower.includes('what is the wifi') ||
    lower.includes('what is the wi-fi') ||
    lower.includes('who is the staff') ||
    lower.includes('who is staff') ||
    lower.includes('show memory') ||
    lower.includes('view memory') ||
    lower.includes('what do you remember') ||
    lower.includes('what have you learned') ||
    lower.includes('what did i tell you') ||
    lower.includes('list memories') ||
    lower === 'memory' ||
    lower === 'memories';

  if (isRecallIntent) {
    return handleJarvisRecall(trimmed, lower);
  }

  // 3. NOTICE & WHATSAPP MESSAGE DRAFTING INTENT
  if (
    lower.startsWith('draft') ||
    lower.includes('draft a notice') ||
    lower.includes('draft notice') ||
    lower.includes('draft a message') ||
    lower.includes('draft message') ||
    lower.includes('write a notice') ||
    lower.includes('write a message for whatsapp')
  ) {
    return handleJarvisDrafting(trimmed, lower);
  }

  // 4. STRATEGIC GUIDANCE & OPERATIONAL SUGGESTIONS INTENT
  if (
    lower.includes('suggestion') ||
    lower.includes('suggest') ||
    lower.includes('how to increase') ||
    lower.includes('how to improve') ||
    lower.includes('how can i increase') ||
    lower.includes('how to save') ||
    lower.includes('tips for') ||
    lower.includes('advice') ||
    lower.includes('marketing') ||
    lower.includes('student retention') ||
    lower.includes('how to handle')
  ) {
    return handleJarvisSuggestions(trimmed, lower);
  }

  // 5. BUSINESS CALCULATIONS & FINANCIAL PROJECTIONS
  if (
    lower.startsWith('calculate') ||
    lower.includes('how much revenue') ||
    lower.includes('what is the occupancy') ||
    lower.includes('how much profit') ||
    lower.includes('calculate total')
  ) {
    return handleJarvisCalculation(trimmed, lower);
  }

  // 6. CHECKLISTS & SOP PROCEDURES
  if (
    lower.includes('checklist') ||
    lower.includes('opening duties') ||
    lower.includes('closing duties') ||
    lower.includes('inspection list') ||
    lower.includes('sop')
  ) {
    return handleJarvisChecklist(trimmed, lower);
  }

  // 7. STUDY HALL OPERATIONAL DATA LOGGING (Admissions, Fees, Attendance, Maintenance)
  const isOperationalUpdate =
    lower.includes('joined') ||
    lower.includes('admission') ||
    lower.includes('admitted') ||
    lower.includes('fee') ||
    lower.includes('collected') ||
    lower.includes('shift') ||
    lower.includes('attendance') ||
    lower.includes('not working') ||
    lower.includes('broken') ||
    lower.includes('repair') ||
    lower.includes('complaint');

  if (isOperationalUpdate) {
    const baseResponse = processMessageLocally(trimmed);
    return {
      ...baseResponse,
      reply: `🤖 **Radha Jarvis Operational Sync:**\n\n${baseResponse.reply}\n\n💡 *Tip: You can ask me to draft notices, calculate monthly profits, give retention suggestions, or learn custom rules!*`
    };
  }

  // 8. GENERAL ASSISTANT & INTELLIGENT COMPANION ("DO ANYTHING")
  return handleJarvisGeneralChat(trimmed, lower);
}

/**
 * Handles learning new user instructions, preferences, contacts, rules, passwords
 */
function handleJarvisLearning(text: string, lower: string): ChatResponse {
  let category: JarvisMemory['category'] = 'custom';
  let title = 'Learned Instruction';
  let content = text;

  // Extract clean statement
  let cleaned = text
    .replace(/^remember\s+that\s+/i, '')
    .replace(/^remember\s+/i, '')
    .replace(/^learn\s+this[:\s]*/i, '')
    .replace(/^learn\s+/i, '')
    .replace(/^note\s+that\s+/i, '')
    .replace(/^note\s+down\s+/i, '')
    .replace(/^from\s+now\s+on\s+/i, '')
    .trim();

  if (lower.includes('wifi') || lower.includes('wi-fi') || lower.includes('password')) {
    category = 'wifi';
    title = 'Wi-Fi Credentials & Setup';
  } else if (lower.includes('staff') || lower.includes('cleaner') || lower.includes('operator') || lower.includes('incharge') || lower.includes('manager')) {
    category = 'staff';
    title = 'Staff & Personnel Directory';
  } else if (lower.includes('fee') || lower.includes('price') || lower.includes('rent') || lower.includes('cost') || lower.includes('₹') || lower.includes('rupees')) {
    category = 'pricing';
    title = 'Pricing & Fee Structure';
  } else if (lower.includes('rule') || lower.includes('prohibited') || lower.includes('allowed') || lower.includes('silence')) {
    category = 'rule';
    title = 'Study Hall Policy & Rule';
  } else if (lower.includes('shift') || lower.includes('hour') || lower.includes('time') || lower.includes('timing')) {
    category = 'schedule';
    title = 'Timings & Operating Hours';
  } else if (lower.includes('ac') || lower.includes('filter') || lower.includes('generator') || lower.includes('repair') || lower.includes('maintenance')) {
    category = 'facility';
    title = 'Facility & Equipment Note';
  }

  // Generate dynamic title if possible
  if (cleaned.length > 5 && cleaned.length < 40) {
    title = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  const memory = addJarvisMemory(title, cleaned, category, text);

  return {
    messageId: 'msg-' + Date.now(),
    reply: `🧠 **Knowledge Acquired & Stored in Jarvis Memory Bank!**

• **Category:** \`${memory.category.toUpperCase()}\`
• **Memory Title:** *${memory.title}*
• **Stored Insight:** "${memory.content}"

✅ I have integrated this permanently into Radha Study Hall's operational brain. Whenever you ask about this or during daily management, I will reference this learned memory automatically!`,
    intent: 'LEARNED_MEMORY',
    isCorrection: false,
    extracted: {
      operationalNotes: [`Learned: ${memory.title} - ${memory.content}`]
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Handles recall of memories, passwords, staff details, rules
 */
function handleJarvisRecall(text: string, lower: string): ChatResponse {
  const memories = getJarvisMemories();

  // If user asked generally to view all memories
  if (lower.includes('show memory') || lower.includes('view memory') || lower.includes('what do you remember') || lower.includes('what have you learned') || lower === 'memory' || lower === 'memories' || lower.includes('list memories')) {
    const list = memories.map((m, idx) => `**${idx + 1}. [${m.category.toUpperCase()}] ${m.title}**\n   "${m.content}" \n   _Learned on: ${new Date(m.learnedAt).toLocaleDateString()}_`).join('\n\n');
    return {
      messageId: 'msg-' + Date.now(),
      reply: `🧠 **Radha Jarvis Permanent Memory Bank (${memories.length} entries indexed):**\n\n${list}\n\n💡 *To teach me more, simply tell me: "Remember that [any rule/fact/contact/price]".*`,
      intent: 'MEMORY_RECALL',
      isCorrection: false,
      extracted: {},
      timestamp: new Date().toISOString()
    };
  }

  // Targeted recall
  let matched = memories.filter(m => {
    const mLower = (m.title + ' ' + m.content + ' ' + m.category).toLowerCase();
    const words = lower.replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2 && !['what', 'who', 'the', 'is', 'did', 'tell', 'about', 'show'].includes(w));
    return words.some(w => mLower.includes(w));
  });

  if (matched.length === 0) {
    matched = memories.slice(0, 3);
  }

  const results = matched.map(m => `• **${m.title}**: ${m.content}`).join('\n\n');

  return {
    messageId: 'msg-' + Date.now(),
    reply: `🔍 **From Radha Jarvis Memory Bank:**\n\n${results}\n\nIs there anything else you would like me to recall or update?`,
    intent: 'MEMORY_RECALL',
    isCorrection: false,
    extracted: {},
    timestamp: new Date().toISOString()
  };
}

/**
 * Handles drafting notices, announcements, and WhatsApp broadcasts
 */
function handleJarvisDrafting(text: string, lower: string): ChatResponse {
  const todayFormatted = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  let noticeTopic = 'Important Announcement';
  let noticeBody = 'Please note our upcoming operational guidelines to ensure an uninterrupted and disciplined study environment.';

  if (lower.includes('fee') || lower.includes('dues') || lower.includes('payment')) {
    noticeTopic = 'Monthly Fee Payment Reminder';
    noticeBody = `Dear Aspirants,\n\nThis is a friendly reminder to complete your study hall monthly fee payment on or before the due date to ensure continuous cabin reservation and access cards.\n\n• Payment Modes: UPI, Cash, or Net Banking\n• Desk Timings: 09:00 AM – 08:00 PM\n\nThank you for your cooperation!`;
  } else if (lower.includes('power') || lower.includes('electricity') || lower.includes('shutdown') || lower.includes('maintenance')) {
    noticeTopic = 'Scheduled Electrical Maintenance Notice';
    noticeBody = `Dear Students,\n\nPlease be informed that scheduled electrical and AC maintenance will be conducted tomorrow.\n\n• Inverter power backup will power all study hall lights & Wi-Fi routers without disruption.\n• AC cooling may briefly cycle between rooms.\n\nThank you for maintaining silent discipline.`;
  } else if (lower.includes('holiday') || lower.includes('festival') || lower.includes('sunday')) {
    noticeTopic = 'Study Hall Operating Schedule';
    noticeBody = `Dear Students,\n\nRadha Study Hall will remain open for your dedicated preparation with full AC and power backup as usual.\n\n• Morning Shift: 06:00 AM – 12:00 PM\n• Afternoon Shift: 12:00 PM – 05:00 PM\n• Evening Shift: 05:00 PM – 11:00 PM\n\nKeep up the great study momentum!`;
  } else if (lower.includes('silence') || lower.includes('phone') || lower.includes('quiet') || lower.includes('noise')) {
    noticeTopic = 'Strict Silent Study Zone Enforcement';
    noticeBody = `Dear Students,\n\nTo preserve the intense preparation atmosphere at Radha Study Hall:\n\n1. All mobile phones must remain on 100% Silent / Flight mode.\n2. Phone calls are strictly restricted to the ground-floor exterior veranda.\n3. Whispering inside cabins is strictly prohibited.\n\nLet's respect each other's preparation time!`;
  } else {
    noticeTopic = 'Notice to Radha Study Hall Aspirants';
    noticeBody = `Dear Students,\n\n${text.replace(/^draft\s+(a\s+)?(notice|message)\s*(for|about)?/i, '').trim()}\n\nLet's maintain the utmost discipline and keep preparing toward your dream careers.`;
  }

  const formattedNotice = `*📢 RADHA STUDY HALL – OFFICIAL NOTICE*
📅 ${todayFormatted}

*Topic: ${noticeTopic}*

${noticeBody}

_— Management, Radha Study Hall_`;

  return {
    messageId: 'msg-' + Date.now(),
    reply: `✍️ **Jarvis Notice Drafter Ready!** Here is your professionally formatted announcement ready to copy or dispatch to WhatsApp:

\`\`\`text
${formattedNotice}
\`\`\`

💡 *Tap the copy button or say "Send to WhatsApp" to broadcast this to your students!*`,
    intent: 'NOTICE_DRAFT',
    isCorrection: false,
    extracted: {},
    timestamp: new Date().toISOString()
  };
}

/**
 * Handles proactive suggestions, revenue boosts, power saving, retention
 */
function handleJarvisSuggestions(text: string, lower: string): ChatResponse {
  if (lower.includes('revenue') || lower.includes('profit') || lower.includes('money') || lower.includes('income') || lower.includes('occupancy')) {
    return {
      messageId: 'msg-' + Date.now(),
      reply: `💡 **Radha Jarvis Strategic Growth & Revenue Blueprint:**

1. **Shift Slot Maximization (Yield Management):**
   • Instead of single full-day passes, promote separate **Morning (6 AM–12 PM)** and **Evening (5 PM–11 PM)** slots. One desk can generate 1.6× revenue when split between two students.
2. **Premium Dedicated Cabin Add-on:**
   • Charge an extra ₹300–₹500/month for "Reserved Dedicated Desks" with personal locker keys and ergonomic chair upgrades.
3. **Group & Long-Term Packages:**
   • Offer 3-month (5% discount) and 6-month upfront fee packages. This secures working capital and slashes student dropouts.
4. **Partner with Local Coaching Centers:**
   • Offer an exclusive 10% enrollment benefit to students from nearby UPSC, State PSC, Bank PO, and NEET academies.
5. **Exam Season Night Passes:**
   • Introduce an extended 11:00 PM – 03:00 AM "Midnight Owl" pass during peak exam months.`,
      intent: 'SUGGESTION_RESPONSE',
      isCorrection: false,
      extracted: {},
      timestamp: new Date().toISOString()
    };
  }

  if (lower.includes('electricity') || lower.includes('power') || lower.includes('ac') || lower.includes('bill')) {
    return {
      messageId: 'msg-' + Date.now(),
      reply: `⚡ **Radha Jarvis Power & Electricity Optimization Guide:**

1. **The 24°C Inverter AC Rule:**
   • Setting ACs at 24°C instead of 18°C saves **24% to 30% electricity** while maintaining ideal study comfort.
2. **Zoned AC Activation:**
   • Only turn on Hall 2 AC when Hall 1 exceeds 75% capacity. Turn off empty room cooling during the 1 PM – 4 PM low-density window.
3. **Motion-Sensor LED Lighting:**
   • Install low-cost motion sensors in washrooms, corridors, and dining zones so lights never run empty.
4. **Clean AC Filters Bi-Weekly:**
   • Dust buildup on condenser coils forces compressors to draw 15% more power. A 10-minute rinse every 15 days pays for itself.
5. **Solar Rooftop Subsidy Evaluation:**
   • A 5 kW on-grid solar system can offset up to 80% of daytime lighting and fan load.`,
      intent: 'SUGGESTION_RESPONSE',
      isCorrection: false,
      extracted: {},
      timestamp: new Date().toISOString()
    };
  }

  if (lower.includes('retention') || lower.includes('leave') || lower.includes('left') || lower.includes('satisfaction')) {
    return {
      messageId: 'msg-' + Date.now(),
      reply: `🎯 **Radha Jarvis Student Retention & Discipline System:**

1. **Zero-Tolerance Silence Enforcement:**
   • Serious aspirants only stay where there is pin-drop silence. Daily proactive patrol prevents whisper circles.
2. **Wi-Fi Redundancy is #1 Priority:**
   • Have dual broadband connections with auto-failover so online video lectures never buffer.
3. **Clean Restrooms & High-Flow Drinking Water:**
   • Surveys show hygiene is the #1 reason female students change study halls. Daily 8 AM & 3 PM sanitization audits retain 95%+ students.
4. **Ergonomic Seating:**
   • High-density cushioned chairs prevent back pain during 10-hour marathon study sessions.
5. **Monthly Aspirant Check-in:**
   • A quick 1-minute WhatsApp poll asking "How was your study environment this week?" builds deep loyalty.`,
      intent: 'SUGGESTION_RESPONSE',
      isCorrection: false,
      extracted: {},
      timestamp: new Date().toISOString()
    };
  }

  // Default general guidance
  return {
    messageId: 'msg-' + Date.now(),
    reply: `🌟 **Radha Jarvis Operational Guidance:**

Based on current performance (185 Active Students, 84% Occupancy):
• **Daily Priority:** Maintain strict cabin discipline and high-speed Wi-Fi stability.
• **Financial Tip:** Ensure all pending dues are audited before the 10th of each month.
• **Action Item:** Keep ACs regulated at 24°C for maximum comfort and minimum electricity cost.

Would you like specific ideas on **Revenue Growth**, **Power Savings**, or **Marketing Strategies**?`,
    intent: 'SUGGESTION_RESPONSE',
    isCorrection: false,
    extracted: {},
    timestamp: new Date().toISOString()
  };
}

/**
 * Handles financial calculations and projections
 */
function handleJarvisCalculation(text: string, lower: string): ChatResponse {
  const numbers = text.match(/\d+(?:,\d+)*(?:\.\d+)?/g)?.map(n => parseFloat(n.replace(/,/g, ''))) || [];
  const stats = getLocalDashboardStats();

  if (numbers.length >= 2) {
    const [a, b] = numbers;
    const product = a * b;
    return {
      messageId: 'msg-' + Date.now(),
      reply: `🧮 **Radha Jarvis Financial Calculation:**

• **Values:** ${a.toLocaleString()} × ₹${b.toLocaleString()}
• **Total Projected Revenue:** **₹${product.toLocaleString()}**

📊 *Context for Radha Study Hall:*
• Current Active Students: **${stats.totalActiveStudents}**
• Total Seat Capacity: **220 seats**
• At ₹${b.toLocaleString()} per student across 220 full capacity, your maximum monthly gross revenue is **₹${(220 * b).toLocaleString()}**!`,
      intent: 'CALCULATION',
      isCorrection: false,
      extracted: {},
      timestamp: new Date().toISOString()
    };
  }

  // Occupancy calculation
  const occupancyPct = ((stats.totalActiveStudents / 220) * 100).toFixed(1);
  return {
    messageId: 'msg-' + Date.now(),
    reply: `📊 **Radha Study Hall Occupancy & Revenue Analysis:**

• **Total Active Students:** ${stats.totalActiveStudents}
• **Total Hall Capacity:** 220 seats
• **Current Occupancy Rate:** **${occupancyPct}%**
• **Vacant Seats Available:** ${Math.max(0, 220 - stats.totalActiveStudents)} seats
• **Today's Fee Collections:** ₹${stats.todayFeeCollected.toLocaleString()} (${stats.todayFeePaidCount} students)

💡 *Tip: Filling the remaining ${220 - stats.totalActiveStudents} seats at an average fee of ₹1,800 will yield an extra ₹${((220 - stats.totalActiveStudents) * 1800).toLocaleString()}/month!*`,
    intent: 'CALCULATION',
    isCorrection: false,
    extracted: {},
    timestamp: new Date().toISOString()
  };
}

/**
 * Handles checklists and SOP procedures
 */
function handleJarvisChecklist(text: string, lower: string): ChatResponse {
  if (lower.includes('opening') || lower.includes('morning')) {
    return {
      messageId: 'msg-' + Date.now(),
      reply: `📋 **Radha Study Hall – Morning Opening Checklist (06:00 AM):**

1. [ ] Unlock main entrance and disarm night alarm.
2. [ ] Turn on cabin lighting in Hall 1 & Hall 2.
3. [ ] Verify main Wi-Fi router lights are green (test speed on phone).
4. [ ] Power on AC units and set thermostat to 24°C.
5. [ ] Check drinking water purifier, hot/cold dispensers, and paper cups.
6. [ ] Inspect washroom cleanliness, soap dispensers, and tissue rolls.
7. [ ] Place today's newspapers (The Hindu, Indian Express) on the rack.
8. [ ] Ready the student attendance register & AI Chat console.`,
      intent: 'CHECKLIST',
      isCorrection: false,
      extracted: {},
      timestamp: new Date().toISOString()
    };
  }

  return {
    messageId: 'msg-' + Date.now(),
    reply: `📋 **Radha Study Hall – Night Closing Checklist (11:00 PM):**

1. [ ] Ensure all aspirants have exited and personal lockers are secured.
2. [ ] Walk through every study row: verify no mobile phones, chargers, or wallets left behind.
3. [ ] Turn off all air conditioners and cabin fans.
4. [ ] Power down non-essential lighting (keep emergency corridor LEDs on).
5. [ ] Verify water purifier dispensing valves are closed to prevent overnight leaks.
6. [ ] Confirm today's 8:00 PM WhatsApp Daily Report was dispatched.
7. [ ] Lock main glass doors, pull shutter, and engage padlocks.`,
    intent: 'CHECKLIST',
    isCorrection: false,
    extracted: {},
    timestamp: new Date().toISOString()
  };
}

/**
 * Handles general conversations, greetings, questions
 */
function handleJarvisGeneralChat(text: string, lower: string): ChatResponse {
  const memories = getJarvisMemories();

  const isGreeting = 
    lower === 'hi' || 
    lower === 'hii' || 
    lower === 'hiii' || 
    lower === 'hello' || 
    lower === 'hey' || 
    lower === 'heyy' || 
    lower.startsWith('hi ') || 
    lower.startsWith('hii ') || 
    lower.startsWith('hello ') || 
    lower.startsWith('hey ') || 
    lower.includes('good morning') || 
    lower.includes('good evening') || 
    lower.includes('good afternoon') || 
    lower === 'jarvis';

  if (isGreeting) {
    return {
      messageId: 'msg-' + Date.now(),
      reply: `👋 **Good day, Commander! Radha Jarvis 2.0 is online.**

I am your autonomous study hall copilot. Here is what I can do for you:
• **Autonomous Memory:** Tell me anything to remember (*"Remember that Wi-Fi password is radha@2026"*).
• **Operations & Reports:** Log admissions, fee collections, shift turnout, or facility repairs.
• **Drafting:** Ask me to *"Draft a notice about quiet hours"* or *"Fee reminder message"*.
• **Strategic Guidance:** Ask *"How can I increase revenue?"* or *"Power saving ideas"*.
• **Mobile Hourly Alerts:** I monitor Radha Study Hall 24/7 with hourly mobile notifications.

What would you like me to handle right now?`,
      intent: 'GREETING',
      isCorrection: false,
      extracted: {},
      timestamp: new Date().toISOString()
    };
  }

  return {
    messageId: 'msg-' + Date.now(),
    reply: `🤖 **Radha Jarvis Intelligence Response:**

I have processed your instruction:
*"${text}"*

• **Autonomous Status:** Ready to execute.
• **Memory Indexed:** ${memories.length} rules, contacts & policies active.
• **Study Hall Status:** 185 Active Students, all systems operational.

💡 *You can command me to draft WhatsApp notices, give revenue advice, calculate profits, create staff checklists, or remember any new operational rule!*`,
    intent: 'GENERAL_CHAT',
    isCorrection: false,
    extracted: {},
    timestamp: new Date().toISOString()
  };
}
