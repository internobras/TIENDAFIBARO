(()=>{
  'use strict';
  const logo='/assets/logo-fibaro.webp?v=5';
  const photo='/assets/alicia.webp?v=5';
  document.querySelectorAll('[data-fibaro-logo]').forEach(img=>{
    img.src=logo;
    img.classList.add('asset-ready');
  });
  document.querySelectorAll('[data-alicia-photo]').forEach(img=>{
    img.src=photo;
    img.classList.add('asset-ready');
  });
  const C=window.FIBARO_CONFIG||{};
  document.querySelectorAll('.js-instagram').forEach(a=>{a.href=`https://instagram.com/${C.instagram||'fibaroteleco'}`;a.target='_blank';a.rel='noopener'});
  document.querySelectorAll('.js-tiktok').forEach(a=>{a.href=`https://www.tiktok.com/@${C.tiktok||'fibaroteleco'}`;a.target='_blank';a.rel='noopener'});
})();
