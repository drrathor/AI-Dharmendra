import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const formData = await req.formData();
    const referenceAd = formData.get('referenceAd');
    const brandStyle = formData.get('brandStyle');
    const image = formData.get('image'); // Optional; not used in AI generation now

    const textPrompt = `
You are an expert ad copywriter. Based on the reference ad and brand style, create a fresh and brand-aligned ad.

Reference Ad:
"${referenceAd}"

Brand Style:
${brandStyle}

Generate a new ad with:
- A catchy headline
- A short subheadline
- A clear CTA (Call to Action)
`;

    const textResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: textPrompt }],
      temperature: 0.7,
    });

    const generatedAdText = textResponse.choices[0].message.content;

    const imagePrompt = `An ad visual that matches this brand style: ${brandStyle}. Reference: ${referenceAd}. Keep it modern, clean, and engaging.`;

    const imageResponse = await openai.images.generate({
      prompt: imagePrompt,
      n: 1,
      size: "512x512",
    });

    const generatedImageURL = imageResponse.data[0].url;

    return new Response(JSON.stringify({
      success: true,
      ad: generatedAdText,
      image: generatedImageURL,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error generating ad or image:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Something went wrong',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
