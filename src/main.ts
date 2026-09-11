import './tokens.css';
import './style.css';
import eyesMarkup from '../public/assets/olhar.svg?raw';

const menu = document.querySelector<HTMLDialogElement>('#mobile-menu')!;
const menuToggle = document.querySelector<HTMLButtonElement>('.menu-toggle')!;
const closeMenu = () => menu.close();
menuToggle.addEventListener('click', () => {
  menu.showModal();
  menuToggle.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
});
menu.querySelector('.menu-close')!.addEventListener('click', closeMenu);
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
menu.addEventListener('close', () => {
  document.body.style.overflow = '';
  menuToggle.setAttribute('aria-expanded', 'false');
});
window.matchMedia('(min-width: 768px)').addEventListener('change', event => {
  if (event.matches && menu.open) closeMenu();
});

const eyes = document.querySelector<HTMLElement>('.hero-eyes')!;
// The supplied brand drawing is kept intact; only its pupil groups move.
eyes.innerHTML = eyesMarkup;
const svg = eyes.querySelector('svg')!;
svg.setAttribute('aria-hidden', 'true');
const pupils: SVGGElement[] = [];
svg.querySelectorAll('ellipse[fill="#1A1A1A"]').forEach(ellipse => {
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const glint = ellipse.nextElementSibling;
  ellipse.before(group);
  group.append(ellipse);
  if (glint?.tagName.toLowerCase() === 'ellipse') group.append(glint);
  group.classList.add('pupil');
  pupils.push(group);
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const desktop = window.matchMedia('(min-width: 1024px)');
const finePointer = window.matchMedia('(pointer: fine)');
const hero = document.querySelector<HTMLElement>('.hero')!;
const turn = document.querySelector<HTMLElement>('.turn')!;
const turnStage = document.querySelector<HTMLElement>('.turn-stage')!;
const quote = document.querySelector<HTMLElement>('.request-quote')!;
const steps = [...document.querySelectorAll<HTMLElement>('.method-steps li')];
const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));
let frame = 0;
let revealObserver: IntersectionObserver | undefined;

function lookAt(x: number, y: number) {
  if (reducedMotion.matches || !finePointer.matches || !desktop.matches) return;
  const bounds = svg.getBoundingClientRect();
  const dx = clamp((x - bounds.left - bounds.width / 2) / innerWidth, -1, 1) * 8;
  const dy = clamp((y - bounds.top - bounds.height / 2) / innerHeight, -1, 1) * 8;
  pupils.forEach(pupil => { pupil.style.transform = `translate(${dx}px,${dy}px)`; });
}
hero.addEventListener('pointermove', event => lookAt(event.clientX, event.clientY));
hero.addEventListener('pointerleave', () => pupils.forEach(pupil => { pupil.style.transform = ''; }));
document.addEventListener('focusin', event => {
  if (event.target instanceof HTMLElement) {
    const rect = event.target.getBoundingClientRect();
    lookAt(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }
});

function updateScroll() {
  frame = 0;
  if (reducedMotion.matches) return;
  if (desktop.matches) {
    const bounds = turn.getBoundingClientRect();
    const progress = clamp((innerHeight * .38 - bounds.top) / (bounds.height - innerHeight * .3));
    turnStage.style.setProperty('--strike', String(clamp(progress * 3)));
    turnStage.style.setProperty('--underline', String(clamp((progress - .28) * 2.2)));
    turnStage.style.setProperty('--question-shift', `${(1 - progress) * 32}px`);
    const nextQuote = progress > .52 ? '“Preciso vender melhor.”' : '“Preciso de um site.”';
    if (quote.textContent !== nextQuote) {
      quote.textContent = nextQuote;
      quote.animate([{transform:'translateY(8px)',opacity:.4},{transform:'translateY(0)',opacity:1}], {duration:240,easing:'cubic-bezier(.2,.8,.2,1)'});
    }
  }
  let closest: HTMLElement | undefined;
  let distance = Infinity;
  steps.forEach(step => {
    const rect = step.getBoundingClientRect();
    const delta = Math.abs(rect.top + rect.height / 2 - innerHeight * .48);
    if (rect.top < innerHeight && rect.bottom > 0 && delta < distance) { closest = step; distance = delta; }
  });
  steps.forEach(step => step.classList.toggle('is-active', step === closest));
}
function requestScrollUpdate() { if (!frame) frame = requestAnimationFrame(updateScroll); }
window.addEventListener('scroll', requestScrollUpdate, {passive:true});
window.addEventListener('resize', requestScrollUpdate, {passive:true});

function configureMotion() {
  revealObserver?.disconnect();
  document.querySelectorAll('.reveal-pending').forEach(el => el.classList.remove('reveal-pending'));
  document.documentElement.classList.toggle('motion-ready', !reducedMotion.matches);
  if (reducedMotion.matches) {
    document.getAnimations().forEach(animation => animation.cancel());
    pupils.forEach(pupil => { pupil.style.transform = ''; });
    quote.textContent = '“Preciso de um site.”';
    turnStage.removeAttribute('style');
    steps.forEach(step => step.classList.remove('is-active'));
    return;
  }
  revealObserver = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.remove('reveal-pending');
      entry.target.classList.add('reveal-done');
      revealObserver?.unobserve(entry.target);
    }
  }, {threshold:.12});
  document.querySelectorAll<HTMLElement>('.brand-film, .universe-heading h2').forEach(el => {
    if (el.getBoundingClientRect().top > innerHeight && !el.classList.contains('reveal-done')) {
      el.classList.add('reveal-pending');
      revealObserver!.observe(el);
    }
  });
  requestScrollUpdate();
}
reducedMotion.addEventListener('change', configureMotion);
desktop.addEventListener('change', () => {
  if (!desktop.matches) {
    turnStage.removeAttribute('style');
    quote.textContent = '“Preciso de um site.”';
    pupils.forEach(pupil => { pupil.style.transform = ''; });
  }
  configureMotion();
});
configureMotion();

if (!reducedMotion.matches) {
  document.fonts.ready.then(() => {
    if (reducedMotion.matches || scrollY > innerHeight / 2) return;
    document.querySelectorAll('.hero-line').forEach((line, index) => {
      line.animate([{clipPath:'inset(100% 0 0)',transform:'translateY(40px)'},{clipPath:'inset(0 0 0)',transform:'translateY(0)'}], {duration:720,delay:index*60,easing:'cubic-bezier(.16,1,.3,1)'});
    });
    eyes.animate([{transform:'rotate(-16deg) translateY(24px)',opacity:0},{transform:'rotate(-9deg) translateY(0)',opacity:1}], {duration:1000,easing:'cubic-bezier(.16,1,.3,1)'});
  });
}
