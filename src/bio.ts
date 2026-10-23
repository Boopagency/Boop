// Link da bio: abas Empresa/Profissional, formulário antes do WhatsApp e o lead no Comercial (Boop Admin).

// A chave publicável é pública por natureza: o banco só deixa a visita chamar public.site_lead.
const LEADS_URL = 'https://zqugfixszhfoochvaaol.supabase.co/rest/v1/rpc/site_lead';
const LEADS_KEY = 'sb_publishable_4BltPf_HUOUvsVG7sFqkIA_Hli9J3Rk';
const WHATSAPP = '5542999379186';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

const params = new URLSearchParams(location.search);
const utm = Object.fromEntries(UTM_KEYS.flatMap(key => {
  const value = params.get(key)?.trim();
  return value ? [[key, value.slice(0, 100)]] : [];
}));

// Abas --------------------------------------------------------------------

const switcher = document.querySelector<HTMLElement>('.bio-switch')!;
const tabs = [...switcher.querySelectorAll<HTMLButtonElement>('[role="tab"]')];

function select(tab: HTMLButtonElement, focus = false) {
  for (const item of tabs) {
    const active = item === tab;
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')!)!.hidden = !active;
  }
  switcher.dataset.perfil = tab.dataset.perfil;
  if (focus) tab.focus();
  observeActions();
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => select(tab));
  tab.addEventListener('keydown', event => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    select(tabs[(index + step + tabs.length) % tabs.length], true);
  });
});

// Botão fixo do celular: some quando o botão da aba está na tela.

const dock = document.querySelector<HTMLElement>('.bio-dock')!;
const visible = new Set<Element>();
const watcher = new IntersectionObserver(entries => {
  for (const entry of entries) entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target);
  dock.classList.toggle('is-hidden', visible.size > 0);
});
function observeActions() {
  watcher.disconnect();
  visible.clear();
  document.querySelectorAll('.bio-panel:not([hidden]) .bio-actions, .bio-closing').forEach(el => watcher.observe(el));
}
observeActions();

// Formulário --------------------------------------------------------------

const dialog = document.querySelector<HTMLDialogElement>('#conversa')!;
const form = dialog.querySelector<HTMLFormElement>('form')!;
const fields = form.elements as HTMLFormControlsCollection & Record<'nome' | 'whatsapp' | 'empresa' | 'site', HTMLInputElement>;
const error = form.querySelector<HTMLElement>('.bio-error')!;
const submit = form.querySelector<HTMLButtonElement>('.bio-submit')!;
const submitLabel = submit.querySelector('span')!;

document.querySelectorAll('[data-lead]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  dialog.showModal();
  fields.nome.focus();
}));
dialog.querySelector('.bio-close')!.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });

/** Celular ou fixo do Brasil, só os dígitos do DDD em diante. */
function phoneDigits(value: string) {
  const digits = value.replace(/\D/g, '');
  return (/^55\d{10,11}$/.test(digits) ? digits.slice(2) : digits).slice(0, 11);
}

fields.whatsapp.addEventListener('input', () => {
  const d = phoneDigits(fields.whatsapp.value);
  const split = d.length === 11 ? 7 : 6;
  fields.whatsapp.value = d.length <= 2 ? (d ? `(${d}` : '')
    : d.length <= 6 ? `(${d.slice(0, 2)}) ${d.slice(2)}`
    : `(${d.slice(0, 2)}) ${d.slice(2, split)}-${d.slice(split)}`;
  fields.whatsapp.removeAttribute('aria-invalid');
});
fields.nome.addEventListener('input', () => fields.nome.removeAttribute('aria-invalid'));

function fail(input: HTMLInputElement, message: string) {
  input.setAttribute('aria-invalid', 'true');
  input.focus();
  error.textContent = message;
}

async function saveLead(body: object) {
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

form.addEventListener('submit', async event => {
  event.preventDefault();
  error.textContent = '';
  const name = fields.nome.value.replace(/\s+/g, ' ').trim();
  const phone = phoneDigits(fields.whatsapp.value);
  const company = fields.empresa.value.replace(/\s+/g, ' ').trim();
  const service = form.querySelector<HTMLInputElement>('[name="frente"]:checked')?.value ?? '';
  const profile = switcher.dataset.perfil;
  if (name.length < 2) return fail(fields.nome, 'Conta pra gente o seu nome.');
  if (!/^[1-9]{2}\d{8,9}$/.test(phone)) return fail(fields.whatsapp, 'Confira o WhatsApp, com DDD.');

  submit.disabled = true;
  submitLabel.textContent = 'Abrindo o WhatsApp…';
  // O lead vai para o Comercial; se a rede falhar, a conversa abre do mesmo jeito.
  if (!fields.site.value) {
    await saveLead({
      lead_name: name, lead_phone: phone, lead_company: company || null,
      lead_service: service || null, lead_profile: profile, lead_utm: utm,
    }).catch(() => {});
  }
  const subject = `${service ? `${service.toLowerCase()} para ` : ''}${profile === 'professional' ? 'a minha marca pessoal' : 'o meu negócio'}`;
  const text = `Oi, Boop! Sou ${name}${company ? ` (${company})` : ''}. Vim pelo link da bio e quero conversar sobre ${subject}.`;
  location.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
});

// Voltou do WhatsApp (cache do navegador): o botão volta ao normal.
addEventListener('pageshow', () => {
  submit.disabled = false;
  submitLabel.textContent = 'Continuar no WhatsApp';
});
