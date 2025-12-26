
// @google/genai Coding Guidelines: 
// 1. Use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
// 2. Use ai.models.generateContent to query GenAI.
// 3. The GenerateContentResponse features a 'text' property (not a method).

import { GoogleGenAI } from "@google/genai";
import { Cycle } from '../types';

export const analyzeCycleRisk = async (cycle: Cycle): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return "خدمة التحليل بالذكاء الاصطناعي غير متاحة حالياً (مفتاح API مفقود).";
  }

  // Initializing with the recommended pattern
  const ai = new GoogleGenAI({ apiKey });

  try {
    const prompt = `
      تصرف كخبير استثماري زراعي وبيطري في السوق المصري. قم بتحليل دورة تسمين المواشي التالية وأعط تقييماً للمخاطر والعوائد المتوقعة للمستثمر والمربي.
      
      بيانات الدورة:
      النوع: ${cycle.animalType}
      الوزن الحالي: ${cycle.initialWeight} كجم
      الوزن المستهدف: ${cycle.targetWeight} كجم
      مبلغ التمويل المطلوب: ${cycle.fundingGoal} جنيه مصري
      الوصف: ${cycle.description}
      حالة التأمين: ${cycle.isInsured ? 'مؤمن (تأمين شامل وتحصينات)' : 'غير مؤمن'}

      اكتب تقريرًا تفصيلياً بالعربية يوضح النقاط الإيجابية والمخاطر المحتملة، مع مراعاة ظروف السوق المصري (أسعار الأعلاف، الأمراض الموسمية، الطلب في المواسم).
    `;

    // Using gemini-3-pro-preview with thinking budget for complex reasoning tasks.
    // Simplified contents to a string as per guidelines.
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 32768 // max budget for gemini-3-pro-preview to ensure deep analysis
        }
      }
    });

    // Directly access the .text property
    return response.text || "لم يتمكن النظام من تحليل البيانات.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "حدث خطأ أثناء الاتصال بخدمة التحليل الذكي.";
  }
};
