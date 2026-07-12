const fs = require('fs');
const path = require('path');

async function run() {
  console.log("Testing standard quiz duplicate XP payout check...");
  const payload = {
    employee_name: "Shivang Verma",
    correct_answers: 5,
    total_questions: 5
  };

  try {
    // First attempt
    console.log("\nAttempting first standard quiz completion...");
    const res1 = await fetch('http://localhost:3000/api/gamification/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log("First Attempt Status:", res1.status);
    const data1 = await res1.json();
    console.log("First Attempt Response:", JSON.stringify(data1, null, 2));

    // Second attempt
    console.log("\nAttempting duplicate standard quiz completion...");
    const res2 = await fetch('http://localhost:3000/api/gamification/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log("Second Attempt Status:", res2.status);
    const data2 = await res2.json();
    console.log("Second Attempt Response:", JSON.stringify(data2, null, 2));

  } catch (err) {
    console.error("Test failed:", err);
  }
}

run();
