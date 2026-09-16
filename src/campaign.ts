import './tokens.css';
import './campaign.css';
import './evolution.css';
import './launch.css';
import './interactions';
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const room = matchMedia('(min-height: 620px)');
const desktop = matchMedia('(min-width: 1024px)');
const fine = matchMedia('(pointer: fine)');
const clamp = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n));
const q = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const all = <T extends HTMLElement>(selector: string) => [...document.querySelectorAll<T>(selector)];
const menu = q<HTMLDialogElement>('#mobile-menu');
const toggle = q<HTMLButtonElement>('.menu-toggle');
toggle.addEventListener('click', () => { menu.showModal(); toggle.setAttribute('aria-expanded','true'); document.body.style.overflow='hidden'; });
menu.querySelector('.menu-close')!.addEventListener('click', () => menu.close());
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  menu.close();
  if(a.hash) requestAnimationFrame(() => { const target=document.querySelector<HTMLElement>(a.hash); if(target){target.tabIndex=-1; target.focus({preventScroll:true});} });
}));
menu.addEventListener('close', () => { document.body.style.overflow=''; toggle.setAttribute('aria-expanded','false'); });
matchMedia('(max-width: 767px)').addEventListener('change', e => { if(!e.matches && menu.open) menu.close(); });
const turn = q('#visao'), quotes = all('.request-quote'), count = q('.request-count');
const caps = q('#frentes'), worlds = all('.cap-world'), indices = all('.cap-index li');
const method = q('#metodo'), track = q<HTMLOListElement>('.method-steps'), viewport = q('.method-viewport'), steps = all('.method-steps li');
const previous = q<HTMLButtonElement>('.method-prev'), next = q<HTMLButtonElement>('.method-next'), current = q('.method-current');
const hero = q('.hero'), object = q('.hero-object');
let enabled = false, pending = 0, methodIndex = -1, capabilityIndex = -1, quoteIndex = -1, travel = 0;
type Scene = { element: HTMLElement; top: number; span: number };
let scenes: Scene[] = [];
function measure() {
  scenes = [turn,caps,method].map(element => ({element, top:element.getBoundingClientRect().top+scrollY, span:Math.max(1,element.offsetHeight-element.querySelector<HTMLElement>('.scene-pin')!.offsetHeight)}));
  travel = Math.max(0,track.scrollWidth-viewport.clientWidth);
  requestFrame();
}
function progress(scene: Scene) { return clamp((scrollY-scene.top)/scene.span); }
function activateMethod(index: number) {
  if(methodIndex===index)return;
  methodIndex = index;
  steps.forEach((step,i) => {step.classList.toggle('is-active',i===index);if(i===index)step.setAttribute('aria-current','step');else step.removeAttribute('aria-current');});
  current.textContent = `${String(index+1).padStart(2,'0')} — ${steps[index].querySelector('h3')!.textContent}`;
  previous.disabled = index===0; next.disabled = index===steps.length-1;
}
function render() {
  pending=0;
  if(!enabled || scenes.length!==3) return;
  const [a,b,c] = scenes;
  const p = progress(a), quotePhase = Math.min(p/.78, .99999)*3, qi = Math.floor(quotePhase);
  if(qi!==quoteIndex) {
    quoteIndex=qi;
    quotes.forEach((quote,i) => { quote.classList.toggle('is-active', i===qi); quote.setAttribute('aria-hidden',String(i!==qi)); });
    count.textContent=`0${qi+1} — 03`;
  }
  turn.style.setProperty('--strike',String(clamp((quotePhase-qi-.18)*2.5)));
  turn.style.setProperty('--question-opacity',String(.55+clamp((p-.1)/.8)*.45));
  turn.style.setProperty('--underline',String(clamp((p-.7)/.25)));
  turn.style.setProperty('--progress',String(p));
  const cp = progress(b), ci = Math.min(2,Math.floor(cp*3));
  if(ci!==capabilityIndex) {
    capabilityIndex=ci;
    worlds.forEach((world,i) => { world.classList.toggle('is-active',i===ci); world.inert=i!==ci; world.setAttribute('aria-hidden',String(i!==ci)); indices[i].classList.toggle('is-active',i===ci);const button=indices[i].querySelector('button')!;if(i===ci)button.setAttribute('aria-current','true');else button.removeAttribute('aria-current'); });
  }
  caps.style.setProperty('--progress',String(cp));
  const mp = progress(c), movement=clamp((mp-.04)/.9);
  track.style.transform=`translate3d(${-travel*movement}px,0,0)`;
  method.style.setProperty('--progress',String(mp));
  activateMethod(Math.min(steps.length-1,Math.round(movement*(steps.length-1))));
  if(desktop.matches && hero.getBoundingClientRect().bottom>0) object.style.translate=`0 ${clamp(-hero.getBoundingClientRect().top/hero.offsetHeight)*48}px`;
}
function requestFrame(){ if(!pending) pending=requestAnimationFrame(render); }
function configure(){
  enabled=!reduced.matches && room.matches;
  document.documentElement.classList.toggle('scroll-motion',enabled);
  worlds.forEach(world=>{world.inert=false;world.removeAttribute('aria-hidden');});
  quotes.forEach(quote=>quote.removeAttribute('aria-hidden'));
  capabilityIndex=-1;quoteIndex=-1;
  if(!enabled){ track.style.transform=''; [turn,caps,method,object].forEach(el=>el.removeAttribute('style')); document.getAnimations().forEach(a=>a.cancel()); }
  measure();
}
function moveMethod(index: number) {
  index=clamp(index,0,steps.length-1);
  if(enabled){ const scene=scenes[2]; scrollTo({top:scene.top+scene.span*(.04+.9*index/(steps.length-1)),behavior:reduced.matches?'instant':'smooth'}); }
  else steps[index].scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'center'});
  activateMethod(index);
}
previous.addEventListener('click',()=>moveMethod(methodIndex-1));
next.addEventListener('click',()=>moveMethod(methodIndex+1));
track.addEventListener('keydown',e=>{
  if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;
  e.preventDefault(); moveMethod(e.key==='Home'?0:e.key==='End'?steps.length-1:methodIndex+(e.key==='ArrowRight'?1:-1));
});
hero.addEventListener('pointermove',e=>{
  if(reduced.matches||!desktop.matches||!fine.matches)return;
  const rect=hero.getBoundingClientRect();
  object.style.setProperty('--object-x',`${(e.clientX/rect.width-.5)*20}px`);
  object.style.setProperty('--object-y',`${((e.clientY-rect.top)/rect.height-.5)*12}px`);
});
hero.addEventListener('pointerleave',()=>{object.style.removeProperty('--object-x');object.style.removeProperty('--object-y');});
addEventListener('scroll',requestFrame,{passive:true});
addEventListener('resize',measure,{passive:true});
reduced.addEventListener('change',configure);room.addEventListener('change',configure);
new ResizeObserver(measure).observe(document.body);
configure(); document.fonts.ready.then(measure); addEventListener('pageshow',measure);

all<HTMLButtonElement>('[data-capability]').forEach(button=>button.addEventListener('click',()=>{
  const index=Number(button.dataset.capability);
  if(enabled){const scene=scenes[1];scrollTo({top:scene.top+scene.span*((index+.15)/worlds.length),behavior:'smooth'});}
  else {worlds[index].scrollIntoView({block:'center',behavior:'instant'});worlds[index].focus({preventScroll:true});}
}));
desktop.addEventListener('change',()=>{object.removeAttribute('style');measure();});
activateMethod(0);
