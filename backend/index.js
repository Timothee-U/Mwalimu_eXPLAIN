import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to OpenRouter
const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1"
});

// Main AI endpoint
app.post("/generate-material", async (req, res) => {
  const { topic } = req.body;

  try {
    const completion = await client.chat.completions.create({
      model: "meta-llama/llama-3.1-8b-instruct",
      messages: [
        {
          role: "user",
          content: `Create a CBC worksheet for the topic: ${topic}. Include:
          - Learning objectives
          - Example questions
          - A simple illustration description
          - A short activity`
        }
      ]
    });

    res.json({
      success: true,
      output: completion.choices[0].message.content
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(3000, () => {
  console.log("Backend running on port 3000");
});