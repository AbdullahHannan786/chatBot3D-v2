export async function POST() {
  try {
    const base = process.env.BACKEND_URL || "http://127.0.0.1:5001";
    const res = await fetch(`${base}/reset`, { method: "POST" });
    const text = await res.text();

    return new Response(text, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("content-type") || "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Proxy /api/reset failed", detail: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
