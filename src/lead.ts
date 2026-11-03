// Lead do site: vai para o Comercial do Boop Admin (public.site_lead) antes de abrir o WhatsApp.
// Usado pelo link da bio (/link/) e pela página de vendas do link na bio (/link-na-bio/).

// A chave publicável é pública por natureza: o banco só deixa a visita chamar public.site_lead.
const LEADS_URL = 'https://zqugfixszhfoochvaaol.supabase.co/rest/v1/rpc/site_lead';
const LEADS_KEY = 'sb_publishable_4BltPf_HUOUvsVG7sFqkIA_Hli9J3Rk';
export const WHATSAPP = '5542999379186';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

const params = new URLSearchParams(location.search);
export const utm = Object.fromEntries(UTM_KEYS.flatMap(key => {
  const value = params.get(key)?.trim();
  return value ? [[key, value.slice(0, 100)]] : [];
}));

/** Celular ou fixo do Brasil, só os dígitos do DDD em diante. */
export function phoneDigits(value: string) {
  const digits = value.replace(/\D/g, '');
  return (/^55\d{10,11}$/.test(digits) ? digits.slice(2) : digits).slice(0, 11);
}

/** Formata o campo como (41) 99999-9999 enquanto a pessoa digita. */
export function maskPhone(input: HTMLInputElement) {
  input.addEventListener('input', () => {
    const d = phoneDigits(input.value);
    const split = d.length === 11 ? 7 : 6;
    input.value = d.length <= 2 ? (d ? `(${d}` : '')
      : d.length <= 6 ? `(${d.slice(0, 2)}) ${d.slice(2)}`
      : `(${d.slice(0, 2)}) ${d.slice(2, split)}-${d.slice(split)}`;
    input.removeAttribute('aria-invalid');
  });
}

export async function saveLead(body: object) {
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), 6000);
  try {
    await fetch(LEADS_URL, {
      method: 'POST',
      headers: { apikey: LEADS_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: abort.signal,
      keepalive: true,
    });
  } finally {
    clearTimeout(timer);
  }
}
