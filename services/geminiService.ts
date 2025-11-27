import { GoogleGenAI, Type } from "@google/genai";
import { AIAdvice } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getPregnancyAdvice = async (week: number): Promise<AIAdvice> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `我目前懷孕第 ${week} 週。請提供繁體中文（台灣）的每週結構化更新。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            week: { type: Type.INTEGER },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3個本週簡潔的健康或生活建議。"
            },
            babyFact: {
              type: Type.STRING,
              description: "關於本週寶寶發育的一個有趣事實。"
            },
            warningSigns: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "列出2-3個若本週出現需立即就醫的症狀。"
            }
          },
          required: ["week", "tips", "babyFact", "warningSigns"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIAdvice;
    }
    throw new Error("No response text from Gemini");
  } catch (error) {
    console.error("Error fetching advice:", error);
    // Fallback data in case of error
    return {
      week,
      tips: ["保持水分補充。", "感到疲倦時請休息。", "飲食均衡。"],
      babyFact: "妳的寶寶每天都在成長！",
      warningSigns: ["劇烈頭痛", "出血"]
    };
  }
};

export const analyzeUltrasound = async (base64Image: string): Promise<string> => {
  try {
    // Remove data URL prefix if present for the API call
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64
            }
          },
          {
            text: "這是一張胎兒超音波照片。請用溫暖、安心的繁體中文（台灣）語氣，向準媽媽解釋照片中看得到的特徵（例如頭部、脊椎、四肢等位置）。如果照片模糊或無法辨識，請溫柔地告知。請勿提供專業醫療診斷，並提醒媽咪這只是 AI 的輔助觀察，準確資訊請以醫生為主。"
          }
        ]
      }
    });

    return response.text || "AI 無法解讀這張照片。";
  } catch (error) {
    console.error("Error analyzing ultrasound:", error);
    return "分析照片時發生錯誤，請稍後再試。";
  }
};
