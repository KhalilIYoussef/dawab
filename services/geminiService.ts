
import { GoogleGenAI } from "@google/genai";
import { Cycle } from '../types';

// Ensure API key is present before initialization.
// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeCycleRisk = async (cycle: Cycle): Promise<string> => {
  if (!process.env.API_KEY) {
    return "خدمة التحليل بالذكاء الاصطناعي غير متاحة حالياً (مفتاح API مفقود).";
  }

  try {
    const prompt = `
      تصرف كخبير استثماري زراعي وبيطري في السوق المصري. قم بتحليل دورة تسمين المواشي التالية وأعط تقييماً للمخاطر والعوائد المتوقعة للمستثمر والمربي.
      
      بيانات الدورة:
      النوع: ${cycle.animalType}
      الوزن الحالي: ${cycle.initialWeight} كجم
      الوزن المستهدف: ${cycle.targetWeight} كجم
      مبلغ التمويل المطلوب: ${cycle.fundingGoal} جنيه مصري
      الوصف: ${cycle.description}
      حالة التأمين: ${cycle.insurancePolicyNumber ? 'مؤمن (تأمين شامل وتحصينات)' : 'غير مؤمن'}

      اكتب تقريرًا قصيرًا بالعربية (لا يتجاوز 100 كلمة) يوضح النقاط الإيجابية والمخاطر المحتملة، مع مراعاة ظروف السوق المصري (أسعار الأعلاف، الأمراض الموسمية، الطلب في المواسم).
    `;

    // Fix: Updated to gemini-3-pro-preview for complex reasoning task
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });

    return response.text || "لم يتمكن النظام من تحليل البيانات.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "حدث خطأ أثناء الاتصال بخدمة التحليل الذكي.";
  }
};
