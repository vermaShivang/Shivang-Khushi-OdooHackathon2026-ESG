import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const FALLBACK_CHALLENGES = [
  {
    title: "Digital Cleanse Day",
    description: "Delete 10GB of old emails, files, and cloud backups. Data centers contribute significantly to Scope 3 carbon footprint.",
    difficulty: "Easy",
    xp: 30
  },
  {
    title: "Commute Alternative",
    description: "Walk, cycle, or use public transport instead of driving for at least 3 days this week. Track and record your saved emissions.",
    difficulty: "Medium",
    xp: 60
  },
  {
    title: "Hardware Life Extension Audit",
    description: "Perform a department-wide audit of electronics and formulate a device repair & reuse plan to reduce e-waste.",
    difficulty: "Hard",
    xp: 100
  }
];

const FALLBACK_QUIZZES = [
  [
    { q: "Which Scope covers indirect emissions from purchased heating and cooling?", options: ["Scope 1", "Scope 2", "Scope 3", "Scope 4"], answer: 1 },
    { q: "What is the primary target of the Science Based Targets initiative (SBTi)?", options: ["Maximize tax write-offs", "Align corporate emission reductions with Paris Agreement warming limits", "Sell carbon offsets", "Monitor employee travel"], answer: 1 },
    { q: "Under ISO 14064, what must companies report?", options: ["Financial statements only", "Greenhouse gas emissions and removals", "Employee diversity percentages", "Board members' compensation"], answer: 1 }
  ],
  [
    { q: "What is double materiality in ESG reporting?", options: ["Reporting financial statistics twice", "Assessing both how sustainability issues impact the company and how the company impacts society/environment", "Auditing the carbon ledger by two separate external firms", "Checking compliance across both federal and state laws"], answer: 1 },
    { q: "Which of these is considered a Scope 3 emission?", options: ["Company owned delivery truck fuel", "Purchased electricity for the office", "Employee business travel and commuting", "Leased office natural gas combustion"], answer: 2 },
    { q: "What does the term 'Circular Economy' reject?", options: ["Recycling products", "The linear 'take-make-waste' model", "Renewable energy usage", "Zero waste goals"], answer: 1 }
  ]
];

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, promptContext } = body; // type is either 'challenge' or 'quiz'

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.log("GEMINI_API_KEY is not defined. Using local programmatic ESG quest generator fallback.");
      // Fallback logic
      if (type === 'challenge') {
        const rand = FALLBACK_CHALLENGES[Math.floor(Math.random() * FALLBACK_CHALLENGES.length)];
        return NextResponse.json({ success: true, mode: 'fallback', data: rand });
      } else {
        const randSet = FALLBACK_QUIZZES[Math.floor(Math.random() * FALLBACK_QUIZZES.length)];
        return NextResponse.json({ success: true, mode: 'fallback', data: randSet });
      }
    }

    // Call Gemini API
    let prompt = "";
    if (type === 'challenge') {
      prompt = `Generate a single new creative sustainability challenge for a corporate employee. 
      Return it in JSON format conforming to this exact schema:
      {
        "title": "Challenge Name",
        "description": "Short explanation of the activity",
        "difficulty": "Easy" or "Medium" or "Hard",
        "xp": 30 or 60 or 100
      }
      Context/Theme: ${promptContext || 'General ESG sustainability, carbon reduction, energy saving, waste reduction'}`;
    } else {
      prompt = `Generate a set of 3 multiple-choice ESG/sustainability quiz questions. 
      Return it in JSON format conforming to this exact schema:
      [
        {
          "q": "Question text here?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "answer": 0  // index of the correct option (0-3)
        }
      ]
      Focus topics: ${promptContext || 'Carbon accounting, Scope 1/2/3, global warming potential, corporate governance, CSR, environmental circularity'}`;
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API returned error status:", response.status, errText);
      throw new Error(`Gemini API Error: ${response.status}`);
    }

    const resData = await response.json();
    const textContent = resData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      throw new Error("Invalid response structure from Gemini API");
    }

    const parsedData = JSON.parse(textContent);

    return NextResponse.json({
      success: true,
      mode: 'gemini',
      data: parsedData
    });

  } catch (error) {
    console.error('Gemini Quest Generation API Error:', error);
    // Graceful fallback on API or parsing error
    const isChallenge = (await request.clone().json().catch(()=>({}))).type === 'challenge';
    if (isChallenge) {
      const rand = FALLBACK_CHALLENGES[Math.floor(Math.random() * FALLBACK_CHALLENGES.length)];
      return NextResponse.json({ success: true, mode: 'fallback-error', data: rand, error: error.message });
    } else {
      const randSet = FALLBACK_QUIZZES[Math.floor(Math.random() * FALLBACK_QUIZZES.length)];
      return NextResponse.json({ success: true, mode: 'fallback-error', data: randSet, error: error.message });
    }
  }
}
