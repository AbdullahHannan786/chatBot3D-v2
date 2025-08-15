export async function POST(req) {
  try {
    const body = await req.json();
    const base = process.env.BACKEND_URL || "http://127.0.0.1:5001";

    const res = await fetch(`${base}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });

    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("content-type") || "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Proxy /api/ask failed", detail: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
