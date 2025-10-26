import { GoogleGenAI, Modality, Part } from "@google/genai";
import { WorkMode } from '../types';

export class ApiKeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiKeyError';
  }
}

interface EditParams {
  base64Image: string;
  base64BackgroundImage?: string | null;
  base64ReferenceImage?: string | null;
  base64Mask?: string | null;
  mimeType: string;
  prompt: string;
  mode: WorkMode;
  settings: Record<string, any>;
}

const generateFullPrompt = (prompt: string, mode: WorkMode, settings: Record<string, any>, base64ReferenceImage?: string | null, base64Mask?: string | null): string => {
    let fullPrompt = `Task: Perform an image editing operation based on the user's request.
Mode: "${Object.keys(WorkMode).find(key => WorkMode[key as keyof typeof WorkMode] === mode)}"

User's primary instruction: "${prompt || 'Perform the edit based on the parameters below.'}"

Apply the following style and technical parameters:\n`;

    const processedSettings = {...settings};

    if (mode === WorkMode.PORTRAIT) {
        if (prompt === "INSTANT_STUDIO_REMASTER") {
            fullPrompt = `CRITICAL TASK: Perform an INSTANT STUDIO REMASTER. This is an automated one-click process. Execute the following professional studio workflow with optimal settings to transform the input photo into a hyper-realistic, 8K masterpiece.

**User's primary instruction:** "Make this portrait look like it was shot in a professional studio with high-end equipment."\n\n`;
        } else {
            fullPrompt = `CRITICAL TASK: Perform a custom studio-quality portrait enhancement based on the user's settings.

**User's primary instruction:** "${prompt || 'Enhance this portrait based on the parameters below.'}"\n\n`;
        }

        fullPrompt += `---
**WORKFLOW & PARAMETERS:**

**STEP 1: CORE ENGINE - IDENTITY & DETAIL**
- **Identity-Lock: CRITICAL - 100% PRESERVATION.** The subject's facial features and identity must not be altered.
- **Generative Upscale Target:** Reconstruct the image to a target resolution of **${settings.targetResolution}**.
`;
        if (settings.autoSkinTexture) {
            fullPrompt += `- **Auto-Skin Texture:** ENGAGED. Generate realistic, high-frequency skin texture, including pores and micro-details.\n`;
        }
        if (settings.autoHairDetail) {
            fullPrompt += `- **Auto-Hair Detail:** ENGAGED. Reconstruct individual, sharp strands of hair.\n`;
        }

        fullPrompt += `
**STEP 2: DYNAMIC STUDIO RELIGHTING**
- **Lighting Analysis:** First, analyze the original lighting for flaws like harsh shadows or blown-out highlights.
`;
        if (settings.autoBalanceLighting) {
            fullPrompt += `- **Auto-Relighting:** ENGAGED. Neutralize the original flawed lighting and re-light the subject virtually using a professional **'${settings.lightStyle}'** setup. The goal is balanced, dimensional light.
- **Light Intensity:** Set to approximately ${settings.lightIntensity}%. \n`;
        } else {
            fullPrompt += `- **Auto-Relighting:** DISENGAGED. Preserve and enhance the original lighting only.\n`;
        }

        fullPrompt += `
**STEP 3: PROFESSIONAL LENS & CAMERA FX**
`;
        if (settings.autoBokeh) {
            fullPrompt += `- **Depth of Field:** ENGAGED. Perform a precise subject-background separation.
  - **Lens Profile:** Simulate a **'${settings.lensProfile}'** lens to create a beautiful, creamy bokeh.
  - **Background Blur:** Set blur intensity to approximately ${settings.backgroundBlur}%. \n`;
        } else {
            fullPrompt += `- **Depth of Field:** DISENGAGED. Maintain the original background focus.\n`;
        }
        if (settings.chromaticAberration) {
            fullPrompt += `- **Lens Simulation:** Add subtle chromatic aberration for enhanced photorealism.\n`;
        }

        fullPrompt += `
**STEP 4: BEAUTY & STYLE**
- **Hyper-Real Skin Finishing:**
  - **Smoothing:** Apply a natural skin smoothing effect at ${settings.skinSmoothing}%, preserving skin texture. This should NOT look like plastic.
  - **Blemish Removal:**`;
        const removals = [];
        if (settings.removeBlemishes) removals.push('acne and spots');
        if (settings.removeWrinkles) removals.push('wrinkles');
        if (settings.removeDarkCircles) removals.push('dark under-eye circles');
        fullPrompt += removals.length > 0 ? ` Remove ${removals.join(', ')}.\n` : ` No specific blemish removal requested.\n`;
        
        if (settings.makeup) {
            fullPrompt += `- **Makeup Style:** Apply makeup as described: "${settings.makeup}".\n`;
        }
        if (settings.hair) {
            fullPrompt += `- **Hair Style:** Modify hair as described: "${settings.hair}".\n`;
        }

        fullPrompt += `
**FINAL INSTRUCTION:** Execute this multi-step process to transform the portrait. The result must be hyper-realistic, detailed, and indistinguishable from a high-end professional studio photograph.`;
        return fullPrompt;
    }


    if (mode === WorkMode.RESTORE) {
        fullPrompt = `CRITICAL TASK: Perform a hyper-realistic, studio-quality photo restoration. The goal is to make the restored photo indistinguishable from a modern, high-resolution photograph of the original scene, finished with professional studio techniques. It must be a 100% faithful restoration of the subject's identity.

**User-provided context:** "${settings.context || 'No specific context provided.'}"

---
**RESTORATION WORKFLOW:**

**STEP 1: ANALYSIS & CLEANING**
- Analysis: You are an expert photo restoration AI. Analyze the image for all forms of degradation.
`;
    if (settings.autoClean) {
        fullPrompt += `- Damage & Noise Removal: ENGAGED. Automatically remove all scratches, stains, mold, and film grain without losing core details. Prepare a clean base image.\n`;
    } else {
        fullPrompt += `- Damage & Noise Removal: DISENGAGED. Preserve original grain and minor imperfections.\n`;
    }

    fullPrompt += `
**STEP 2: CORE REMASTERING**
- Identity-Lock: CRITICAL - 100% PRESERVATION. The subject's facial features and identity must not be altered.
`;
    if (settings.hyperRealSkin) {
        fullPrompt += `- Hyper-Real Skin Texture: ENGAGED. Generate realistic skin texture, including pores and micro-details, appropriate for the subject's age.\n`;
    }
    if (settings.hairAndFabricDetails) {
        fullPrompt += `- Hair & Fabric Detail Generation: ENGAGED. Reconstruct individual strands of hair and the fine texture of clothing fabric for maximum realism.\n`;
    }
    fullPrompt += `- Target Resolution: Upscale the final output to ${settings.resolution}.\n`;
    
    fullPrompt += `
**STEP 3: STUDIO FINISHING**
`;
    if (settings.autoStudioLight) {
        fullPrompt += `- Studio Relighting: ENGAGED. Remove the original, often flat or poor, lighting. Re-light the subject using a virtual '${settings.lightStyle}' setup to create depth, dimension, and a professional look.\n`;
    } else {
        fullPrompt += `- Studio Relighting: PRESERVE ORIGINAL LIGHTING. Only enhance, do not replace, the original lighting.\n`;
    }

    if (settings.modernAutoColor) {
        fullPrompt += `- Modern Colorization: ENGAGED. Apply vibrant, realistic colors as if shot with a modern digital camera.\n`;
    }
    if (settings.autoWhiteBalance) {
        fullPrompt += `- Auto White Balance: ENGAGED. Correct any color casts to ensure neutral tones and accurate skin colors.\n`;
    }

    if (settings.backgroundProcessing === 'remaster') {
        fullPrompt += `- Background Processing: Remaster the original background. Enhance its details and match its lighting and color to the relit subject.\n`;
    } else { // 'new_studio'
        fullPrompt += `- Background Processing: Replace the original background with a new, clean studio backdrop.
  - Backdrop Style: Create a '${settings.studioBackdrop}' backdrop that complements the subject.\n`;
    }

    fullPrompt += `
**FINAL INSTRUCTION:** Execute this multi-step process to transform the old photograph into a perfect, modern, studio-quality portrait. The result must be hyper-realistic and seamless.`;
    return fullPrompt;
    }

    if (mode === WorkMode.CREATIVE) {
        if (base64Mask) {
            fullPrompt = `CRITICAL TASK: INPAINTING/OUTPAINTING WITH A PROTECTED MASK. A second image is provided which acts as a mask. The WHITE areas on this mask are PROTECTED and MUST NOT BE ALTERED in any way. The BLACK areas are where new content should be generated.

**ABSOLUTE RULE: Preserve the white masked areas of the original image with 100% fidelity.**

---
`;
        }

        if (prompt === "STUDIO_SWAP") {
            fullPrompt += `CRITICAL TASK: Perform a HYPER-REAL STUDIO SWAP. This involves two main stages: generative matting for perfect subject isolation, followed by a seamless composite into a new background.

**User's primary instruction:** "Replace the background of the image with a new one based on the following prompt, ensuring the result is indistinguishable from a real studio photograph."

---
**WORKFLOW & PARAMETERS:**

**STAGE 1: HYPER-DETAIL GENERATIVE MATTING**
- **Action:** Isolate the primary subject from the original background.
- **Method: CRITICAL - Use Generative Matting.** Do NOT use a simple alpha mask. Instead, analyze the boundary pixels (especially hair, fur, transparent fabrics) and intelligently REGENERATE them. The goal is to preserve 100% of fine details like individual hair strands, avoiding any 'halo' or matted-edge effects. The isolated subject must be perfectly clean.

**STAGE 2: HYPER-REAL COMPOSITING**
- **New Background Prompt:** "${settings.backgroundPrompt}"
- **Action:** Composite the perfectly isolated subject into the newly generated background.
- **Compositing Method: CRITICAL - Use Hyper-Real Logic.** This is NOT a simple layering. Execute the following in order:
  - **1. Environment Lighting Analysis:** Scan the new background to create a virtual high-dynamic-range imaging (HDRI) map. Identify all light sources, their direction, color temperature, and intensity (e.g., 'large softbox from top-right, warm key light').
  - **2. Subject Re-lighting:** COMPLETELY REMOVE the original lighting from the isolated subject. Then, use the virtual HDRI map to cast new, physically accurate light onto the subject. The subject's lighting, highlights, and shadows MUST match the new environment perfectly.
  - **3. Smart Shadow Casting:** Generate and cast a realistic shadow from the subject onto the new background, based on the identified light sources. The shadow should be soft or hard as dictated by the lighting.
  - **4. Full Harmonization:** Automatically match the subject's color temperature, black levels, white balance, saturation, and film grain to the new background.
  - **5. Seam Blending:** Ensure the final integration is absolutely invisible.

**FINAL INSTRUCTION:** The final image must look like a single, cohesive photograph taken in a professional setting. The composite should be completely undetectable.`;
        } else if (prompt === "FULL_BODY_GENERATION") {
            fullPrompt += `CRITICAL TASK: Perform an 8K FULL-BODY GENERATION. This involves logically extending the canvas and generating the missing parts of a character with hyper-realistic detail.

**User's primary instruction:** "Extend the character in the image based on the following description. The result must be a complete, high-resolution portrait."

---
**WORKFLOW & PARAMETERS:**

**STAGE 1: CORE IDENTITY PRESERVATION**
- **Identity-Lock: CRITICAL - 100% ENGAGED.** The subject's face, identity, and all existing visible features MUST be preserved without any alteration.

**STAGE 2: 8K GENERATIVE EXTENSION**
- **Character Generation Prompt:** "${settings.fullBodyPrompt}"
- **Action:** Generate the missing parts of the character (body, clothing, pose) based on the user's prompt.
- **Generation Engine: CRITICAL - Use 8K Generative Engine.** The newly created parts must not be a simple, low-detail fill. They must be rendered with extremely high-frequency details.
  - **Fabric Texture:** Generate realistic micro-textures for clothing (e.g., weave of a suit, knit of a sweater).
  - **Skin Detail:** If any new skin is visible, it must have realistic texture.
  - **Creases & Folds:** Clothing should have natural, physically-correct folds and creases.
- **Lighting Synchronization:** The lighting on the newly generated parts (e.g., the new suit) MUST perfectly and seamlessly match the existing lighting on the original parts of the subject (e.g., the face). Analyze the original lighting and apply it consistently across the entire figure.
`;
            if (base64ReferenceImage) {
                fullPrompt += `
**STAGE 2.5: REFERENCE IMAGE INTEGRATION**
- **Action:** A third image has been provided as a reference. Intelligently incorporate elements from this reference image into the generated parts of the character. This could be clothing, an object, or even another person to include. The integration must be seamless and contextually appropriate based on the user's prompt ("${settings.fullBodyPrompt}"). The reference image is a guide, not a strict composite element.
`;
            }
            fullPrompt += `
**FINAL INSTRUCTION:** The output should be a single, cohesive, full-body portrait where the generated parts are indistinguishable in quality and detail from the original photograph. The entire subject should look sharp, clear, and rendered in 8K resolution.`;
        } else {
            fullPrompt = `This is a general creative request. Use the user's primary instruction ("${prompt}") as the main guide and creatively interpret the best outcome.`
        }
        return fullPrompt;
    }


    for(const [key, value] of Object.entries(processedSettings)) {
        if (value !== '' && value !== null && value !== undefined && key !== 'context' && key !== 'studioFinish') {
             fullPrompt += `- ${key}: ${JSON.stringify(value)}\n`;
        }
    }

    if (mode === WorkMode.COMPOSITE) {
        fullPrompt += `\nInstructions for Composite Mode:
- The first image provided is the SUBJECT.
- The second image provided is the new BACKGROUND.
- Seamlessly integrate the subject into the background.
- Pay close attention to matching lighting, color temperature, shadows, grain, focus, and perspective to create a photorealistic composite.
- The user's prompt ("${prompt}") provides additional context for the final scene.`;
    }

    return fullPrompt;
}

export const generateImageWithGemini = async ({ base64Image, base64BackgroundImage, base64ReferenceImage, base64Mask, mimeType, prompt, mode, settings }: EditParams): Promise<string> => {
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
        // Throwing an error will allow the UI to prompt for a key.
        throw new ApiKeyError("API Key not found.");
    }

    try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const parts: Part[] = [];

        // Image 1: The source image
        parts.push({
            inlineData: {
                data: base64Image.split(',')[1],
                mimeType: mimeType,
            },
        });
        
        // Image 2 (Conditional): The mask for inpainting
        if (mode === WorkMode.CREATIVE && base64Mask) {
             parts.push({
                inlineData: {
                    data: base64Mask.split(',')[1],
                    mimeType: 'image/png', // Masks are generated as PNG
                },
            });
        }

        // Image 2 or 3 (Conditional): Reference or Background
        if (mode === WorkMode.CREATIVE && base64ReferenceImage) {
            const referenceMimeType = base64ReferenceImage.substring(base64ReferenceImage.indexOf(':') + 1, base64ReferenceImage.indexOf(';'));
            parts.push({
                inlineData: {
                    data: base64ReferenceImage.split(',')[1],
                    mimeType: referenceMimeType,
                },
            });
        }

        if (mode === WorkMode.COMPOSITE && base64BackgroundImage) {
            const backgroundMimeType = base64BackgroundImage.substring(base64BackgroundImage.indexOf(':') + 1, base64BackgroundImage.indexOf(';'));
            parts.push({
                inlineData: {
                    data: base64BackgroundImage.split(',')[1],
                    mimeType: backgroundMimeType,
                },
            });
        }
        
        const fullPrompt = generateFullPrompt(prompt, mode, settings, base64ReferenceImage, base64Mask);
        parts.push({ text: fullPrompt });
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: parts,
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        const generatedPart = response.candidates?.[0]?.content?.parts?.[0];

        if (generatedPart && generatedPart.inlineData) {
            const base64Result = generatedPart.inlineData.data;
            return `data:${generatedPart.inlineData.mimeType};base64,${base64Result}`;
        } else {
            console.error("API response did not contain an image.", response);
            throw new Error("No image was generated by the API.");
        }

    } catch (error) {
        if (error instanceof Error && (error.message.includes('API key not valid') || error.message.includes('Requested entity was not found.'))) {
            throw new ApiKeyError('Invalid API Key.');
        }
        console.error("Error calling Gemini API:", error);
        // For other errors, re-throw so the UI can handle it.
        throw error;
    }
};
