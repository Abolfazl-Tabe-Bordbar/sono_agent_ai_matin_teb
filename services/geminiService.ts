import { GoogleGenAI } from "@google/genai";
import { ReportResult } from "../types";

const fileToGenerativePart = async (file: File | Blob): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const generateMedicalReport = async (
  templateFile: File,
  audioBlob: Blob
): Promise<ReportResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: "AIzaSyDxbgpQTQREfl3W5ABf9hPwFsuvrOlPpSk" });
    
    // Convert inputs to base64
    const templatePart = await fileToGenerativePart(templateFile);
    const audioPart = await fileToGenerativePart(audioBlob);

    const prompt = `
      You are an expert medical administrative assistant (Farsi/English).
      
      Task:
      1. Analyze the attached PDF document ("Template") to understand its structure, layout, tables, fonts, and styling.
      2. Listen to the attached Audio file ("Dictation").
      3. Generate a complete medical report filled with the dictation data.
      
      CRITICAL OUTPUT RULES:
      - **FORMAT**: Return ONLY valid HTML code. Do NOT use Markdown.
      - **STYLING**: Use inline CSS (style="...") to EXACTLY mimic the visual layout of the PDF template. 
        - Replicate font sizes, bolding (font-weight), alignments (text-align), and margins.
        - **COLOR**: Ensure all text color is explicitly set to BLACK (#000000) or DARK GRAY (#333333) so it is readable on white paper.
        - If the template has tables, use HTML <table> elements with appropriate borders and spacing.
      - **STRUCTURE**: Start the output with a main container <div style="font-family: 'Vazirmatn', sans-serif; color: #000; ...">. Do NOT include <html>, <head>, or <body> tags.
      - **LANGUAGE**: 
        - The output content must be in **Persian (Farsi)** unless the medical terms dictate English.
        - The main container MUST have 'dir="rtl"'.
      - **CONTENT**: Fill the template sections with professional medical terminology derived from the audio. Ignore conversational fillers.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
            templatePart, 
            audioPart, 
            { text: prompt }
        ]
      },
      config: {
        temperature: 0.2,
      }
    });

    return {
      html: response.text || "<p>خطا در تولید گزارش.</p>",
      tokenUsage: response.usageMetadata?.totalTokenCount || 0
    };

  } catch (error) {
    console.error("Error generating report:", error);
    throw error;
  }
};
