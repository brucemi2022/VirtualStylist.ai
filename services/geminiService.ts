import { GoogleGenAI } from "@google/genai";
import { OutfitStyle } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-2.5-flash-image';

/**
 * Helper to extract base64 data from a data URL.
 */
const extractBase64 = (dataUrl: string): string => {
  return dataUrl.split(',')[1];
};

/**
 * Helper to extract MIME type from a data URL.
 */
const extractMimeType = (dataUrl: string): string => {
  return dataUrl.substring(dataUrl.indexOf(':') + 1, dataUrl.indexOf(';'));
};

export const generateOutfitForStyle = async (
  originalImage: string,
  style: OutfitStyle
): Promise<string> => {
  try {
    const base64Data = extractBase64(originalImage);
    const mimeType = extractMimeType(originalImage);

    const prompt = `
      You are a world-class fashion stylist. 
      Analyze the attached clothing item carefully.
      Create a complete, high-fashion "flat-lay" outfit featuring this specific item for a "${style}" occasion.
      The output image should be a top-down view of the items laid out neatly on a clean, neutral background.
      Include matching accessories, shoes, and complementary clothing items that create a cohesive ${style} look.
      Ensure the original item is the centerpiece.
      Do not include any text in the image.
      Photorealistic, high quality, 4k.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    // Extract image from response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    // Check if the model returned text explaining why it couldn't generate an image
    const textPart = response.candidates?.[0]?.content?.parts?.find(p => p.text);
    if (textPart?.text) {
      throw new Error(textPart.text);
    }

    throw new Error("No image generated.");
  } catch (error) {
    console.error(`Error generating ${style} outfit:`, error);
    throw error;
  }
};

export const editOutfitImage = async (
  currentImage: string,
  editInstruction: string
): Promise<string> => {
  try {
    const base64Data = extractBase64(currentImage);
    const mimeType = extractMimeType(currentImage);

    const prompt = `
      Edit the attached fashion image based on this instruction: "${editInstruction}".
      Return ONLY the edited image. Do not explain what you did.
      Maintain the flat-lay style, lighting, and high quality.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    // Check if the model returned text explaining why it couldn't generate an image (e.g. safety refusal)
    const textPart = response.candidates?.[0]?.content?.parts?.find(p => p.text);
    if (textPart?.text) {
      throw new Error(textPart.text);
    }

    throw new Error("No edited image generated.");
  } catch (error) {
    console.error("Error editing image:", error);
    throw error;
  }
};