/*
 * Copyright (c) 2026 Eshan Vijay Shettennavar.
 * 
 * This source code is licensed under the Business Source License 1.1.
 * You may not use this file except in compliance with the License.
 * 
 * For full license text, see the LICENSE-BSL file in the repository root.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

export const SUMMARY_POINTS_DELIMITER = '|||';

export async function generateGeminiSummary(
  text: string
): Promise<{ shortSummary: string; extendedSummary: string } | null> {
  if (!genAI) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Gemini API key not found. Skipping AI summarization.");
    }
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are a specialized news summarizer.
      Analyze the following text and generate:
      1. A "shortSummary": a single compelling sentence (max 150 chars) that captures the main hook.
      2. An "extendedSummary": exactly two distinct, insightful bullet points that provide context and details. Join these two points with "${SUMMARY_POINTS_DELIMITER}".
              
      Input text:
      "${text.slice(0, 10000)}" 
      
      Return ONLY a raw JSON object with keys "shortSummary" and "extendedSummary".
      Do not use Markdown formatting.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let textResponse = response.text();

    // Clean up potential markdown code blocks if the model adds them
    textResponse = textResponse.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();

    const data = JSON.parse(textResponse);

    return {
      shortSummary: data.shortSummary || "",
      extendedSummary: data.extendedSummary || "",
    };
  } catch (error) {
    console.error("Gemini summarization failed:", error);
    return null;
  }
}
