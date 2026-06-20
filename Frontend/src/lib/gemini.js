/**
 * Gemini Pro / 2.5 Flash API Helper
 * Integrates directly with Gemini API or falls back to professional mock responses
 * when no API key is set.
 */

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function callGrafilab({ prompt }) {
  const GRAFILAB_KEY = import.meta.env.VITE_GRAFILAB_API_KEY || "";
  const url = "https://console-api.grafilab.ai/api/oai/v1/chat/completions";
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GRAFILAB_KEY}`
      },
      body: JSON.stringify({
        model: "grafilab/qwen3.6-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        top_p: 0.9
      })
    });
    
    if (!response.ok) {
      throw new Error(`Grafilab API failed: ${response.statusText}`);
    }
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "No response generated.";
  } catch (error) {
    console.error("Grafilab API error:", error);
    return generateMockResponse(prompt, error.message);
  }
}

export async function callGemini({ prompt, apiKey }) {
  // Route all traffic through the Grafilab implementation as requested
  return callGrafilab({ prompt });
}

function generateMockResponse(prompt, errorMsg = "") {
  const promptLower = prompt.toLowerCase();
  let errorNotice = errorMsg ? `\n\n*(Note: Fallback simulated response active due to connection/auth code: ${errorMsg})*` : "";

  // 1. Morning Brief Prompt Mock Response
  if (promptLower.includes("morning brief") || promptLower.includes("priorities") || promptLower.includes("john tan")) {
    return `Good morning, Advisor.

You have 3 client meetings today.

**Priority follow-up:**
- John Tan regarding retirement planning.

**Suggested actions:**
- Prepare retirement income proposal before 2 PM.
- Confirm Sarah Lim's mortgage document upload status.
- Review compliance CPD course progress (3 points needed by end of month).

**Potential Risk indicators:**
- Rising inflation exposure in mock portfolio for David Miller.${errorNotice}`;
  }

  // 2. Meeting Summary Prompt Mock Response
  if (promptLower.includes("meeting notes") || promptLower.includes("goals") || promptLower.includes("concerns")) {
    return `### Meeting Summary

**Client Goals:**
- Establish a sustainable Retirement Planning strategy.
- Set up target-dated Education Savings for grandchildren.

**Concerns:**
- High exposure to Inflation Risk and market volatility.
- Asset transfer tax implications.

**Action Items:**
- Prepare draft retirement income portfolio proposal.
- Schedule next alignment meeting for July 15th.

**Priority Level:**
High${errorNotice}`;
  }

  // 3. Learning Assistant Mock Response
  if (promptLower.includes("retirement planning") || promptLower.includes("best practices")) {
    return `### Retirement Planning Best Practices (2026 Update)

1. **Dynamic Safe Withdrawal Rates**: Transition from static 4% rules to target-date guardrails matching client age and market indexes.
2. **Tax-Bracket Management**: Balance traditional vs Roth conversions to optimize lifetime distributions.
3. **Sequence of Returns Mitigation**: Set aside 18-24 months of cash or cash equivalents to insulate client portfolios from sudden down-market cycles.${errorNotice}`;
  }

  if (promptLower.includes("compliance")) {
    return `### Key Advisor Compliance Frameworks

- **Reg BI (Best Interest)**: Mandates disclosure of all potential conflicts of interest and prioritizing client interests over fee yields.
- **Form CRS**: Ensure delivery of up-to-date relationship summaries to all new prospective clients.
- **Cybersecurity Rules**: Encrypt client document transfers and enforce multi-factor authentication (MFA) across CRM records.${errorNotice}`;
  }

  // 4. Partner Recommendation Mock Response
  if (promptLower.includes("estate planning") || promptLower.includes("tax") || promptLower.includes("recommend partner")) {
    return `### Recommended Partner: ABC Legal Group

**Reasoning:**
- Highly specialized in trust creation, high-net-worth estate planning, and asset shelter structures.
- Has a stellar 4.9 rating on local advisor network registries.

**Suggested Introduction Message:**
"Hi John, based on our conversation regarding asset protection, I would like to introduce you to ABC Legal Group. They specialize in estate planning and private trusts and have helped several of my clients establish robust wealth preservation frameworks."${errorNotice}`;
  }

  // 5. Calendar Scheduling Mock Response
  if (promptLower.includes("schedule") || promptLower.includes("calendar") || promptLower.includes("event") || promptLower.includes("meeting")) {
    if (promptLower.includes("add") || promptLower.includes("new")) {
      return `I have scheduled the new event for you.
\`\`\`json
{"command": "ADD_EVENT", "day": 24, "time": "3:00 PM", "name": "Mock Event Added by Fallback AI", "type": "Meeting"}
\`\`\`${errorNotice}`;
    }
    if (promptLower.includes("edit") || promptLower.includes("change")) {
      return `I have updated the event for you.
\`\`\`json
{"command": "EDIT_EVENT", "targetName": "Shawn", "targetTime": "3:00 PM", "targetDay": 27, "newDay": 28, "newTime": "4:00 PM", "newName": "Shawn"}
\`\`\`${errorNotice}`;
    }
    if (promptLower.includes("remove") || promptLower.includes("cancel")) {
      return `I have removed the event for you.
\`\`\`json
{"command": "REMOVE_EVENT", "targetName": "Shawn", "targetTime": "3:00 PM", "targetDay": 27}
\`\`\`${errorNotice}`;
    }
    return `### Your Schedule
I'm operating in fallback mode. You have 3 meetings today. Let me know if you want to add, edit, or remove any events.${errorNotice}`;
  }

  // 6. Client Insights Mock Response
  if (promptLower.includes("client insights") || promptLower.includes("potential opportunities")) {
    return `### Client Opportunities & Vulnerabilities

**Potential Opportunities:**
- Optimize tax reliefs via PRS contributions before year-end.
- Consider shifting excess liquidity into high-yield REITs.

**Risk Indicators:**
- High exposure to single-sector equities.
- Inflation may outpace current conservative fixed-income yields.

**Suggested Next Actions:**
- Schedule a portfolio rebalancing review.
- Request updated KYC documentation for CRS compliance.${errorNotice}`;
  }

  return `### AI operating analysis

- Processed prompt query successfully.
- Recommend aligning this topic with standard compliance frameworks.
- Suggested action: Review related training or consult with specialized advisory partners.

*This analysis is assisted by Gemini Pro.*${errorNotice}`;
}
