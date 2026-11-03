// Página de vendas do link na bio: formulário antes do WhatsApp, o lead no Comercial (Boop Admin).

import { WHATSAPP, maskPhone, phoneDigits, saveLead, utm } from './lead';

// Botão fixo do celular: some quando outro botão de pedido está na tela.
const dock = document.querySelector<HTMLElement>('.bio-dock')!;
const visible = new Set<Element>();
const watcher = new IntersectionObserver(entries => {
  for (const entry of entries) entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target);
  dock.classList.toggle('is-hidden', visible.size > 0);
});
document.querySelectorAll('main [data-lead]').forEach(el => watcher.observe(el));

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

maskPhone(fields.whatsapp);
fields.nome.addEventListener('input', () => fields.nome.removeAttribute('aria-invalid'));

function fail(input: HTMLInputElement, message: string) {
  input.setAttribute('aria-invalid', 'true');
  input.focus();
  error.textContent = message;
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  error.textContent = '';
  const name = fields.nome.value.replace(/\s+/g, ' ').trim();
  const phone = phoneDigits(fields.whatsapp.value);
  const handle = fields.empresa.value.replace(/\s+/g, '').replace(/^@?(.+)$/, '@$1');
  if (name.length < 2) return fail(fields.nome, 'Conta pra gente o seu nome.');
  if (!/^[1-9]{2}\d{8,9}$/.test(phone)) return fail(fields.whatsapp, 'Confira o WhatsApp, com DDD.');

  submit.disabled = true;
  submitLabel.textContent = 'Abrindo o WhatsApp…';
  // O lead vai para o Comercial; se a rede falhar, a conversa abre do mesmo jeito.
  if (!fields.site.value) {
    await saveLead({
      lead_name: name, lead_phone: phone, lead_company: handle || null,
      lead_service: 'Link na bio', lead_profile: null,
      lead_utm: { utm_campaign: 'link-na-bio', ...utm },
    }).catch(() => {});
  }
  const text = `Oi, Boop! Sou ${name}${handle ? ` (${handle})` : ''}. Quero o meu link na bio de R$ 97.`;
  location.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
});

// Voltou do WhatsApp (cache do navegador): o botão volta ao normal.
addEventListener('pageshow', () => {
  submit.disabled = false;
  submitLabel.textContent = 'Continuar no WhatsApp';
});
