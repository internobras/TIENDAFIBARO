(() => {
  'use strict';
  const C = window.FIBARO_CONFIG || {};
  const wa = (message) => `https://wa.me/${C.whatsappNumber || '34633671657'}?text=${encodeURIComponent(message)}`;
  const $ = (s, p=document) => p.querySelector(s);
  const $$ = (s, p=document) => [...p.querySelectorAll(s)];
  const safe = (v='') => String(v).trim().replace(/[\n\r]+/g,' ');
  const path = location.pathname.replace(/^\/+|\/+$/g,'') || 'home';
  document.body.classList.add(`route-${path.replaceAll('/','-')}`);

  const routeCopy = {
    telecom:{eyebrow:'Fibra · Móvil · TV',title:'¿Estás pagando de más por tu fibra y móvil?',subtitle:'Cuéntanos qué tienes y qué quieres mejorar. Filtramos las opciones y Alicia continúa contigo sin marearte con decenas de tarifas.',primary:'Revisar mi telecom'},
    energia:{eyebrow:'Luz · Gas · Factura',title:'Tu factura de energía puede tener margen de mejora.',subtitle:'No necesitas entender potencias, peajes ni servicios adicionales. Nos dices qué quieres revisar y, si hace falta, Alicia mira tu factura contigo.',primary:'Revisar luz o gas'},
    empresas:{eyebrow:'Autónomos · Empresas',title:'Menos tiempo comparando. Más control sobre los gastos de tu negocio.',subtitle:'Telecomunicaciones y energía en un único punto de contacto. Tratamos tu caso como una cuenta de empresa, no como una tarifa residencial.',primary:'Revisar mi empresa'},
    'zona-fibaro':{eyebrow:'Sanlúcar · Rota · Chipiona · El Puerto · Jerez',title:'Aquí no solo vendemos. También podemos coordinar con equipo técnico propio.',subtitle:'En nuestra zona tenemos una ventaja difícil de copiar: más control sobre la instalación y el seguimiento de los servicios que gestionamos.',primary:'Comprobar mi caso'}
  };
  if(routeCopy[path]){
    $('#route-eyebrow').textContent = routeCopy[path].eyebrow;
    $('#route-title').textContent = routeCopy[path].title;
    $('#route-subtitle').textContent = routeCopy[path].subtitle;
    $('#route-primary').textContent = routeCopy[path].primary;
    document.title = `${routeCopy[path].title} | FÍBARO Telecom`;
  }

  const qs = new URLSearchParams(location.search);
  const attribution = {
    source: safe(qs.get('utm_source') || qs.get('src') || document.referrer || 'directo'),
    medium: safe(qs.get('utm_medium') || ''),
    campaign: safe(qs.get('utm_campaign') || ''),
    content: safe(qs.get('utm_content') || ''),
    landing: location.pathname
  };
  try { localStorage.setItem('fibaro_first_touch', localStorage.getItem('fibaro_first_touch') || JSON.stringify({...attribution,at:new Date().toISOString()})); } catch {}

  const genericMessage = `Hola, vengo de ${C.domain || 'fibaroteleco.com'} y quiero que reviséis mis tarifas.`;
  $$('.js-wa-direct').forEach(a => { a.href = wa(genericMessage); a.target='_blank'; a.rel='noopener'; });
  $$('.js-wa-bill').forEach(a => { a.href = wa('Hola, quiero que reviséis mi factura de luz/gas. La adjunto en esta conversación.'); a.target='_blank'; a.rel='noopener'; });
  addEventListener('scroll', () => $('#nav')?.classList.toggle('scrolled', scrollY > 14), {passive:true});

  const modal = $('#funnel-modal'), stage = $('#funnel-stage'), bar = $('#progress-bar'), label=$('#step-label');
  let state = {}, step = 0;
  const zones = ['11540','11550','11520','11500','11401','11402','11403','11404','11405','11406','11407','11408','11409'];
  const serviceLabels = {telecom:'Fibra y móvil',luz:'Luz',gas:'Gas',empresa:'Mi negocio',ayuda:'Quiero asesoramiento'};
  const steps = [serviceStep, detailStep, objectiveStep, spendStep, postcodeStep, resultStep];

  function openFunnel(service){
    state = { service: service || (path==='telecom'?'telecom':path==='energia'?'luz':path==='empresas'?'empresa':null) };
    step = state.service ? 1 : 0;
    modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; render();
    try { window.dataLayer?.push({event:'selector_started',source:attribution.source,landing:location.pathname}); } catch {}
  }
  function closeFunnel(){ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
  $$('[data-open-funnel]').forEach(b=>b.addEventListener('click',()=>openFunnel()));
  $$('[data-service]').forEach(b=>b.addEventListener('click',()=>openFunnel(b.dataset.service)));
  $$('[data-close-funnel]').forEach(b=>b.addEventListener('click',closeFunnel));
  addEventListener('keydown',e=>{if(e.key==='Escape')closeFunnel()});

  function shell(kicker,title,description,body){return `<div class="funnel-question"><span class="tiny">${kicker}</span><h2 id="funnel-title">${title}</h2>${description?`<p>${description}</p>`:''}${body}</div>`}
  function buttons(items,key){return `<div class="choice-grid">${items.map(([v,t,s])=>`<button class="choice ${state[key]===v?'selected':''}" data-choice="${v}" data-key="${key}">${t}${s?`<small>${s}</small>`:''}</button>`).join('')}</div>`}
  function bindChoices(next=true){ $$('[data-choice]',stage).forEach(b=>b.onclick=()=>{state[b.dataset.key]=b.dataset.choice;if(next){step++;render()}else render()}) }
  function navButtons({nextText='Continuar',can=true,back=true}={}){return `<div class="funnel-actions">${back?'<button class="btn funnel-back" data-back>← Atrás</button>':''}<button class="btn btn-primary funnel-next" data-next ${can?'':'disabled'}>${nextText}</button></div>`}
  function bindNav(validate){ const back=$('[data-back]',stage), next=$('[data-next]',stage); if(back) back.onclick=()=>{step=Math.max(0,step-1);render()}; if(next) next.onclick=()=>{if(!validate||validate()){step++;render()}} }
  function serviceStep(){
    stage.innerHTML=shell('Empezamos','¿Qué quieres revisar?','Elige solo una opción. Luego podemos ver el resto.',buttons([
      ['telecom','Fibra y móvil','Internet, líneas, TV o segunda residencia'],['luz','Luz','Revisar suministro o factura'],['gas','Gas','Revisar suministro o factura'],['empresa','Mi negocio','Telecom y/o energía'],['ayuda','No lo sé','Prefiero que me asesoren']],'service'));
    bindChoices();
  }
  function detailStep(){
    let items,title='¿Qué necesitas exactamente?',desc='';
    if(state.service==='telecom') items=[['fibra_movil','Fibra + móvil','La opción más habitual'],['fibra','Solo fibra','Internet en casa'],['movil','Solo móvil','Una o varias líneas'],['fibra_movil_tv','Fibra + móvil + TV','También quieres contenidos'],['segunda','Segunda residencia','Internet en otra vivienda'],['no_se','No lo sé','Que Alicia me oriente']];
    else if(state.service==='empresa') {title='¿Qué quieres revisar en tu negocio?';items=[['telecom','Telecom','Fibra, líneas y servicios'],['energia','Energía','Luz y/o gas'],['todo','Todo','Telecom + energía'],['no_se','No lo sé','Quiero una revisión general']];}
    else { title=`¿Qué quieres revisar de ${state.service==='luz'?'la luz':'el gas'}?`; items=[['pagar_menos','Quiero pagar menos','Revisar coste actual'],['cambio','Quiero cambiar','Buscar alternativa'],['factura','Quiero revisar una factura','La enviaré por WhatsApp'],['no_se','No lo sé','Que Alicia me oriente']]; }
    stage.innerHTML=shell('Tu situación',title,desc,buttons(items,'detail'));bindChoices();
  }
  function objectiveStep(){
    let items;
    if(state.service==='telecom') items=[['pagar_menos','Pagar menos'],['mejor_internet','Mejorar internet'],['mas_datos','Tener más datos'],['lineas','Añadir líneas'],['cambiar','Cambiar de compañía'],['asesoramiento','Quiero asesoramiento']];
    else if(state.service==='empresa') items=[['ahorro','Reducir gasto'],['mejorar','Mejorar servicio'],['centralizar','Centralizar telecom y energía'],['nueva_alta','Nueva alta / ampliación'],['asesoramiento','Revisión general']];
    else items=[['ahorro','Pagar menos'],['servicios','Revisar servicios añadidos'],['autoconsumo','Tengo autoconsumo/solar'],['cambio','Quiero cambiar'],['asesoramiento','Quiero asesoramiento']];
    stage.innerHTML=shell('Objetivo','¿Qué te gustaría conseguir?','Esto nos ayuda a entender qué significa “mejor” para ti.',buttons(items,'objective'));bindChoices();
  }
  function spendStep(){
    const items=state.service==='empresa'?[['lt50','Menos de 50 €'],['50_100','50–100 €'],['100_250','100–250 €'],['250_500','250–500 €'],['gt500','Más de 500 €'],['no_se','No lo sé']]:[['lt30','Menos de 30 €'],['30_50','30–50 €'],['50_70','50–70 €'],['70_100','70–100 €'],['gt100','Más de 100 €'],['no_se','No lo sé']];
    stage.innerHTML=shell('Una referencia','¿Cuánto pagas aproximadamente al mes?','No hace falta que sea exacto.',buttons(items,'spend'));bindChoices();
  }
  function postcodeStep(){
    stage.innerHTML=shell('Último dato','¿Dónde necesitas el servicio?','Con el código postal podemos identificar si estás además en nuestra zona técnica.',`<div class="field"><label for="cp">Código postal</label><input id="cp" inputmode="numeric" maxlength="5" autocomplete="postal-code" placeholder="Ej. 11540" value="${state.postcode||''}"></div><div id="zone-msg"></div>${navButtons({can:/^\d{5}$/.test(state.postcode||'')})}`);
    const input=$('#cp',stage), msg=$('#zone-msg',stage), next=$('[data-next]',stage);
    const update=()=>{state.postcode=input.value.replace(/\D/g,'').slice(0,5);input.value=state.postcode;const local=zones.includes(state.postcode);state.technicalZone=local;msg.innerHTML=local?'<div class="zone-good"><b>Estás en zona FÍBARO.</b><br>En esta zona contamos además con equipo técnico propio para las instalaciones que gestionamos.</div>':'';next.disabled=!/^\d{5}$/.test(state.postcode)};
    input.oninput=update; update(); bindNav(()=>/^\d{5}$/.test(state.postcode)); setTimeout(()=>input.focus(),80);
  }
  function resultStep(){
    const firstTouch=(()=>{try{return JSON.parse(localStorage.getItem('fibaro_first_touch')||'null')}catch{return null}})();
    const ref=`FD-${Date.now().toString(36).toUpperCase().slice(-6)}`;state.ref=ref;
    stage.innerHTML=shell('Ya tenemos contexto','Ahora Alicia puede continuar contigo.','No necesitas rellenar más datos aquí. Al pulsar WhatsApp se abrirá un mensaje con este resumen para que no tengas que volver a explicarlo.',`<dl class="result-box"><dt>Referencia</dt><dd>${ref}</dd><dt>Servicio</dt><dd>${serviceLabels[state.service]||state.service}</dd><dt>Objetivo</dt><dd>${human(state.objective)}</dd><dt>Gasto aproximado</dt><dd>${human(state.spend)}</dd><dt>Código postal</dt><dd>${state.postcode}${state.technicalZone?' · Zona FÍBARO':''}</dd></dl><div class="result-actions"><a class="btn wa-button btn-lg" id="result-wa" target="_blank" rel="noopener">Continuar por WhatsApp →</a><a class="btn call-button" href="tel:+34633671657">Llamar al 633 671 657</a></div><p class="privacy-note">No realizamos ningún cambio sin tu autorización. En esta versión inmediata, si envías una factura la adjuntas directamente en WhatsApp; no la almacenamos en esta web.</p>`);
    const message=[`Hola, soy un cliente de ${C.domain||'fibaroteleco.com'}.`,`Referencia: ${ref}`,`Quiero revisar: ${serviceLabels[state.service]||state.service}`,`Necesidad: ${human(state.detail)}`,`Objetivo: ${human(state.objective)}`,`Pago aprox.: ${human(state.spend)}`,`CP: ${state.postcode}${state.technicalZone?' (zona FÍBARO)':''}`,`Origen: ${prettySource(firstTouch?.source||attribution.source)}`].join('\n');
    $('#result-wa',stage).href=wa(message);
    $('#result-wa',stage).onclick=()=>{try{window.dataLayer?.push({event:'whatsapp_clicked',lead_ref:ref,service:state.service,source:attribution.source})}catch{};persistAnonymousLead({...state,attribution,ref,stage:'whatsapp'})};
    persistAnonymousLead({...state,attribution,ref,stage:'completed'});
  }
  function human(v){return ({pagar_menos:'Pagar menos',mejor_internet:'Mejor internet',mas_datos:'Más datos',lineas:'Añadir líneas',cambiar:'Cambiar de compañía',asesoramiento:'Asesoramiento',ahorro:'Pagar menos',mejorar:'Mejorar servicio',centralizar:'Centralizar servicios',nueva_alta:'Nueva alta / ampliación',servicios:'Revisar servicios añadidos',autoconsumo:'Autoconsumo / solar',lt30:'Menos de 30 €','30_50':'30–50 €','50_70':'50–70 €','70_100':'70–100 €',gt100:'Más de 100 €',lt50:'Menos de 50 €','50_100':'50–100 €','100_250':'100–250 €','250_500':'250–500 €',gt500:'Más de 500 €',no_se:'No lo sé',fibra_movil:'Fibra + móvil',fibra:'Solo fibra',movil:'Solo móvil',fibra_movil_tv:'Fibra + móvil + TV',segunda:'Segunda residencia',telecom:'Telecom',energia:'Energía',todo:'Telecom + energía',factura:'Revisar factura',cambio:'Cambiar'})[v]||v||'—'}
  function prettySource(v){ if(!v||v==='directo')return 'Directo'; if(v.includes('instagram'))return 'Instagram'; if(v.includes('tiktok'))return 'TikTok'; if(v.includes('google'))return 'Google'; return v.slice(0,45) }
  async function persistAnonymousLead(payload){
    if(!C.leadCaptureEnabled || !C.supabaseUrl || !C.supabasePublishableKey) return;
    try { await fetch(`${C.supabaseUrl}/rest/v1/direct_leads`,{method:'POST',headers:{'apikey':C.supabasePublishableKey,'Authorization':`Bearer ${C.supabasePublishableKey}`,'Content-Type':'application/json','Prefer':'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({reference:payload.ref,service:payload.service,detail:payload.detail||null,objective:payload.objective||null,spend_band:payload.spend||null,postal_code:payload.postcode||null,technical_zone:!!payload.technicalZone,source:payload.attribution?.source||null,medium:payload.attribution?.medium||null,campaign:payload.attribution?.campaign||null,content:payload.attribution?.content||null,landing:payload.attribution?.landing||location.pathname,status:payload.stage==='whatsapp'?'whatsapp':'new'})}); } catch(e){ console.warn('Lead capture unavailable',e); }
  }
  function render(){bar.style.width=`${Math.min(100,((step+1)/steps.length)*100)}%`;label.textContent=`Paso ${Math.min(step+1,steps.length)} de ${steps.length}`;(steps[step]||resultStep)();}
})();