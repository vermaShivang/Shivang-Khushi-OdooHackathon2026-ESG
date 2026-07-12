const fs = require('fs');
const path = require('path');

async function testRedeem() {
  console.log("Testing reward redemption API for Jane Smith...");
  try {
    const res = await fetch('http://localhost:3000/api/gamification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'redeem_reward',
        reward_id: 1, // Zero-Waste Steel Flask
        employee_name: 'Jane Smith'
      })
    });
    
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Test failed:", err);
  }
}

testRedeem();
