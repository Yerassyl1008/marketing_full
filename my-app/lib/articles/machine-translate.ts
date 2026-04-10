const CHUNK = 4200;

function chunkForTranslate(text: string): string[] {
  if (text.length <= CHUNK) return text ? [text] : [""];
  const parts: string[] = [];
  let rest = text;
  while (rest.length > 0) {
    let cut = rest.lastIndexOf("\n\n", CHUNK);
    if (cut < CHUNK / 2) cut = rest.lastIndexOf("\n", CHUNK);
    if (cut < CHUNK / 2) cut = CHUNK;
    parts.push(rest.slice(0, cut));
    rest = rest.slice(cut).replace(/^\n+/, "");
  }
  return parts;
}

function parseGtxJson(data: unknown): string {
  if (!Array.isArray(data) || !Array.isArray(data[0])) return "";
  let out = "";
  for (const row of data[0]) {
    if (Array.isArray(row) && typeof row[0] === "string") out += row[0];
  }
  return out;
}

async function translateChunk(text: string, targetLocale: string): Promise<string> {
  if (!text.trim()) return text;
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "ru");
  url.searchParams.set("tl", targetLocale);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", text);

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; MarketingBlog/1.0; +https://example.invalid)",
    },
    next: { revalidate: 86_400 },
  });
  if (!res.ok) return text;
  const data: unknown = await res.json();
  const translated = parseGtxJson(data);
  return translated.trim() ? translated : text;
}

export function isArticleMachineTranslateEnabled(): boolean {
  const v = process.env.ARTICLE_MACHINE_TRANSLATE?.trim().toLowerCase();
  if (v === "0" || v === "false") return false;
  if (v === "1" || v === "true") return true;
  return process.env.NODE_ENV === "development";
}

export async function machineTranslateText(
  text: string,
  targetLocale: string,
): Promise<string> {
  if (!isArticleMachineTranslateEnabled() || targetLocale === "ru" || !text.trim()) {
    return text;
  }
  const chunks = chunkForTranslate(text);
  const out: string[] = [];
  for (const c of chunks) {
    out.push(await translateChunk(c, targetLocale));
  }
  return out.join("\n\n");
}
