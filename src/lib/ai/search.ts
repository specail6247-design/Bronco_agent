export async function searchGoogle(query: string) {
  const enabled = process.env.SERPER_ENABLED === 'true';
  if (!enabled) {
    console.warn('SERPER is disabled. Returning empty search results.');
    return [];
  }

  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    console.warn("SERPER_API_KEY is missing. Returning empty search results.");
    return [];
  }

  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query, gl: "kr", hl: "ko" }), // gl: kr, hl: ko for Korean context if needed
    });

    const data = await res.json();
    return data.organic || [];
  } catch (error) {
    console.error("Serper Search Error:", error);
    return [];
  }
}
