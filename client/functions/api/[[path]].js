const DROP_REQUEST_HEADERS = [
  "host", "connection", "keep-alive", "transfer-encoding", "upgrade",
  "cf-connecting-ip", "cf-ipcountry", "cf-ray", "cf-visitor", "cf-worker",
  "x-forwarded-for", "x-forwarded-proto", "x-real-ip",
];

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

export async function onRequest({ request, env }) {
  const origin = (env.API_ORIGIN || "").replace(/\/+$/, "");
  if (!/^https?:\/\//.test(origin)) {
    return json(500, { error: "API_ORIGIN isn't set on the Cloudflare Pages project." });
  }

  const incoming = new URL(request.url);
  const target = origin + incoming.pathname + incoming.search; // keeps /api

  const headers = new Headers(request.headers);
  for (const h of DROP_REQUEST_HEADERS) headers.delete(h);
  const visitorIp = request.headers.get("cf-connecting-ip");
  if (visitorIp) headers.set("x-forwarded-for", visitorIp);
  headers.set("x-forwarded-proto", incoming.protocol.replace(":", ""));
  headers.set("x-forwarded-host", incoming.host);

  let upstream;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body: ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer(),
      redirect: "manual",
    });
  } catch {
    return json(502, { error: "Can't reach the event server right now. Try again in a moment." });
  }

  const out = new Response(upstream.body, upstream); // keeps Set-Cookie
  out.headers.set("cache-control", "no-store");
  return out;
}