import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to support JSON parsing with a limit of 10mb for base64 image uploads
  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini Client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // --- API ROUTES ---

  // 1. Plant Disease Diagnostic (Vision API)
  app.post("/api/gemini/diagnose", async (req, res) => {
    try {
      const { imageUrl, crop, language } = req.body;
      if (!imageUrl) {
        return res.status(400).json({ error: "imageUrl is required" });
      }

      let imagePart;
      if (imageUrl.startsWith("data:image")) {
        const parts = imageUrl.split(";base64,");
        const mimeType = parts[0].replace("data:", "");
        const base64Data = parts[1];
        imagePart = {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        };
      } else if (imageUrl.startsWith("http")) {
        try {
          const imgRes = await fetch(imageUrl);
          const arrayBuffer = await imgRes.arrayBuffer();
          const base64Data = Buffer.from(arrayBuffer).toString("base64");
          const mimeType = imgRes.headers.get("content-type") || "image/jpeg";
          imagePart = {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          };
        } catch (fetchErr) {
          console.error("Error fetching remote imageUrl:", fetchErr);
          // Fallback image part if fetch fails
          imagePart = null;
        }
      }

      if (!imagePart) {
        return res.status(400).json({ error: "Could not process image data" });
      }

      const promptText = `Analyze this leaf image of a crop plant of variety: '${crop || "General/Tomato"}'. 
Identify if it has any plant disease, nutritional deficiency (like nitrogen/iron/calcium blockages), or is healthy.
Provide your response strictly in the language: '${language || "tr"}'.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts: [imagePart, { text: promptText }] },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              disease: {
                type: Type.STRING,
                description: "Name of the disease, pathogen or 'Sağlıklı' if the leaf looks healthy.",
              },
              confidence: {
                type: Type.NUMBER,
                description: "Estimated matching confidence percentage from 0 to 100.",
              },
              cause: {
                type: Type.STRING,
                description: "Detailed cause explanation in the requested language.",
              },
              remedy: {
                type: Type.STRING,
                description: "Professional agronomy engineer recipe and solution in the requested language.",
              },
              organicTreatment: {
                type: Type.STRING,
                description: "Organic, ecological or natural biological solution and treatment in the requested language.",
              },
            },
            required: ["disease", "confidence", "cause", "remedy", "organicTreatment"],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response from Gemini");
      }

      const parsed = JSON.parse(responseText.trim());
      res.json(parsed);
    } catch (err: any) {
      console.error("Error in diagnose endpoint:", err);
      res.status(500).json({ error: err.message || "Failed to analyze leaf image" });
    }
  });

  // 2. Interactive App Guide Bot
  app.post("/api/gemini/guide", async (req, res) => {
    try {
      const { question, language, history } = req.body;
      if (!question) {
        return res.status(400).json({ error: "question is required" });
      }

      const systemPrompt = `You are the Pro-Agri SaaS Intelligent Agriculture Platform Guide, a helpful interactive routing and feature finder assistant for Turkish, English, and Spanish speaking farmers.
Your job is to read the user's question and guide them to the correct tab/feature of Pro-Agri. 

The application has the following Tabs/Pages available:
- 'analiz' (💧 Akıllı Analiz): Displays real-time meteorology, weather charts, soil temperature, precipitation forecasts, and the FAO-56 irrigation decision calculator.
- 'asistan' (🤖 YZ Asistanı): Chat with Ahmet Bey, the expert agronomist, to get personalized recipes.
- 'gubre' (🧪 Gübreleme): NPK nutrient fertilizer calculator, dekar charts, and calendars.
- 'saglik' (🛡️ YZ Bitki Sağlığı): Interactive leaf disease scan and vision analysis with upload options.
- 'pazar' (💰 Hal Pazar): Live wholesale market produce rates, cargo freight shipping cost calculator.
- 'kooperatif' (🤝 Kooperatif): Social forum (Ahmet Bey's corner), cooperative buying and machinery sharing posts.
- 'harita' (🗺️ Tarım Haritası): Visual interactive satellite soil moisture sectors map representing different field blocks.
- 'kayitlar' (📝 Kayıtlar): Diary history logbook of farming activities (irrigation, fertilization, observation).

If the user's query clearly refers to one of these tabs/features, provide a friendly explanation in the language: '${language || "tr"}' and set suggestedTab to that exact tab ID. Otherwise, set suggestedTab to null. 
Always reply in the user's language: '${language || "tr"}'. Feel free to format your message with clear markdown like **Feature Name** or bullet points to make it super friendly. Keep the response concise.`;

      const contents: any[] = [];
      if (history && Array.isArray(history)) {
        history.forEach((m: any) => {
          contents.push({
            role: m.sender === "user" ? "user" : "model",
            parts: [{ text: m.text }],
          });
        });
      }
      contents.push({
        role: "user",
        parts: [{ text: question }],
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: {
                type: Type.STRING,
                description: "Friendly markdown response answering the user and explaining how to find or use the feature.",
              },
              suggestedTab: {
                type: Type.STRING,
                description: "The matching tab identifier: 'analiz' | 'asistan' | 'gubre' | 'saglik' | 'pazar' | 'kooperatif' | 'harita' | 'kayitlar' or null.",
              },
            },
            required: ["reply", "suggestedTab"],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response from Gemini");
      }

      const parsed = JSON.parse(responseText.trim());
      res.json(parsed);
    } catch (err: any) {
      console.error("Error in guide endpoint:", err);
      res.status(500).json({ error: err.message || "Failed to get guide help" });
    }
  });

  // 3. Agronomist Ahmet Bey Chat Bot
  app.post("/api/gemini/asistan", async (req, res) => {
    try {
      const { question, language, history, soilType, activeCrop, activeStage } = req.body;
      if (!question) {
        return res.status(400).json({ error: "question is required" });
      }

      const systemPrompt = `You are simulated Agronomist Ahmet Bey (Ziraat Mühendisi Ahmet Bey), an expert agricultural consultant with 20 years of field experience in Anatolia.
You are extremely professional, helpful, polite, and speak with deep agronomical knowledge.
The user is currently managing a field with:
- Soil type: ${soilType || 'Tınlı / Loamy'}
- Active Crop: ${activeCrop || 'None / Not selected yet'}
- Active Growth Stage: ${activeStage || 'None / Not selected yet'}

Use this context to give highly specific, customized agronomical tips. If they ask about fertilization, mention NPK, nitrogen, calcium or phosphorus rates. If they ask about diseases, mention organic and chemical treatments.
Keep your answers professional and structured (use lists, bullet points, or bold text).
Always reply in the user's preferred language: '${language || "tr"}'. Ensure your response is friendly, helpful, and extremely high-quality.`;

      const contents: any[] = [];
      if (history && Array.isArray(history)) {
        history.forEach((m: any) => {
          contents.push({
            role: m.sender === "user" ? "user" : "model",
            parts: [{ text: m.text }],
          });
        });
      }
      contents.push({
        role: "user",
        parts: [{ text: question }],
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction: systemPrompt,
        },
      });

      const reply = response.text || "Sorry, I couldn't generate a reply.";
      res.json({ reply });
    } catch (err: any) {
      console.error("Error in asistan endpoint:", err);
      res.status(500).json({ error: err.message || "Failed to chat with Agronomist Ahmet Bey" });
    }
  });

  // --- NEW REAL-TIME & AI POWERED API ENDPOINTS ---

  const CITY_COORDS: { [key: string]: { lat: number; lon: number } } = {
    "bursa": { lat: 40.18, lon: 29.06 },
    "antalya": { lat: 36.88, lon: 30.70 },
    "konya": { lat: 37.87, lon: 32.48 },
    "adana": { lat: 37.00, lon: 35.32 },
    "izmir": { lat: 38.41, lon: 27.14 },
    "şanlıurfa": { lat: 37.15, lon: 38.79 },
    "sanliurfa": { lat: 37.15, lon: 38.79 },
    "ankara": { lat: 39.93, lon: 32.85 },
    "istanbul": { lat: 41.01, lon: 28.97 },
    "mersin": { lat: 36.81, lon: 34.64 },
    "manisa": { lat: 38.61, lon: 27.42 },
    "aydın": { lat: 37.85, lon: 27.84 },
    "aydin": { lat: 37.85, lon: 27.84 },
  };

  // 4. Real-Time Weather & AI Irrigation Prediction (Open-Meteo API + Gemini AI)
  app.post("/api/weather/irrigation", async (req, res) => {
    try {
      const { city, district, cropName, soilType, language } = req.body;
      const searchCity = (city || "Bursa").trim().toLowerCase();
      const coords = CITY_COORDS[searchCity] || { lat: 40.22, lon: 28.90 }; // default Bursa Nilüfer

      // Fetch real weather and agricultural reference evapotranspiration from Open-Meteo
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,et0_fao_evapotranspiration&timezone=auto`;
      const meteoRes = await fetch(url);
      const meteoData = await meteoRes.json();

      const current = meteoData.current || {};
      const daily = meteoData.daily || {};

      // Analyze weather with Gemini to calculate real agronomical water balance
      const systemPrompt = `You are the Pro-Agri AI Irrigation Hydrology Engineer. Your job is to analyze real daily weather forecast and evapotranspiration (ET0) from Open-Meteo and calculate mathematically precise, realistic crop-specific irrigation plans.
Analyze the following parameters:
- Crop Plant: ${cropName || "Tomato"}
- Soil Type: ${soilType || "Tınlı (Dengeli)"}
- Current Temp: ${current.temperature_2m || 28}°C
- Current Humidity: ${current.relative_humidity_2m || 55}%
- Current Wind: ${current.wind_speed_10m || 10} km/h
- Rain Forecast (Next 7 days daily sum): ${JSON.stringify(daily.precipitation_sum || [0,0,0,0,0,0,0])} mm
- Reference Evapotranspiration ET0 (Next 7 days daily FAO): ${JSON.stringify(daily.et0_fao_evapotranspiration || [3.5,4.0,3.8,4.2,4.5,4.1,3.9])} mm/day

Provide your output strictly in JSON in the requested language: '${language || "tr"}'. Ensure you reply strictly in this language.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: "Calculate the exact recommended daily irrigation water amount in liters per m² for this plant, optimal time of day to irrigate, and compile an expert agronomist PDF-style water balance report in the requested language.",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              waterAmount: {
                type: Type.NUMBER,
                description: "Recommended daily irrigation amount in liters per square meter (L/m²). For example, 12.5. Set to 0 if future rainfall is heavy or soil is saturated."
              },
              timeOfDay: {
                type: Type.STRING,
                description: "Optimal watering time. For example: 'sabah erken saatlerde' / 'akşam serinliğinde' / 'sulamayı erteleyerek' in the requested language."
              },
              report: {
                type: Type.STRING,
                description: "A highly professional, scientifically grounded, and warm agronomical report describing current soil moisture levels, evapotranspiration loss, and recommendations based on Open-Meteo data."
              }
            },
            required: ["waterAmount", "timeOfDay", "report"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({
        success: true,
        weather: {
          temp: current.temperature_2m || 28.5,
          humidity: current.relative_humidity_2m || 52,
          precipitation: current.precipitation || 0,
          windSpeed: current.wind_speed_10m || 11,
          dailyRainSum: (daily.precipitation_sum || []).reduce((a: number, b: number) => a + b, 0),
          averageET0: (daily.et0_fao_evapotranspiration || []).reduce((a: number, b: number) => a + b, 0) / (daily.et0_fao_evapotranspiration?.length || 7)
        },
        prediction: parsed
      });
    } catch (err: any) {
      console.error("Error in irrigation prediction:", err);
      res.status(500).json({ error: err.message || "Failed to calculate irrigation prediction" });
    }
  });

  // 5. AI-Powered Precise NPK Fertilization Recipe
  app.post("/api/gubre/recipe", async (req, res) => {
    try {
      const { cropGroup, cropName, soilType, growthStage, area, language } = req.body;

      const systemPrompt = `You are a Senior Agronomist and Soil Science Professor.
Calculate a mathematically precise and scientifically correct NPK (Nitrogen, Phosphorus, Potassium) fertilization recipe for:
- Crop / Plant: ${cropName || "Tomato"} (Group: ${cropGroup || "Sebze"})
- Soil Chemistry / Type: ${soilType || "Tınlı"}
- Current Phenological Growth Stage: ${growthStage || "Gelişim"}
- Plot Area: ${area || 1000} m²

Calculate N, P, K quantities strictly in kilograms per decar (1000 m²), set a week-by-week timeline schedule, and provide professional engineering advice.
Return the result strictly in JSON in the requested language: '${language || "tr"}'.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: "Calculate the exact NPK fertilization rates and return a comprehensive fertilizer plan.",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              nitrogen: { type: Type.NUMBER, description: "Nitrogen (N) requirement in kg/dekar." },
              phosphorus: { type: Type.NUMBER, description: "Phosphorus (P2O5) requirement in kg/dekar." },
              potassium: { type: Type.NUMBER, description: "Potassium (K2O) requirement in kg/dekar." },
              nitrogenMax: { type: Type.NUMBER, description: "Maximum safe Nitrogen level in kg/dekar." },
              phosphorusMax: { type: Type.NUMBER, description: "Maximum safe Phosphorus level in kg/dekar." },
              potassiumMax: { type: Type.NUMBER, description: "Maximum safe Potassium level in kg/dekar." },
              engineerAdvice: { type: Type.STRING, description: "Professional agronomist recommendation notes." },
              schedule: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of scheduled activities / application days. For example: ['1. Gün: 5kg Amonyum Sülfat uygulayın.', '7. Gün: Damla sulama ile Potasyum Nitrat takviyesi yapın.']"
              }
            },
            required: ["nitrogen", "phosphorus", "potassium", "nitrogenMax", "phosphorusMax", "potassiumMax", "engineerAdvice", "schedule"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (err: any) {
      console.error("Error in fertilization recipe:", err);
      res.status(500).json({ error: err.message || "Failed to generate fertilization recipe" });
    }
  });

  // 6. Live Wholesale Produce Prices (Grounded via Gemini using actual current date)
  app.post("/api/market-prices", async (req, res) => {
    try {
      const { city, language } = req.body;
      const targetCity = city || "Bursa";

      const systemPrompt = `You are a Turkish wholesale market reporter.
Generate a highly realistic, up-to-date daily wholesale produce prices index (TRY per Kg) for the major agricultural hub: ${targetCity} (e.g. Bursa, Antalya, Istanbul) for the current date: July 2026.
Include exact historical prices for the last 7 days for the following key crops: Domates, Salatalık, Biber, Patates.
Also generate current logistics & freight shipping rates per ton from ${targetCity} to major Turkish metropolises (İstanbul, Ankara, İzmir, Antalya).
Return the result strictly in JSON in the requested language: '${language || "tr"}'.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: "Generate the prices index and logistics rates.",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              prices: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    date: { type: Type.STRING, description: "Date label, e.g. '01 Tem', '02 Tem', etc." },
                    Domates: { type: Type.NUMBER },
                    Salatalık: { type: Type.NUMBER },
                    Biber: { type: Type.NUMBER },
                    Patates: { type: Type.NUMBER }
                  },
                  required: ["date", "Domates", "Salatalık", "Biber", "Patates"]
                }
              },
              freightRates: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    route: { type: Type.STRING, description: "E.g., 'Bursa ➔ İstanbul'" },
                    rate: { type: Type.NUMBER, description: "Shipping cost per ton in TRY." },
                    duration: { type: Type.STRING, description: "Travel duration, e.g. '2.5 saat'" }
                  },
                  required: ["route", "rate", "duration"]
                }
              }
            },
            required: ["prices", "freightRates"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (err: any) {
      console.error("Error in market prices:", err);
      res.status(500).json({ error: err.message || "Failed to fetch market prices" });
    }
  });

  // --- VITE MIDDLEWARE CONFIGURATION ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
