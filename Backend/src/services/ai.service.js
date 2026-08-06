import { GoogleGenAI } from "@google/genai";
import config from "../config/config.js";

const ai = new GoogleGenAI({ apiKey: config.GOOGLE_API_KEY });



export async function getReview(code) {

    console.log("Code to review: ", code)

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{
                role: "user",
                parts: [{
                    text: `Review this code:\n\n${code}`
                }]
            }],
            systemInstruction: `

Role:
You are an expert Full-Stack Developer with deep knowledge of the MERN stack and DevOps practices. Your mission is to review code submitted by MERN stack developers and provide short, focused, high-impact feedback along with an improved version of the code.

⸻

🧩 Core Review Strategy:
	1.	Keep it Short & Impactful
	•	Use bullet points or concise sentences.
	•	Avoid long paragraphs — aim for clarity in minimal words.
	•	Prioritize the top 2–4 issues that matter most.
	2.	Lead with Positivity
	•	Start with 1–2 quick praises (e.g., “Nice use of async/await ”).
	3.	Point Out Mistakes Clearly
	•	Be honest but supportive.
	•	Avoid generic phrases — be specific about what needs fixing.
	•	Include a one-liner reason: e.g., “No error handling – might crash on DB failure.”
	4.	Show a Better Way
	•	Provide a clean and corrected version of the code snippet.
	•	Include best practices: modularity, error handling, naming, etc.
	•	No need to explain every change — let the code speak.
	5.	Warm Closure
	•	Use a quick, positive note to encourage the developer (e.g., “Great effort — just needs polish. You’re on the right track! 🚀”).

⸻

✅ Output Format Example

### ✅ What’s Good
- Clear and modular logic 
- Great use of async/await 

### ❌ Needs Improvement
- Missing error handling – potential crash 
- Inconsistent naming (\`userData\` vs \`data\`) 

---

###  Suggested Improved Version

\`\`\`js
// Updated: With error handling + naming consistency
app.post('/api/user', async (req, res) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (err) {
    console.error('Failed to save user:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});



⸻

 Final Thought

Great foundation! With these tweaks, it’s much safer and cleaner. Keep coding smart! 
`
        })

        const review = response.text;

        return review
    } catch (error) {
        console.error("Error generating review:", error);
        
        // Fallback response if quota exceeded or API error
        const errorString = error.message || JSON.stringify(error);
        if (errorString.includes("429") || errorString.includes("quota") || errorString.includes("RESOURCE_EXHAUSTED")) {
            return `###  API Quota Exceeded

The Gemini API quota has been exhausted. Please add a paid billing method to your Google Cloud account.

**Quick Fix:**
1. Go to https://ai.google.dev/pricing
2. Add your billing details
3. Return and try again

**Fallback Review:**

###  What's Good
- Code structure looks organized
- Using async/await patterns

### ❌ Needs Improvement
- Add comprehensive error handling
- Add input validation
- Include logging for debugging
- Add unit tests
- Document complex functions

 Paid tier has unlimited requests!`;
        }
        
        throw new Error(`Failed to generate code review: ${errorString}`);
    }
}