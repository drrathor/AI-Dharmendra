import { AdGenerator } from '@/lib/ai';

const adGenerator = new AdGenerator();

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  try {
    const formData = await req.formData();
    const referenceAd = formData.get('referenceAd');
    const brandStyle = formData.get('brandStyle');
    const format = formData.get('format') || 'social';
    const generateVariations = formData.get('variations') === 'true';
    const variationCount = parseInt(formData.get('variationCount')) || 3;

    if (!referenceAd || !brandStyle) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Reference ad and brand style are required" 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Analyze brand style first
    const brandAnalysis = await adGenerator.analyzeBrandStyle(brandStyle);

    let result;
    if (generateVariations) {
      result = await adGenerator.generateMultipleVariations(
        referenceAd,
        brandStyle,
        variationCount
      );
    } else {
      const [textVariations, imageUrl] = await Promise.all([
        adGenerator.generateTextAd(referenceAd, brandStyle, format),
        adGenerator.generateImage(referenceAd, brandStyle, format)
      ]);

      result = {
        text: textVariations[0],
        image: imageUrl,
        variations: {
          text: textVariations
        }
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        result,
        brandAnalysis,
        format
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error("Error generating ad:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Something went wrong" 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
