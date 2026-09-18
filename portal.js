/* Hospital Centenario V9 - interacciones del portal */
(() => {
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];

  // FAQ
  $$('.faq-q').forEach(btn=>btn.addEventListener('click',()=>btn.closest('.faq-item')?.classList.toggle('open')));

  // Filtro de servicios
  const serviceSearch=$('#serviceSearch');
  const filterButtons=$$('.filter-btn');
  let activeFilter='all';
  function filterServices(){
    const q=(serviceSearch?.value||'').trim().toLowerCase();
    const cards=$$('.service-card');
    let visible=0;
    cards.forEach(card=>{
      const text=(card.textContent||'').toLowerCase();
      const category=card.dataset.category||'all';
      const show=text.includes(q) && (activeFilter==='all'||category===activeFilter);
      card.classList.toggle('is-hidden', !show);
      if(show) visible++;
    });
    const count=$('#serviceCount');
    if(count) count.textContent=visible;
    const empty=$('#servicesEmpty');
    if(empty) empty.hidden=visible!==0;
  }
  serviceSearch?.addEventListener('input',filterServices);
  filterButtons.forEach(b=>b.addEventListener('click',()=>{activeFilter=b.dataset.filter||'all';filterButtons.forEach(x=>x.classList.toggle('active',x===b));filterServices()}));

  // Formulario de turnos por pasos: solicita turno, no lo confirma automáticamente.
  const appointmentForm=$('#appointmentForm');
  if(appointmentForm){
    const panels=$$('.step-panel',appointmentForm), steps=$$('.form-step',appointmentForm); let step=0;
    const setStep=n=>{step=Math.max(0,Math.min(n,panels.length-1));panels.forEach((p,i)=>p.classList.toggle('active',i===step));steps.forEach((s,i)=>s.classList.toggle('active',i<=step));};
    $$('.next-step',appointmentForm).forEach(b=>b.addEventListener('click',()=>{const current=panels[step]; if(current?.querySelectorAll(':invalid').length){current.querySelector(':invalid')?.reportValidity();return} setStep(step+1)}));
    $$('.prev-step',appointmentForm).forEach(b=>b.addEventListener('click',()=>setStep(step-1)));
    appointmentForm.addEventListener('submit',async e=>{
      e.preventDefault();
      const status=$('[data-appointment-status]',appointmentForm), data=new FormData(appointmentForm);
      status.className='form-status show';status.textContent='Enviando solicitud…';
      try{
        const res=await fetch('api/solicitud-turno.php',{method:'POST',body:data});
        if(!res.ok) throw new Error('backend');
        const json=await res.json(); if(!json.ok) throw new Error(json.message||'error');
        status.className='form-status show success';status.textContent=json.message||'Solicitud recibida. El hospital deberá confirmar el turno.';appointmentForm.reset();setStep(0);
      }catch(err){
        status.className='form-status show success';status.textContent='Solicitud preparada. Para habilitar el envío real, configurá el backend PHP/MySQL incluido en la carpeta backend. No guardamos tus datos en este navegador.';
      }
    });
  }

  // Contacto real cuando el backend está configurado; no persiste datos en el navegador.
  $$('form[data-contact-form]').forEach(form=>form.addEventListener('submit',async e=>{
    e.preventDefault(); const status=$('[data-form-msg]',form); status.className='form-status show';status.textContent='Enviando consulta…';
    try{const r=await fetch('api/contacto.php',{method:'POST',body:new FormData(form)}); if(!r.ok)throw 0; const j=await r.json(); if(!j.ok)throw 0; status.className='form-status show success';status.textContent=j.message||'Consulta enviada correctamente.';form.reset();}
    catch{status.className='form-status show success';status.textContent='Formulario listo. Para recibir consultas realmente, configurá el backend PHP/MySQL incluido en este proyecto.';}
  }));

  // Modal de noticias
  const newsModal=$('#newsModal'); const newsBody=$('#newsModalBody');
  $$('.news-card[data-news-title]').forEach(card=>card.addEventListener('click',()=>{if(!newsModal)return;newsBody.innerHTML=`<h2>${card.dataset.newsTitle}</h2><p>${card.dataset.newsText||''}</p>`;newsModal.classList.add('open');document.body.style.overflow='hidden'}));
  $$('[data-news-close]').forEach(b=>b.addEventListener('click',()=>{newsModal?.classList.remove('open');document.body.style.overflow=''}));

  // Accesibilidad tipográfica
  const saved=localStorage.getItem('hc-font-large'); if(saved==='1')document.body.classList.add('font-large');
  $('#fontPlus')?.addEventListener('click',()=>{document.body.classList.add('font-large');localStorage.setItem('hc-font-large','1')});
  $('#fontNormal')?.addEventListener('click',()=>{document.body.classList.remove('font-large');localStorage.removeItem('hc-font-large')});
})();
