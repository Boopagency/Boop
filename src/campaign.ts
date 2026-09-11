import './tokens.css';
import './campaign.css';

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const desktop = matchMedia('(min-width: 1024px)');
const mobile = matchMedia('(max-width: 767px)');
const fine = matchMedia('(pointer: fine)');
const clamp = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n));
const menu = document.querySelector<HTMLDialogElement>('#mobile-menu')!;
const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle')!;
toggle.addEventListener('click', () => {
  menu.showModal(); toggle.setAttribute('aria-expanded','true'); document.body.style.overflow = 'hidden';
});
menu.querySelector('.menu-close')!.addEventListener('click', () => menu.close());
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => menu.close()));
menu.addEventListener('close', () => { document.body.style.overflow = ''; toggle.setAttribute('aria-expanded','false'); });
mobile.addEventListener('change', () => { if (!mobile.matches && menu.open) menu.close(); });

// A native, keyboard-operable tab system changes the whole capability scene.
const tablist = document.querySelector<HTMLElement>('.capability-tabs')!;
const tabs = [...tablist.querySelectorAll<HTMLButtonElement>('[role=tab]')];
function selectTab(index: number, moveFocus = false) {
  tabs.forEach((tab, i) => {
    const selected = i === index;
    tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1;
    const panel = document.getElementById(tab.getAttribute('aria-controls')!)!;
    panel.hidden = !selected;
    if (selected && !reduced.matches) {
      panel.querySelector('.world-word')!.animate([{transform:'translateX(64px)',opacity:.3},{transform:'translateX(0)',opacity:1}], {duration:600,easing:'cubic-bezier(.16,1,.3,1)'});
    }
  });
  if (moveFocus) tabs[index].focus();
}
tabs.forEach((tab,index) => tab.addEventListener('click', () => selectTab(index)));
tablist.addEventListener('keydown', event => {
  const index = tabs.indexOf(document.activeElement as HTMLButtonElement);
  let next = index;
  if (['ArrowDown','ArrowRight'].includes(event.key)) next = (index + 1) % tabs.length;
  else if (['ArrowUp','ArrowLeft'].includes(event.key)) next = (index - 1 + tabs.length) % tabs.length;
  else if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = tabs.length - 1;
  else return;
  event.preventDefault(); selectTab(next,true);
});
function setTabOrientation() { tablist.setAttribute('aria-orientation', mobile.matches ? 'horizontal' : 'vertical'); }
mobile.addEventListener('change',setTabOrientation); setTabOrientation();

const track = document.querySelector<HTMLOListElement>('.method-steps')!;
const steps = [...track.querySelectorAll<HTMLLIElement>('li')];
const previous = document.querySelector<HTMLButtonElement>('.method-prev')!;
const next = document.querySelector<HTMLButtonElement>('.method-next')!;
const current = document.querySelector<HTMLElement>('.method-current')!;
let methodIndex = 0;
function updateMethod() {
  const left = track.getBoundingClientRect().left;
  methodIndex = steps.reduce((best, step, index) => Math.abs(step.getBoundingClientRect().left-left) < Math.abs(steps[best].getBoundingClientRect().left-left) ? index : best, 0);
  // The final page exposes the last step even when multiple steps fit on desktop.
  if (track.scrollWidth - track.clientWidth - track.scrollLeft < 8) methodIndex = steps.length - 1;
  previous.disabled = track.scrollLeft < 8;
  next.disabled = track.scrollWidth - track.clientWidth - track.scrollLeft < 8;
  steps.forEach((step,index) => step.classList.toggle('is-active',index===methodIndex));
  current.textContent = `${String(methodIndex + 1).padStart(2,'0')} — ${steps[methodIndex].querySelector('h3')!.textContent}`;
}
function moveMethod(direction: number) {
  const distance = steps[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap);
  track.scrollBy({left:distance*direction,behavior:reduced.matches?'instant':'smooth'});
}
previous.addEventListener('click',()=>moveMethod(-1)); next.addEventListener('click',()=>moveMethod(1));
track.addEventListener('scroll',updateMethod,{passive:true});
track.addEventListener('keydown', event => {
  if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();moveMethod(event.key==='ArrowRight'?1:-1);}
  if(event.key==='Home'||event.key==='End'){event.preventDefault();track.scrollTo({left:event.key==='Home'?0:track.scrollWidth,behavior:reduced.matches?'instant':'smooth'});}
});

const hero = document.querySelector<HTMLElement>('.hero')!;
const object = document.querySelector<HTMLElement>('.hero-object')!;
const turn = document.querySelector<HTMLElement>('.turn')!;
const stage = document.querySelector<HTMLElement>('.turn-stage')!;
const film = document.querySelector<HTMLImageElement>('.brand-film img')!;
let frame = 0;
function updateScroll() {
  frame = 0;
  if(reduced.matches) return;
  const rect = turn.getBoundingClientRect();
  const progress = desktop.matches ? clamp((innerHeight*.38-rect.top)/(rect.height-innerHeight*.3)) : clamp((innerHeight*.8-rect.top)/(rect.height+innerHeight*.1));
  stage.style.setProperty('--strike',String(clamp(progress*2.8)));
  stage.style.setProperty('--underline',String(clamp((progress-.3)*2.3)));
  stage.style.setProperty('--quote-shift',`${progress*(desktop.matches?32:8)}px`);
  stage.style.setProperty('--quote-opacity',String(1-progress*.58));
  stage.style.setProperty('--question-scale',String(.88+progress*.12));
  stage.style.setProperty('--question-shift',`${(1-progress)*(desktop.matches?48:16)}px`);
  stage.style.setProperty('--connector-rotate',`${progress*45}deg`);
  if(desktop.matches){
    const heroProgress=clamp(-hero.getBoundingClientRect().top/hero.offsetHeight);
    object.style.translate=`0 ${heroProgress*64}px`;
    const filmRect=film.getBoundingClientRect();
    const filmProgress=clamp((innerHeight-filmRect.top)/(innerHeight+filmRect.height));
    film.style.clipPath=`inset(0 ${Math.max(0,8-filmProgress*24)}%)`;
  }
}
const requestScroll=()=>{if(!frame)frame=requestAnimationFrame(updateScroll)};
hero.addEventListener('pointermove',event=>{
  if(reduced.matches||!desktop.matches||!fine.matches)return;
  const r=hero.getBoundingClientRect();
  object.style.setProperty('--object-x',`${(event.clientX/r.width-.5)*24}px`);
  object.style.setProperty('--object-y',`${((event.clientY-r.top)/r.height-.5)*16}px`);
  object.style.setProperty('--object-rotate',`${-7+(event.clientX/r.width-.5)*3}deg`);
});
hero.addEventListener('pointerleave',()=>{object.style.removeProperty('--object-x');object.style.removeProperty('--object-y');object.style.removeProperty('--object-rotate')});
function configureMotion(){
  document.documentElement.classList.toggle('motion-ready',!reduced.matches);
  if(reduced.matches){document.getAnimations().forEach(a=>a.cancel());stage.removeAttribute('style');object.removeAttribute('style');film.style.clipPath='';}
  if(!desktop.matches){object.removeAttribute('style');film.style.clipPath='';}
  requestScroll();updateMethod();
}
addEventListener('scroll',requestScroll,{passive:true});
addEventListener('resize',()=>{requestScroll();updateMethod()},{passive:true});
reduced.addEventListener('change',configureMotion);desktop.addEventListener('change',configureMotion);configureMotion();
document.fonts.ready.then(()=>{
  if(reduced.matches||scrollY>innerHeight/2)return;
  object.animate([{opacity:0,translate:'0 40px'},{opacity:1,translate:'0 0'}],{duration:1000,easing:'cubic-bezier(.16,1,.3,1)'});
  document.querySelector('.hero-title')!.animate([{clipPath:'inset(0 0 100%)'},{clipPath:'inset(0)'}],{duration:800,easing:'cubic-bezier(.16,1,.3,1)'});
});
