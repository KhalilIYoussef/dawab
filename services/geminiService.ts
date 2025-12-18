import { GoogleGenAI } from "@google/genai";
import { Cycle } from '../types';

export const analyzeCycleRisk = async (cycle: Cycle): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return "خدمة التحليل بالذكاء الاصطناعي غير متاحة حالياً (مفتاح API مفقود).";
  }

  // Fix: Initializing client inside the function to ensure up-to-date API key access
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
      حالة التأمين: ${cycle.insurancePolicyNumber ? 'مؤمن (تأمين شامل وتحصينات)' : 'غير مؤمن'}

      اكتب تقريرًا قصيرًا بالعربية (لا يتجاوز 100 كلمة) يوضح النقاط الإيجابية والمخاطر المحتملة، مع مراعاة ظروف السوق المصري (أسعار الأعلاف، الأمراض الموسمية، الطلب في المواسم).
    `;

    // Fix: Updated to gemini-3-pro-preview for complex reasoning task as per latest guidelines
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
