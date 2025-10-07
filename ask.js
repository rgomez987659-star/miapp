export async function onRequestGet(context) {
  const { request } = context; const url = new URL(request.url); const q = url.searchParams.get('q');
  if(!q) return new Response(JSON.stringify({error:'missing q'}), {status:400, headers:{'content-type':'application/json'}});

  const headers = { 'User-Agent': 'JustPersonal-Rentas/1.0 (+https://example.com)' };

  async function ddgInstant(q){
    const u = 'https://api.duckduckgo.com/?' + new URLSearchParams({ q, format:'json', no_html:'1', skip_disambig:'0' });
    const r = await fetch(u, { headers });
    if(!r.ok) return [];
    const j = await r.json();
    const out = [];
    if (j.AbstractText) out.push({ title: j.Heading || 'Resumen', url: j.AbstractURL || '', snippet: j.AbstractText });
    if (Array.isArray(j.RelatedTopics)){
      for(const t of j.RelatedTopics){
        if(t.FirstURL && t.Text) out.push({ title: (t.Text||'').split(' - ')[0], url: t.FirstURL, snippet: t.Text });
        if(t.Topics) for(const k of t.Topics){ if(k.FirstURL && k.Text) out.push({ title:(k.Text||'').split(' - ')[0], url:k.FirstURL, snippet:k.Text }); }
        if(out.length>=5) break;
      }
    }
    return out;
  }

  async function wikiSearch(q){
    const u = 'https://en.wikipedia.org/w/rest.php/v1/search/page?' + new URLSearchParams({ q, limit:'3' });
    const r = await fetch(u, { headers }); if(!r.ok) return [];
    const j = await r.json();
    const pages = j?.pages || [];
    const results = [];
    for(const p of pages){
      const sumU = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(p.key)}`;
      const sr = await fetch(sumU, { headers }); if(!sr.ok) continue; const sj = await sr.json();
      results.push({ title: sj.title, url: sj.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(p.key)}`, snippet: sj.extract });
    }
    return results;
  }

  let sources = await ddgInstant(q) || [];
  if(sources.length < 2){ const more = await wikiSearch(q); sources = [...sources, ...more]; }

  const answer = sources.length ? `Encontré ${sources.length} resultado(s) relevantes. Aquí tienes un resumen y fuentes:` : `No encontré resultados claros. Intenta ser más específico.`;
  return new Response(JSON.stringify({ answer, sources }), { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}