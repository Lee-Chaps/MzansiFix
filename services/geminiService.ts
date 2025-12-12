
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { IssueReport, LocationData, PriorityHint, ChatMessage } from "../types";

const SYSTEM_INSTRUCTION = `
You are MzansiFix AI, an intelligent assistant designed to support users from Johannesburg, South Africa in reporting municipal issues in any of the 11 official languages.

Your responsibilities:
1. Detect the user’s language from their text input.
2. Understand and respond accurately in the same language the user used (specifically for 'human_summary' and 'dispatch_recommendation').
3. Normalise user descriptions so that they remain clear and usable regardless of language.
4. Support translation understanding even when the user mixes English with African languages (code-switching).
5. Produce your final output ONLY in the structured JSON format below.

✅ VALID ISSUE TYPES & RESPONSIBLE DEPARTMENTS (Johannesburg Only)

1. Roads, Transport, Traffic Signals
   Examples: potholes, cracked roads, blocked stormwater drains, faulty robots
   Responsible: Johannesburg Roads Agency (JRA)

2. Burst Pipes, Water Leaks, No Water Supply
   Examples: burst pipe, leaking pipe, low pressure
   Responsible: Joburg Water

3. Sewage Overflow / Blocked Sewers
   Responsible: Joburg Water – Sewer Division

4. Waste Management, Illegal Dumping
   Examples: dump sites, missed collection, overflowing bins
   Responsible: Pikitup – Johannesburg Waste Management

5. Electricity Issues (Streetlights, Outages, Faults)
   Responsible: City Power Johannesburg
   Note: If the user indicates an Eskom-supplied area, route to Eskom.

6. Trees, Parks & Public Recreation
   Examples: fallen trees, blocked pavements, damaged parks
   Responsible: Johannesburg City Parks & Zoo (JCPZ)

7. Public Safety Hazards
   Examples: dangerous structures, missing manhole covers, traffic obstruction
   Responsible: JMPD – Johannesburg Metropolitan Police Department

8. Emergency Situations
   Examples: Fire, medical, life-threatening danger, crime
   Responsible: EMS Johannesburg or SAPS

9. Housing & Human Settlements
   Examples: unsafe RDP structures, municipal building issues
   Responsible: City of Johannesburg Housing Department

10. Environmental Health
    Examples: pests, hazardous waste, public health risk
    Responsible: City of Johannesburg Environmental Health

✅ RESPONSE MAPPING RULES
You must output VALID JSON matching the schema provided.
- Map "Issue Classification" -> 'primary_category' & 'secondary_category'
- Map "Severity" -> 'severity_score' (0.0-1.0) & 'priority'
- Map "Summary of the Problem" -> 'human_summary'
- Map "Impact / Urgency Assessment" -> 'dispatch_recommendation' & 'emergency' boolean
- Map "Correct Department" -> 'suggested_department' array (Use exact names from list above)
- Map "Next Steps" -> 'clarifying_questions' (if info missing) or part of 'dispatch_recommendation'

RULES FOR THE AI:
- Only use Johannesburg departments listed above.
- If unsure, ask the user for location or clarity in 'clarifying_questions'.
- If the issue is dangerous (threat to life) -> Set 'emergency': true and priority 'Immediate'.
`;

const CHAT_SYSTEM_INSTRUCTION = `
You are **KasiFixer**, the official AI assistant for the MzansiFix municipal reporting app in Johannesburg, South Africa.

**Your Purpose:**
- Assist users with Johannesburg municipal issues (JRA, City Power, Joburg Water, etc.).
- Provide contact details and procedures based strictly on the KNOWLEDGE BASE below.
- Guide users on how to use the MzansiFix app.
- Route issues to the correct department.

**KNOWLEDGE BASE (Source of Truth):**
- **Johannesburg Roads Agency (JRA):** Roads, potholes, traffic lights. Hotline: 0860 562 874, Email: hotline@jra.org.za.
- **Joburg Water:** Burst pipes, sewage, no water. Hotline: 0800 000 004, SMS: 082 653 2143.
- **City Power:** Electricity outages (non-Eskom). Faults: 011 490 7484.
- **Eskom:** Electricity (Eskom areas). Toll-free: 08600 37566.
- **Pikitup:** Waste, illegal dumping, bins. Hotline: 0800 742 786.
- **JMPD:** Traffic police, by-laws, noise, accidents (no injury). Hotline: 011 758 9650.
- **City Parks (JCPZ):** Fallen trees, parks. Hotline: 011 712 6600.
- **EMERGENCY:** Threat to life, crime, fire. Call **10111 (SAPS)** or **112**.

**STRICT RULES:**
1. **Scope:** Answer ONLY questions about Johannesburg service delivery or MzansiFix. If asked about other topics (e.g., homework, coding, Cape Town), politely redirect.
2. **Safety:** If a user mentions immediate danger (fire, hijacking, assault), INSTRUCT THEM TO CALL 10111 or 112 IMMEDIATELY.
3. **No Hallucinations:** If info is not in the Knowledge Base, say "This information is not available in the MzansiFix knowledge base."
4. **Tone:** Friendly, professional, South African English (e.g., "Sharp," "Eish," but professional).
5. **Brevity:** Keep responses short and actionable.

**Example Interaction:**
User: "My lights are out."
Mzai: "Eish, sorry to hear that. Is your area supplied by City Power or Eskom? For City Power, call 011 490 7484. For Eskom, call 08600 37566."
`;

const REPORT_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    report_id: { type: Type.STRING },
    primary_category: { type: Type.STRING },
    secondary_category: { type: Type.STRING, nullable: true },
    detected_objects: { type: Type.ARRAY, items: { type: Type.STRING } },
    severity_score: { type: Type.NUMBER },
    priority: { type: Type.STRING, enum: ["Low", "Medium", "High", "Immediate"] },
    confidence: { type: Type.NUMBER },
    suggested_department: { type: Type.ARRAY, items: { type: Type.STRING } },
    contact_details: {
      type: Type.OBJECT,
      properties: {
        saps_station: { type: Type.STRING, nullable: true },
        saps_emergency: { type: Type.STRING, nullable: true },
        saps_station_line: { type: Type.STRING, nullable: true },
        jmpd_region: { type: Type.STRING, nullable: true },
        jmpd_contact_centre: { type: Type.STRING, nullable: true },
        municipal_department_contact: { type: Type.STRING, nullable: true }
      },
      nullable: true
    },
    dispatch_recommendation: { type: Type.STRING, nullable: true },
    estimated_time_to_fix: { type: Type.STRING, nullable: true },
    sla_tier: { type: Type.STRING, enum: ["SLA-1 (24h)", "SLA-2 (3 days)", "SLA-3 (7 days)", "SLA-4 (30 days)"], nullable: true },
    human_summary: { type: Type.STRING, nullable: true },
    clarifying_questions: { type: Type.ARRAY, items: { type: Type.STRING } },
    emergency: { type: Type.BOOLEAN },
    metadata: {
      type: Type.OBJECT,
      properties: {
        language_detected: { type: Type.STRING },
        image_evidence: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { image_id: { type: Type.STRING }, note: { type: Type.STRING } } } },
        rules_triggered: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    }
  },
  required: [
    "report_id",
    "primary_category",
    "detected_objects",
    "severity_score",
    "priority",
    "confidence",
    "suggested_department",
    "emergency"
  ]
};

const LANGUAGE_MAP: Record<string, string> = {
  'en': 'English',
  'zu': 'isiZulu',
  'xh': 'isiXhosa',
  'af': 'Afrikaans',
  'st': 'Sesotho',
  'tn': 'Setswana',
  'nso': 'Sepedi',
  'ts': 'Xitsonga',
  'ss': 'siSwati',
  've': 'Tshivenda',
  'nr': 'isiNdebele'
};

export const analyzeIssue = async (
  base64Image: string, 
  userDescription: string, 
  locationData: LocationData | null,
  priorityHint: PriorityHint,
  languageCode: string = 'en'
): Promise<IssueReport> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const reportId = `R${Date.now().toString().slice(-6)}`;
  const targetLanguage = LANGUAGE_MAP[languageCode] || 'English';
  
  const inputPayload = {
    report_id: reportId,
    text_description: userDescription || null,
    images: [{ id: "IMG_UPLOAD", image_metadata: { mime: "image/jpeg" } }],
    location: locationData ? { lat: locationData.latitude, lng: locationData.longitude } : null,
    user_priority_hint: priorityHint,
    timestamp: new Date().toISOString()
  };

  // Inject language instruction
  const prompt = `
    INPUT: ${JSON.stringify(inputPayload)}
    
    IMPORTANT TRANSLATION INSTRUCTION: 
    The user's preferred language is **${targetLanguage}**.
    
    You MUST WRITE the values for 'human_summary' and 'dispatch_recommendation' IN **${targetLanguage}**.
    
    Examples for ${targetLanguage}:
    - If ${targetLanguage} is isiZulu, 'human_summary' should start with something like "Kukhona inkinga..."
    - If ${targetLanguage} is Afrikaans, use Afrikaans grammar and vocabulary.
    
    Do NOT translate the JSON keys (like 'primary_category', 'priority'). Keep keys in English.
    Do NOT translate technical department names if they are proper nouns (e.g. "City Power", "JRA"), but translate the context around them.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          },
          { text: prompt }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: REPORT_SCHEMA,
        temperature: 0.2, 
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as IssueReport;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const sendMessageToBot = async (history: ChatMessage[], newMessage: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const apiHistory = history
      .filter(msg => msg.id !== 'welcome')
      .map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: CHAT_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
      history: apiHistory
    });

    const result = await chat.sendMessage({
      message: newMessage
    });

    return result.text || "I apologize, I couldn't generate a response.";
  } catch (error) {
    console.error("Chatbot Error:", error);
    return "I'm having trouble connecting to the network right now. Please try again later.";
  }
};
