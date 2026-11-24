import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      topic = "",
      companyName = "Our Company",
      industry = "Business",
      platform = "instagram",
      tone = "engaging",
    } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const promptText = `You are an elite social media copywriter and growth marketer.
Write a high-converting, viral social media post for "${companyName}" operating in the "${industry}" industry.
Topic/Goal: ${topic || "Promote our latest services, products, and customer value"}
Target Platform: ${platform}
Tone: ${tone}

Please output your response strictly in the following JSON format without markdown code blocks:
{
  "caption": "Primary engaging caption with emojis, hook, body, and clear call-to-action",
  "hashtags": "#Relevant #Hashtags #For #The #Industry",
  "customCaptions": {
    "instagram": "Instagram-tailored version with visual hook and hashtags",
    "facebook": "Facebook community-friendly storytelling version with link placeholder",
    "whatsapp": "WhatsApp broadcast / status format with bullet points and direct contact CTA",
    "linkedin": "Professional LinkedIn thought-leadership format with industry insight",
    "tiktok": "Short snappy TikTok video description with viral audio hashtags"
  }
}`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const rawText =
            geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleanedText);
          return NextResponse.json(parsed);
        }
      } catch (geminiError) {
        console.warn("Gemini API call failed, using intelligent template engine:", geminiError);
      }
    }

    // High quality intelligent template engine
    const cleanTopic = topic.trim() || `Exciting innovation and premier solutions in ${industry}`;

    const industryHashtags: Record<string, string> = {
      technology: "#TechInnovation #AI #CloudComputing #SaaS #FutureOfTech #DigitalTransformation",
      "real estate": "#LuxuryRealEstate #DreamHome #PropertyInvestment #ModernLiving #Architecture #Realtor",
      healthcare: "#Wellness #Healthcare #HealthyLiving #Medicine #SelfCare #DoctorTips",
      "e-commerce": "#OnlineShopping #ShopNow #ExclusiveDeals #TrendingNow #FastDelivery #ShopLocal",
      education: "#EdTech #LearningJourney #SkillsForFuture #KnowledgeIsPower #StudentLife #OnlineCourses",
      finance: "#WealthManagement #Investing #FinancialFreedom #SmartMoney #Fintech #Economics",
      fashion: "#OOTD #StyleInspo #FashionTrends #StreetWear #SustainableFashion #WardrobeGoals",
      travel: "#Wanderlust #TravelGram #ExploreTheWorld #VacationGoals #AdventureAwaits #TravelTips",
    };

    const tags =
      industryHashtags[industry.toLowerCase()] ||
      `#${industry.replace(/[^a-zA-Z0-9]/g, "")} #BusinessGrowth #Marketing #QualityService #CustomerSuccess`;

    let mainCaption = "";
    if (tone === "promotional") {
      mainCaption = `🚀 Ready to elevate your results with ${companyName}?\n\n${cleanTopic} is officially here! We've crafted solutions designed specifically to help you save time, maximize efficiency, and achieve higher standards.\n\n✨ Exclusive offer available this week only.\n👉 Tap the link in our bio or drop a message to claim your priority consultation!`;
    } else if (tone === "story") {
      mainCaption = `💡 Behind every milestone at ${companyName} is a passion to solve real problems.\n\nWhen we looked at ${industry.toLowerCase()}, we noticed what was missing: ${cleanTopic}. That's why our dedicated team set out to create an experience that truly delivers value.\n\n👇 Have you experienced this challenge? Tell us your thoughts in the comments below!`;
    } else {
      mainCaption = `✨ Big updates from the ${companyName} team!\n\nWe are proud to share our latest focus: ${cleanTopic}.\nWhether you're looking to scale your business or streamline your everyday workflow, our ${industry.toLowerCase()} expertise is here for you.\n\n💬 Send us a message today to learn how we can collaborate!`;
    }

    const platformCaptions = {
      instagram: `${mainCaption}\n\n.\n.\n${tags}`,
      facebook: `📢 Announcement from ${companyName}!\n\n${cleanTopic}.\n\nLearn more and get in touch with our team directly: https://${companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com\n\n${tags}`,
      whatsapp: `*🌟 Update from ${companyName}*\n\n_${cleanTopic}_\n\n✅ Premium Quality & Fast Turnaround\n✅ Dedicated Support\n\n📲 Reply directly to this message to chat with our representative today!`,
      linkedin: `Proud to share our latest strategic milestone at ${companyName}.\n\nAs the ${industry} landscape evolves, focusing on ${cleanTopic} is essential for forward-thinking organizations.\n\nHow is your organization navigating this shift? Let's connect in the comments.`,
      tiktok: `Watch till the end! 👀 ${cleanTopic} with ${companyName}! Drop your questions below 🔥 ${tags.slice(0, 50)}`,
    };

    return NextResponse.json({
      caption: mainCaption,
      hashtags: tags,
      customCaptions: platformCaptions,
      source: apiKey ? "Gemini-1.5-Flash" : "SmartMarketingEngine",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

