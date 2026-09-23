// Local integration hooks only: no tracker, storage, identifier or network request.
function signal(action: string, placement: string) {
  document.dispatchEvent(new CustomEvent('boop:interaction', {detail:{action,placement}}));
}
document.querySelectorAll<HTMLAnchorElement>('a[href="mailto:contato@deumboop.com.br"],a[href^="https://wa.me/"],a[href="#contato"]').forEach(link => {
  link.addEventListener('click',()=>signal('contact',link.closest('header')?'header':link.closest('dialog')?'menu':link.closest('#inicio')?'hero':'contact'));
});
document.querySelectorAll<HTMLAnchorElement>('.case-feature,.case-secondary,.case-velmont').forEach((link,index)=>link.addEventListener('click',()=>signal('case',String(index+1))));
const load=document.querySelector<HTMLButtonElement>('.instagram-load')!;
const disable=document.querySelector<HTMLButtonElement>('.instagram-disable')!;
const placeholder=document.querySelector<HTMLElement>('.instagram-placeholder')!;
const frame=document.querySelector<HTMLElement>('.instagram-frame')!;
load.addEventListener('click',()=>{
  const iframe=document.createElement('iframe');
  iframe.src='https://www.instagram.com/boop.oficial_/embed/';
  iframe.title='Perfil da Boop no Instagram';
  iframe.referrerPolicy='strict-origin-when-cross-origin';
  iframe.allow='encrypted-media';iframe.width='640';iframe.height='470';
  frame.replaceChildren(iframe);frame.hidden=false;placeholder.hidden=true;disable.hidden=false;
  disable.focus();signal('instagram_load','instagram');
});
disable.addEventListener('click',()=>{
  frame.replaceChildren();frame.hidden=true;placeholder.hidden=false;disable.hidden=true;load.focus();
  signal('instagram_disable','instagram');
});
