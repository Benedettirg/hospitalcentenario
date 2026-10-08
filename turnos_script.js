
(function () {
  const form = document.getElementById('onlineAppointmentForm');
  if (!form) return;
  const panels = Array.from(document.querySelectorAll('.appointment-panel'));
  const steps = Array.from(document.querySelectorAll('.appointment-steps span'));
  const receipt = document.getElementById('appointmentReceipt');
  const assignment = document.getElementById('appointmentAssignment');
  let current = 1, lastData = null, countdownTimer = null;
  const $ = id => document.getElementById(id);

  const specialtyMap = {
    'Clínica Médica': {pavilion:'Pabellón 2', color:'#004A97', offset:2, hour:8},
    'Pediatría': {pavilion:'Pabellón 2', color:'#004A97', offset:3, hour:9},
    'Cardiología': {pavilion:'Pabellón 2', color:'#004A97', offset:2, hour:9},
    'Ginecología': {pavilion:'Pabellón 2', color:'#004A97', offset:4, hour:10},
    'Obstetricia': {pavilion:'Pabellón 2', color:'#004A97', offset:4, hour:11},
    'Traumatología': {pavilion:'Pabellón 3', color:'#00A09A', offset:2, hour:8},
    'Odontología': {pavilion:'Pabellón 2', color:'#004A97', offset:5, hour:10},
    'Kinesiología': {pavilion:'Pabellón 3', color:'#00A09A', offset:3, hour:9},
    'Salud Mental': {pavilion:'Pabellón 2', color:'#004A97', offset:3, hour:10},
    'Dermatología': {pavilion:'Pabellón 2', color:'#004A97', offset:4, hour:8},
    'Endocrinología': {pavilion:'Pabellón 2', color:'#004A97', offset:4, hour:9},
    'Neurología': {pavilion:'Pabellón 2', color:'#004A97', offset:5, hour:9},
    'Neurocirugía': {pavilion:'Pabellón 2', color:'#004A97', offset:6, hour:8},
    'Gastroenterología': {pavilion:'Pabellón 2', color:'#004A97', offset:5, hour:10},
    'Neumonología': {pavilion:'Pabellón 2', color:'#004A97', offset:6, hour:10},
    'Infectología': {pavilion:'Pabellón 2', color:'#004A97', offset:6, hour:11},
    'Nefrología': {pavilion:'Pabellón 2', color:'#004A97', offset:5, hour:11},
    'Hematología': {pavilion:'Pabellón 2', color:'#004A97', offset:6, hour:9},
    'Cirugía': {pavilion:'Pabellón 2', color:'#004A97', offset:7, hour:8},
    'Cirugía Vascular': {pavilion:'Pabellón 2', color:'#004A97', offset:7, hour:9},
    'ORL': {pavilion:'Pabellón 2', color:'#004A97', offset:7, hour:10},
    'Fonoaudiología': {pavilion:'Pabellón 2', color:'#004A97', offset:4, hour:12},
    'Nutrición': {pavilion:'Pabellón 3', color:'#00A09A', offset:3, hour:10},
    'Diagnóstico por Imágenes': {pavilion:'Pabellón 3', color:'#00A09A', offset:2, hour:11},
    'Laboratorio': {pavilion:'Pabellón 4', color:'#019CDE', offset:2, hour:8}
  };

  function showStep(n) {
    current = n;
    panels.forEach(panel => panel.classList.toggle('active', panel.dataset.panel === String(n)));
    steps.forEach((step, index) => step.classList.toggle('active', index < n));
  }

  document.querySelectorAll('[data-next]').forEach(button => button.addEventListener('click', () => {
    const fields = Array.from(panels[current - 1].querySelectorAll('input, select'));
    const invalid = fields.find(field => !field.checkValidity());
    if (invalid) invalid.reportValidity(); else showStep(Number(button.dataset.next));
  }));
  document.querySelectorAll('[data-prev]').forEach(button => button.addEventListener('click', () => showStep(Number(button.dataset.prev))));

  function nextBusinessDay(base, offset) {
    const d = new Date(base);
    d.setDate(d.getDate() + offset);
    while ([0,6].includes(d.getDay())) d.setDate(d.getDate() + 1);
    return d;
  }
  function formatDate(d) { return d.toLocaleDateString('es-AR',{day:'2-digit',month:'long',year:'numeric'}); }
  function timeFor(hour) { return String(hour).padStart(2,'0') + ':30 hs'; }
  function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

  function generateReceipt(event) {
    if (event) event.preventDefault();
    const requiredIds = ['patientName','patientDni','patientPhone','appointmentService'];
    const missing = requiredIds.map(id => $(id)).find(el => !el || !String(el.value || '').trim());
    if (missing) { missing.reportValidity(); missing.focus(); return; }

    const get = id => $(id).value;
    const specialty = get('appointmentService');
    const rule = specialtyMap[specialty] || {pavilion:'Pabellón 2',color:'#004A97',offset:3,hour:9};
    const assignedDate = nextBusinessDay(new Date(), rule.offset);
    const assignedTime = timeFor(rule.hour);
    const now = Date.now();
    const expiresAt = now + 24 * 60 * 60 * 1000;

    lastData = {
      id:'HC-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random()*900000),
      nombre:get('patientName'), dni:get('patientDni'), telefono:get('patientPhone'), email:get('patientEmail'),
      especialidad:specialty, pabellon:rule.pavilion, pavilionColor:rule.color,
      fecha:assignedDate.toISOString().slice(0,10), fechaTexto:formatDate(assignedDate), hora:assignedTime,
      estado:'Pendiente de confirmación', expiresAt, confirmed:false
    };

    localStorage.setItem('hospitalCentenarioTurnoDemo', JSON.stringify(lastData));
    assignment.hidden = false;
    $('assignmentLoading').hidden = false;
    $('assignmentResult').hidden = true;
    receipt.hidden = true;
    assignment.scrollIntoView({behavior:'smooth',block:'start'});

    setTimeout(() => {
      $('assignmentLoading').hidden = true;
      $('assignmentResult').hidden = false;
      $('assignedSpecialty').textContent = lastData.especialidad;
      $('assignedPavilion').textContent = lastData.pabellon;
      $('assignedPavilion').style.color = lastData.pavilionColor;
      $('assignedDate').textContent = lastData.fechaTexto;
      $('assignedTime').textContent = lastData.hora;
      updateCountdown();
      showStep(3);
      buildReceipt();
      simulateWhatsAppNotification();
      setTimeout(()=>receipt.scrollIntoView({behavior:"smooth",block:"start"}),180);
    }, 1200);
  }

  function updateCountdown() {
    if (!lastData || lastData.confirmed) return;
    clearInterval(countdownTimer);
    const tick = () => {
      const remaining = Math.max(0, lastData.expiresAt - Date.now());
      if (remaining <= 0) {
        lastData.estado = 'Cancelado por falta de confirmación';
        localStorage.setItem('hospitalCentenarioTurnoDemo', JSON.stringify(lastData));
        $('confirmationCountdown').textContent = 'La solicitud venció y el turno fue liberado.';
        return;
      }
      const total = Math.floor(remaining / 1000), h = Math.floor(total/3600), m = Math.floor((total%3600)/60), s = total%60;
      $('confirmationCountdown').textContent = `Confirmación pendiente · vence en ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    };
    tick();
    countdownTimer = setInterval(tick,1000);
  }

  function buildReceipt() {
    const statusText = lastData.estado;
    $('receiptDetails').innerHTML = '<dl>' + [
      ['Paciente',lastData.nombre],['DNI',lastData.dni],['Especialidad',lastData.especialidad],
      ['Pabellón',lastData.pabellon],['Fecha asignada',lastData.fechaTexto],['Horario asignado',lastData.hora],['Teléfono',lastData.telefono]
    ].map(item => '<div><dt>'+escapeHtml(item[0])+'</dt><dd>'+escapeHtml(item[1])+'</dd></div>').join('') + '</dl>';
    $('receiptCode').textContent = lastData.id;
    $('receiptIssued').textContent = new Date().toLocaleDateString('es-AR',{day:'2-digit',month:'long',year:'numeric'});
    document.querySelector('.receipt-status strong').textContent = statusText;
    const payload = JSON.stringify({codigo:lastData.id, especialidad:lastData.especialidad, pabellon:lastData.pabellon, fecha:lastData.fecha, hora:lastData.hora});
    $('qrCode').innerHTML=''; if (window.QRCode) new QRCode($('qrCode'), {text:payload,width:180,height:180}); else $('qrCode').textContent='QR - '+lastData.id;
    $('barCode').innerHTML=''; $('barCode').setAttribute('viewBox','0 0 320 80'); if (window.JsBarcode) JsBarcode('#barCode',lastData.id,{format:'CODE128',displayValue:false,height:70,width:2,margin:8});
    $('barcodeText').textContent=lastData.id;
    receipt.classList.toggle('confirmed',!!lastData.confirmed);
    receipt.hidden=false;
  }

  function simulateWhatsAppNotification() {
    const box = $('whatsappAutoStatus');
    const text = $('whatsappAutoText');
    if (!box || !text) return;
    box.classList.remove('is-sent');
    text.textContent = 'Preparando la notificación automática...';
    setTimeout(() => {
      box.classList.add('is-sent');
      text.textContent = 'Notificación automática simulada para WhatsApp del paciente. En la versión real se enviará mediante WhatsApp Business.';
    }, 700);
  }

  function confirmDemo() { /* Compatibilidad con versiones anteriores: ya no se muestra un botón de confirmación. */ }

  function whatsappConfirm() { /* Compatibilidad con versiones anteriores: el flujo ahora es automático. */ }

  form.addEventListener('submit', generateReceipt);
  $('generateReceiptBtn').addEventListener('click', generateReceipt);

  function receiptText(){ return ['HOSPITAL CENTENARIO GUALEGUAYCHÚ','COMPROBANTE DIGITAL DE TURNO','Código: '+lastData.id,'Paciente: '+lastData.nombre,'DNI: '+lastData.dni,'Especialidad: '+lastData.especialidad,'Pabellón: '+lastData.pabellon,'Fecha asignada: '+lastData.fechaTexto,'Horario asignado: '+lastData.hora,'Estado: '+lastData.estado,'Este comprobante es demostrativo y queda sujeto a validación institucional.']; }
  function pdfEscape(str){ const map={'á':'\341','é':'\351','í':'\355','ó':'\363','ú':'\372','ü':'\374','ñ':'\361','Ñ':'\321','Á':'\301','É':'\311','Í':'\315','Ó':'\323','Ú':'\332','Ü':'\334','¿':'\277','¡':'\241','°':'\260','·':'\267'}; return String(str ?? '').replace(/[áéíóúüñÑÁÉÍÓÚÜ¿¡°·]/g,c=>map[c]).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)').replace(/[\r\n]+/g,' '); }
  function rgb(hex){ const h=hex.replace('#',''); return [parseInt(h.slice(0,2),16)/255,parseInt(h.slice(2,4),16)/255,parseInt(h.slice(4,6),16)/255]; }
  function pdfText(cmds,text,x,y,size,color='#183B60',bold=false){ const [r,g,b]=rgb(color); cmds.push(`${r.toFixed(4)} ${g.toFixed(4)} ${b.toFixed(4)} rg BT /${bold?'F2':'F1'} ${size} Tf ${x} ${y} Td (${pdfEscape(text)}) Tj ET`); }
  function pdfRect(cmds,x,y,w,h,fill){ const [r,g,b]=rgb(fill); cmds.push(`${r.toFixed(4)} ${g.toFixed(4)} ${b.toFixed(4)} rg ${x} ${y} ${w} ${h} re f`); }
  function dataUrlBytes(dataUrl){ const b64=dataUrl.split(',')[1]||''; const bin=atob(b64); const arr=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) arr[i]=bin.charCodeAt(i); return arr; }
  async function imageToJpegDataUrl(src,w,h){
    return await new Promise((resolve,reject)=>{
      const img=new Image(); img.onload=()=>{const c=document.createElement('canvas'); c.width=w; c.height=h; const ctx=c.getContext('2d'); ctx.fillStyle='#fff'; ctx.fillRect(0,0,w,h); ctx.drawImage(img,0,0,w,h); resolve(c.toDataURL('image/jpeg',0.92));}; img.onerror=reject; img.src=src;
    });
  }
  async function elementToJpeg(el,w,h){
    if(!el) return null;
    if(el.tagName==='CANVAS') return el.toDataURL('image/jpeg',0.92);
    if(el.tagName==='IMG') return imageToJpegDataUrl(el.src,w,h);
    if(el.tagName==='SVG'){
      const xml=new XMLSerializer().serializeToString(el);
      const blob=new Blob([xml],{type:'image/svg+xml;charset=utf-8'}); const url=URL.createObjectURL(blob);
      try { return await imageToJpegDataUrl(url,w,h); } finally { URL.revokeObjectURL(url); }
    }
    return null;
  }
  function makeTemplatePdf({templateData,qrData,barData}){
    const imgW=1068, imgH=1600, W=595, H=W*imgH/imgW, s=W/imgW;
    const cmds=[];
    // Exact approved comprobante image as the page background.
    cmds.push(`q ${W} 0 0 ${H} 0 0 cm /ImTemplate Do Q`);
    const px=(v)=>v*s, py=(v)=>H-v*s;
    // White-out the values that must be generated dynamically.
    [[860,218,185,38],[190,355,430,70],[670,355,330,70],[425,470,545,48],[425,525,545,48],[425,580,545,48],[425,635,545,48],[425,690,545,48],[425,745,545,48],[425,800,545,48],[425,855,545,48],[425,930,545,50],[60,990,310,245],[390,990,600,245]].forEach(([x,y,w,h])=>pdfRect(cmds,px(x),py(y+h),px(w),px(h),'#FFFFFF'));
    // Rebuild key dynamic fields over the exact template.
    pdfText(cmds,new Date().toLocaleDateString('es-AR',{day:'2-digit',month:'long',year:'numeric'}),px(865),py(247),8,'#183B60',false);
    pdfText(cmds,lastData.id,px(195),py(408),21,'#0B315F',true);
    pdfText(cmds,lastData.estado,px(675),py(405),10,'#004A97',true);
    const rows=[['Paciente',lastData.nombre,475],['DNI',lastData.dni,530],['Especialidad',lastData.especialidad,585],['Pabellón',lastData.pabellon,640],['Fecha asignada',lastData.fechaTexto,695],['Horario asignado',lastData.hora,750],['Teléfono',lastData.telefono||'—',805],['Correo electrónico',lastData.email||'—',860]];
    rows.forEach(([label,value,y])=>{ pdfText(cmds,label,px(145),py(y+3),9,'#173F68',true); pdfText(cmds,String(value),px(435),py(y+3),10,'#1D2730',false); });
    if(qrData) cmds.push(`q ${px(205)} 0 0 ${px(205)} ${px(82)} ${py(1195)} cm /ImQR Do Q`);
    pdfText(cmds,'Escaneá este código en el hospital',px(85),py(1228),7,'#61778B',false);
    if(barData) cmds.push(`q ${px(500)} 0 0 ${px(120)} ${px(440)} ${py(1125)} cm /ImBar Do Q`);
    pdfText(cmds,lastData.id,px(585),py(1170),9,'#182A39',false);
    pdfText(cmds,'Código de barras para admisión',px(590),py(1202),7,'#71879B',false);
    const content=cmds.join('\n');
    const objects=[]; const obj=str=>{objects.push(str);return objects.length;};
    const f1=obj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
    const f2=obj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
    function jpegObj(data,w,h){ const bytes=dataUrlBytes(data); let hex=''; for(let i=0;i<bytes.length;i++) hex+=bytes[i].toString(16).padStart(2,'0'); return obj(`<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /ASCIIHexDecode /Length ${hex.length+1} >>
stream
${hex}>
endstream`); }
    const tObj=jpegObj(templateData,imgW,imgH), qObj=qrData?jpegObj(qrData,220,220):null, bObj=barData?jpegObj(barData,640,160):null;
    const resources=[`/Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >>`,`/XObject << /ImTemplate ${tObj} 0 R${qObj?` /ImQR ${qObj} 0 R`:''}${bObj?` /ImBar ${bObj} 0 R`:''} >>`].join(' ');
    const streamBytes=new TextEncoder().encode(content);
    const pageContent=obj(`<< /Length ${streamBytes.length} >>\\nstream\\n${content}\\nendstream`);
    const pagesPlaceholder=objects.length+1; const page=obj(`<< /Type /Page /Parent ${pagesPlaceholder} 0 R /MediaBox [0 0 ${W.toFixed(2)} ${H.toFixed(2)}] /Resources << ${resources} >> /Contents ${pageContent} 0 R >>`);
    const pages=obj(`<< /Type /Pages /Kids [${page} 0 R] /Count 1 >>`);
    const catalog=obj(`<< /Type /Catalog /Pages ${pages} 0 R >>`);
    let pdf='%PDF-1.4\n%\xFF\xFF\xFF\xFF\n'; const offsets=[0];
    for(let i=0;i<objects.length;i++){ offsets.push(pdf.length); pdf+=`${i+1} 0 obj\n${objects[i]}\nendobj\n`; }
    const xref=pdf.length; pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`; for(let i=1;i<offsets.length;i++) pdf+=String(offsets[i]).padStart(10,'0')+' 00000 n \n'; pdf+=`trailer\n<< /Size ${objects.length+1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF`;
    return new Blob([pdf],{type:'application/pdf'});
  }
  async function downloadReceiptPdf(){
    if(!lastData){ alert('Primero asigná un turno.'); return; }
    const btn=document.getElementById('downloadReceipt'); const btn2=document.getElementById('downloadAssignedPdf');
    [btn,btn2].forEach(b=>{if(b){b.disabled=true;b.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Generando PDF...';}});
    try{
      const templateData=await imageToJpegDataUrl('images/comprobante-template.jpg',1068,1600);
      const qr=document.querySelector('#qrCode canvas, #qrCode img');
      const bar=document.querySelector('#barCode');
      const qrData=await elementToJpeg(qr,220,220);
      const barData=await elementToJpeg(bar,640,160);
      const blob=makeTemplatePdf({templateData,qrData,barData});
      const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`comprobante-turno-${lastData.id}.pdf`; a.style.display='none'; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(url);a.remove();},3000);
    }catch(e){ console.error(e); alert('No se pudo generar el PDF. Revisá que el comprobante esté cargado y probá nuevamente.'); }
    finally{ [btn,btn2].forEach((b)=>{if(b){b.disabled=false;b.innerHTML='<i class="fa-solid fa-file-pdf"></i> Descargar comprobante PDF';}}); }
  }
  $('downloadReceipt').addEventListener('click',downloadReceiptPdf);
  const assignedPdfBtn=document.getElementById('downloadAssignedPdf'); if(assignedPdfBtn) assignedPdfBtn.addEventListener('click',downloadReceiptPdf);
  $('printReceipt').addEventListener('click', () => { if (!lastData) return; const w=window.open('','_blank'); w.document.write('<!doctype html><title>Comprobante '+lastData.id+'</title><style>@import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap");body{font-family:"DM Sans",sans-serif;font-weight:700;padding:32px;line-height:1.8}h1{color:#123b66}</style><h1>Hospital Centenario</h1><h2>Comprobante digital de turno</h2><pre>'+receiptText().join('\n')+'</pre>'); w.document.close(); w.focus(); w.print(); });
  $('downloadCalendar').addEventListener('click', () => { if (!lastData) return; const start=lastData.fecha.replaceAll('-','')+'T'+lastData.hora.replace(':','').replace(' hs','')+'00'; const ics=['BEGIN:VCALENDAR','VERSION:2.0','BEGIN:VEVENT','SUMMARY:Turno Hospital Centenario - '+lastData.especialidad,'DTSTART:'+start,'DTEND:'+start,'DESCRIPTION:Código '+lastData.id+' - '+lastData.pabellon,'LOCATION:Hospital Centenario Gualeguaychú','END:VEVENT','END:VCALENDAR'].join('\r\n'); const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([ics],{type:'text/calendar'})); a.download='turno-'+lastData.id+'.ics'; a.click(); });
  $('newAppointment').addEventListener('click', () => { clearInterval(countdownTimer); form.reset(); assignment.hidden=true; receipt.hidden=true; lastData=null; showStep(1); window.scrollTo({top:0,behavior:'smooth'}); });
}());
