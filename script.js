(() => {
  'use strict';
  const menuBtn = document.querySelector('.menu-btn');
  const nav = document.getElementById('mainNav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded','false');
    }));
  }

  const yearsSince = document.querySelector('[data-years-since]');
  if (yearsSince) {
    const startYear = Number(yearsSince.dataset.yearsSince);
    const years = new Date().getFullYear() - startYear;
    yearsSince.textContent = Number.isFinite(years) && years > 0
      ? String(years)
      : (yearsSince.dataset.fallback || '34');
  }

  const reveal = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('js-anim');
    const ro = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); ro.unobserve(e.target); }
      });
    }, {threshold: .08});
    reveal.forEach(el => ro.observe(el));
  }

  document.querySelectorAll('.track-cta').forEach(el => {
    el.addEventListener('click', () => {
      const type = el.dataset.cta || 'cta';
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({event:'cta_click', cta_type:type});
      if (typeof window.gtag === 'function') window.gtag('event','cta_click',{cta_type:type});
    }, {passive:true});
  });

  // Product photos open in an accessible viewer with zoom and touch/mouse panning.
  const tireImages = [...document.querySelectorAll('.tire-art img')];
  tireImages.forEach(img => {
    const art = img.closest('.tire-art');
    if (!art || art.querySelector('[data-tire-zoom]')) return;
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'tire-art-zoom'; button.dataset.tireZoom = '';
    button.setAttribute('aria-label', `${img.alt || 'Lastik'} görselini yakından incele`);
    button.innerHTML = '<span aria-hidden="true">⌕</span>'; art.append(button);
  });

  const zoomButtons = [...document.querySelectorAll('[data-tire-zoom]')];
  if (zoomButtons.length) {
    const dialog = document.createElement('div'); dialog.className = 'tire-zoom-dialog'; dialog.hidden = true;
    dialog.innerHTML = '<div class="tire-zoom-panel" role="dialog" aria-modal="true" aria-label="Lastik görseli"><div class="tire-zoom-toolbar"><strong class="tire-zoom-title"></strong><button type="button" data-zoom-out aria-label="Uzaklaştır">−</button><button type="button" data-zoom-in aria-label="Yakınlaştır">+</button><button type="button" data-zoom-reset aria-label="Görseli sığdır">Sığdır</button><button type="button" class="tire-zoom-close" data-zoom-close aria-label="Görseli kapat">×</button></div><div class="tire-zoom-stage"><img alt=""></div><span class="tire-zoom-help">Yakınlaştırmak için + veya tekerleği kullanın · Yakınlaşınca sürükleyin</span></div>';
    document.body.append(dialog);
    const stage = dialog.querySelector('.tire-zoom-stage'), zoomImg = stage.querySelector('img');
    const title = dialog.querySelector('.tire-zoom-title'), panel = dialog.querySelector('.tire-zoom-panel');
    let scale=1, x=0, y=0, opener=null, pointers=new Map(), pinchStart=0, pinchScale=1;
    const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
    const paint=()=>{zoomImg.style.transform=`translate(${x}px, ${y}px) scale(${scale})`;};
    const reset=()=>{scale=1;x=0;y=0;paint();};
    const setScale=next=>{scale=clamp(next,1,4);if(scale===1){x=0;y=0;}paint();};
    const close=()=>{dialog.hidden=true;document.body.style.overflow='';pointers.clear();if(opener)opener.focus();};
    const open=button=>{
      const img=button.matches('.hero-tire-viewer')?button.querySelector('img'):button.closest('.tire-art')?.querySelector('img');
      if(!img)return;
      opener=button;title.textContent=button.closest('.tire-card')?.querySelector('h3')?.textContent||'Goodyear Eagle Sport 2 UHP';
      zoomImg.src=img.currentSrc||img.src;zoomImg.alt=img.alt||title.textContent;
      dialog.hidden=false;document.body.style.overflow='hidden';reset();dialog.querySelector('[data-zoom-close]').focus();
    };
    zoomButtons.forEach(button=>button.addEventListener('click',()=>open(button)));
    dialog.querySelector('[data-zoom-close]').addEventListener('click',close);
    dialog.querySelector('[data-zoom-in]').addEventListener('click',()=>setScale(scale+.5));
    dialog.querySelector('[data-zoom-out]').addEventListener('click',()=>setScale(scale-.5));
    dialog.querySelector('[data-zoom-reset]').addEventListener('click',reset);
    dialog.addEventListener('click',event=>{if(event.target===dialog)close();});
    document.addEventListener('keydown',event=>{
      if(dialog.hidden)return;
      if(event.key==='Escape')close();if(event.key==='+'||event.key==='=')setScale(scale+.5);if(event.key==='-')setScale(scale-.5);
      if(event.key==='Tab'){const controls=[...panel.querySelectorAll('button')],first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
    });
    stage.addEventListener('wheel',event=>{event.preventDefault();setScale(scale+(event.deltaY<0?.2:-.2));},{passive:false});
    stage.addEventListener('pointerdown',event=>{stage.setPointerCapture(event.pointerId);pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});if(pointers.size===2){const pts=[...pointers.values()];pinchStart=Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y);pinchScale=scale;}stage.classList.add('dragging');});
    stage.addEventListener('pointermove',event=>{if(!pointers.has(event.pointerId))return;const prev=pointers.get(event.pointerId),dx=event.clientX-prev.x,dy=event.clientY-prev.y;pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});if(pointers.size>=2){const pts=[...pointers.values()],distance=Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y);if(pinchStart)setScale(pinchScale*distance/pinchStart);}else if(scale>1){x+=dx;y+=dy;paint();}});
    const endPointer=event=>{pointers.delete(event.pointerId);if(pointers.size<2)pinchStart=0;if(!pointers.size)stage.classList.remove('dragging');};
    stage.addEventListener('pointerup',endPointer);stage.addEventListener('pointercancel',endPointer);
  }
})();
