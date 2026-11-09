// Cloudflare Worker: Indian Visa Auto Fill Backend Proxy
// Shakil Travels Edition - 100% Free Serverless Hosting (100,000 requests/day)

export default {
  async fetch(request, env) {
    // 1. Handle CORS Preflight (OPTIONS request)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // 2. Health check on GET /
    if (request.method === "GET") {
      return new Response(JSON.stringify({
        status: "online",
        service: "Indian Visa Auto Fill Backend Proxy",
        owner: "Shakil Travels",
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // 3. Only allow POST for extraction
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed. Use POST." }), {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    try {
      const apiKey = env.GEMINI_API_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({
          error: "GEMINI_API_KEY secret is not set in Cloudflare Worker environment. Run: npx wrangler secret put GEMINI_API_KEY"
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      const body = await request.json();
      const parts = body.parts;

      if (!parts || !Array.isArray(parts)) {
        return new Response(JSON.stringify({ error: "Invalid payload: 'parts' array is required." }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      // Call Google Gemini 2.5 Flash
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const geminiResponse = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
          },
        }),
      });

      const data = await geminiResponse.json();

      if (!geminiResponse.ok) {
        return new Response(JSON.stringify({ error: data.error?.message || "Gemini API error" }), {
          status: geminiResponse.status,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      // Return successful response to Chrome Extension
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  },
};
