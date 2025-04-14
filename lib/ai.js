import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class AdGenerator {
  constructor() {
    this.openai = openai;
  }

  async generateTextAd(referenceAd, brandStyle, format = 'social') {
    const formatPrompts = {
      social: 'Create a social media post with a catchy headline, engaging description, and clear CTA.',
      banner: 'Create a banner ad with a short, impactful headline and clear CTA.',
      email: 'Create an email marketing copy with a compelling subject line and body text.',
    };

    const prompt = `
You are an expert ad copywriter. Create a fresh and brand-aligned ad based on these inputs:

Reference Ad:
"${referenceAd}"

Brand Style:
${brandStyle}

Format: ${formatPrompts[format]}

Requirements:
- Maintain brand voice and tone
- Use appropriate length for the format
- Include a clear call-to-action
- Ensure brand consistency
`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      n: 3 // Generate 3 variations
    });

    return response.choices.map(choice => choice.message.content);
  }

  async generateImage(referenceAd, brandStyle, format = 'social') {
    const formatPrompts = {
      social: 'Create a square social media image',
      banner: 'Create a wide banner image',
      email: 'Create a rectangular email header image',
    };

    const prompt = `
Create an advertisement image that matches this brand style: ${brandStyle}
Reference: ${referenceAd}
Format: ${formatPrompts[format]}
Style: Modern, clean, and engaging
Requirements:
- Use brand-appropriate colors
- Maintain visual consistency
- Focus on the product/service
- Include space for text overlay
`;

    // Generate single image with DALL-E 3
    const response = await this.openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1, // DALL-E 3 only supports n=1
      size: this.getImageSize(format),
      quality: 'standard',
      style: 'natural',
    });

    return response.data[0].url;
  }

  getImageSize(format) {
    const sizes = {
      social: '1024x1024',
      banner: '1024x512',
      email: '800x400',
    };
    return sizes[format] || '1024x1024';
  }

  async analyzeBrandStyle(text) {
    const prompt = `
Analyze this brand style description and extract key elements:
"${text}"

Extract:
1. Brand voice (formal, casual, playful, etc.)
2. Color preferences
3. Target audience
4. Key messaging points
5. Brand personality traits

Format the response as a JSON object.
`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content);
  }

  async generateMultipleVariations(referenceAd, brandStyle, count = 3) {
    const variations = [];
    
    for (let i = 0; i < count; i++) {
      const textVariations = await this.generateTextAd(referenceAd, brandStyle);
      const imageUrl = await this.generateImage(referenceAd, brandStyle);
      
      variations.push({
        text: textVariations[0],
        image: imageUrl,
        variationId: i + 1
      });
    }

    return variations;
  }
}
