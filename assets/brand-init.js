(()=>{
  'use strict';
  const A=window.__FIBARO_ASSETS||{};
  const transparent='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
  const logo=typeof A.logo==='string'&&A.logo.length>100?`data:image/webp;base64,${A.logo}`:null;
  const parts=Array.isArray(A.alicia)?A.alicia:[];
  const photo=parts.length?`data:image/webp;base64,${parts.join('')}`:null;
  document.querySelectorAll('[data-fibaro-logo]').forEach(img=>{if(!img.getAttribute('src'))img.src=transparent;if(logo){img.src=logo;img.classList.add('asset-ready')}});
  document.querySelectorAll('[data-alicia-photo]').forEach(img=>{if(!img.getAttribute('src'))img.src=transparent;if(photo){img.src=photo;img.classList.add('asset-ready')}});
  const C=window.FIBARO_CONFIG||{};
  document.querySelectorAll('.js-instagram').forEach(a=>{a.href=`https://instagram.com/${C.instagram||'fibaroteleco'}`;a.target='_blank';a.rel='noopener'});
  document.querySelectorAll('.js-tiktok').forEach(a=>{a.href=`https://www.tiktok.com/@${C.tiktok||'fibaroteleco'}`;a.target='_blank';a.rel='noopener'});
})();
