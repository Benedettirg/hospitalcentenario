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
  function elementToPngData(element, width, height) {
    return new Promise((resolve, reject) => {
      try {
        if (!element) return reject(new Error('Elemento no disponible'));
        if (element.tagName === 'CANVAS') return resolve(element.toDataURL('image/png'));
        if (element.tagName === 'IMG') {
          const c = document.createElement('canvas'); c.width = width || element.naturalWidth; c.height = height || element.naturalHeight;
          c.getContext('2d').drawImage(element, 0, 0, c.width, c.height); return resolve(c.toDataURL('image/png'));
        }
        if (element.tagName === 'SVG' || element.namespaceURI === 'http://www.w3.org/2000/svg') {
          const svg = new XMLSerializer().serializeToString(element);
          const blob = new Blob([svg], {type:'image/svg+xml;charset=utf-8'});
          const url = URL.createObjectURL(blob); const img = new Image();
          img.onload = () => { const c=document.createElement('canvas'); c.width=width||element.getBoundingClientRect().width||640; c.height=height||element.getBoundingClientRect().height||160; c.getContext('2d').drawImage(img,0,0,c.width,c.height); URL.revokeObjectURL(url); resolve(c.toDataURL('image/png')); };
          img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo convertir el código de barras')); };
          img.src=url; return;
        }
        reject(new Error('Formato no compatible'));
      } catch(e) { reject(e); }
    });
  }

  function pdfEscape(str){ return String(str ?? '').replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)').replace(/[\r\n]+/g,' '); }
  function rgb(hex){ const h=hex.replace('#',''); return [parseInt(h.slice(0,2),16)/255,parseInt(h.slice(2,4),16)/255,parseInt(h.slice(4,6),16)/255]; }
  function pdfText(cmds,text,x,y,size,color='#183B60',bold=false){ const [r,g,b]=rgb(color); cmds.push(`${r.toFixed(4)} ${g.toFixed(4)} ${b.toFixed(4)} rg BT /${bold?'F2':'F1'} ${size} Tf ${x} ${y} Td (${pdfEscape(text)}) Tj ET`); }
  function pdfRect(cmds,x,y,w,h,fill,stroke=null,radius=0){ const [r,g,b]=rgb(fill); cmds.push(`${r.toFixed(4)} ${g.toFixed(4)} ${b.toFixed(4)} rg ${x} ${y} ${w} ${h} re f`); if(stroke){const c=rgb(stroke);cmds.push(`${c[0]} ${c[1]} ${c[2]} RG 0.6 w ${x} ${y} ${w} ${h} re S`);} }
  function dataUrlBytes(dataUrl){ const b64=dataUrl.split(',')[1]||''; const bin=atob(b64); const arr=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) arr[i]=bin.charCodeAt(i); return arr; }
  function jpegFromElement(element,width,height){ return new Promise((resolve,reject)=>{ try { const img=new Image(); const src=element.tagName==='IMG'?element.src:null; if(!src) return reject(new Error('Imagen no disponible')); img.crossOrigin='anonymous'; img.onload=()=>{const c=document.createElement('canvas'); c.width=width||img.naturalWidth; c.height=height||img.naturalHeight; const ctx=c.getContext('2d'); ctx.fillStyle='#fff'; ctx.fillRect(0,0,c.width,c.height); ctx.drawImage(img,0,0,c.width,c.height); resolve(c.toDataURL('image/jpeg',0.9));}; img.onerror=()=>reject(new Error('No se pudo cargar el logo')); img.src=src; } catch(e){reject(e);} }); }
  function makePdf({logoData,qrData,barData}){
    const W=595, H=842, cmds=[];
    // Top institutional color band
    pdfRect(cmds,0,H-9,W/4,9,'#D9E343'); pdfRect(cmds,W/4,H-9,W/4,9,'#004A97'); pdfRect(cmds,W/2,H-9,W/4,9,'#019CDE'); pdfRect(cmds,3*W/4,H-9,W/4,9,'#00A09A');
    // Header
    if(logoData) cmds.push('q 70 0 0 70 40 742 cm /ImLogo Do Q');
    pdfText(cmds,'HOSPITAL CENTENARIO',125,790,19,'#0B315F',true); pdfText(cmds,'GUALEGUAYCHÚ',125,771,10,'#004A97',false); pdfText(cmds,'SALUD PÚBLICA · COMPROMISO DE TODOS',125,757,7,'#7890A7',false);
    pdfText(cmds,'CUIDAR',480,790,8,'#5B7187',true); pdfText(cmds,'TAMBIÉN',480,778,8,'#5B7187',true); pdfText(cmds,'ES AVANZAR',480,766,8,'#5B7187',true);
    pdfText(cmds,'COMPROBANTE DIGITAL DE TURNO',40,705,20,'#0B315F',true); pdfText(cmds,'SOLICITUD DE ATENCIÓN',40,687,10,'#004A97',false);
    pdfRect(cmds,40,620,515,48,'#EDF6FD'); pdfText(cmds,'CÓDIGO DE TURNO',58,651,8,'#6D8499',true); pdfText(cmds,lastData.id,58,630,18,'#0B315F',true); pdfRect(cmds,385,628,150,31,'#D9ECFB'); pdfText(cmds,'ESTADO',400,648,8,'#004A97',true); pdfText(cmds,lastData.estado||'Pendiente de confirmación',400,635,8,'#004A97',false);
    const rows=[['Paciente',lastData.nombre],['DNI',lastData.dni],['Especialidad',lastData.especialidad],['Pabellón',lastData.pabellon],['Fecha asignada',lastData.fechaTexto],['Horario asignado',lastData.hora],['Teléfono',lastData.telefono]];
    let y=592; rows.forEach(([k,v])=>{ cmds.push(`0.84 0.89 0.93 RG 0.6 w 40 ${y-5} m 555 ${y-5} l S`); pdfText(cmds,k,58,y,9,'#42617D',true); pdfText(cmds,String(v||'—'),210,y,9,'#183B60',false); y-=27; });
    if(qrData) cmds.push('q 125 0 0 125 48 220 cm /ImQR Do Q'); pdfText(cmds,'QR DE LA SOLICITUD',58,205,8,'#004A97',true); pdfText(cmds,'Presentá este código en admisión.',58,191,7,'#71879B',false);
    if(barData) cmds.push('q 310 0 0 80 250 260 cm /ImBar Do Q'); pdfText(cmds,'CÓDIGO DE BARRAS',250,238,8,'#004A97',true); pdfText(cmds,lastData.id,250,224,9,'#183B60',false);
    pdfRect(cmds,40,140,515,50,'#EDF6FD'); pdfText(cmds,'IMPORTANTE',58,170,9,'#0B315F',true); pdfText(cmds,'Este comprobante es demostrativo y queda sujeto a validación institucional.',58,155,7,'#42617D',false); pdfText(cmds,'Presentalo junto con tu DNI cuando el hospital confirme la atención.',58,144,7,'#42617D',false);
    cmds.push('0.80 0.86 0.90 RG 0.8 w 40 112 m 555 112 l S'); pdfText(cmds,'HOSPITAL CENTENARIO · GUALEGUAYCHÚ · ENTRE RÍOS',40,91,7,'#7890A7',true); pdfText(cmds,'TU SALUD, NUESTRA PRIORIDAD',555,91,7,'#7890A7',true);
    const content=cmds.join('\n'); const objects=[]; const imgObjs=[];
    function obj(str){objects.push(str);return objects.length;}
    const font1=obj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'); const font2=obj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
    function imageObj(data,w,h){ const bytes=dataUrlBytes(data); let hex=''; for(let i=0;i<bytes.length;i++) hex+=bytes[i].toString(16).padStart(2,'0'); return obj(`<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /ASCIIHexDecode /Length ${hex.length+1} >>\nstream\n${hex}>\nendstream`); }
    let logoObj=null,qrObj=null,barObj=null; if(logoData) logoObj=imageObj(logoData,447,447); if(qrData) qrObj=imageObj(qrData,220,220); if(barData) barObj=imageObj(barData,640,160);
    const resX=[`/Font << /F1 ${font1} 0 R /F2 ${font2} 0 R >>`]; if(logoObj)resX.push(`/ImLogo ${logoObj} 0 R`); if(qrObj)resX.push(`/ImQR ${qrObj} 0 R`); if(barObj)resX.push(`/ImBar ${barObj} 0 R`);
    const pageContent=obj(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    const page=obj(`<< /Type /Page /Parent PAGES /MediaBox [0 0 ${W} ${H}] /Resources << ${resX.join(' ')} >> /Contents ${pageContent} 0 R >>`);
    const pages=obj(`<< /Type /Pages /Kids [${page} 0 R] /Count 1 >>`); objects[page-1]=objects[page-1].replace('PAGES',`${pages} 0 R`);
    const catalog=obj(`<< /Type /Catalog /Pages ${pages} 0 R >>`);
    let pdf='%PDF-1.4\n%\xFF\xFF\xFF\xFF\n', offsets=[0]; for(let i=0;i<objects.length;i++){offsets.push(pdf.length); pdf+=`${i+1} 0 obj\n${objects[i]}\nendobj\n`;}
    const xref=pdf.length; pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`; for(let i=1;i<offsets.length;i++) pdf+=String(offsets[i]).padStart(10,'0')+' 00000 n \n'; pdf+=`trailer\n<< /Size ${objects.length+1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF`;
    return new Blob([pdf],{type:'application/pdf'});
  }
  async function downloadReceiptPdf() {
    if (!lastData) return;
    try {
      const logo=document.querySelector('.receipt-brand-main img');
      const qr=document.querySelector('#qrCode canvas, #qrCode img');
      const bar=document.querySelector('#barCode');
      const canvasData = async (el,w,h)=>{ if(!el) return null; if(el.tagName==='CANVAS') return el.toDataURL('image/jpeg',0.9); if(el.tagName==='IMG') return jpegFromElement(el,w,h); if(el.tagName==='SVG'){ const xml=new XMLSerializer().serializeToString(el); const img=new Image(); return await new Promise((res,rej)=>{img.onload=()=>{const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);res(c.toDataURL('image/jpeg',0.9));};img.onerror=rej;img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(xml);});} return null; };
      const blob=makePdf({logoData:await jpegFromElement(logo,447,447),qrData:await canvasData(qr,220,220),barData:await canvasData(bar,640,160)});
      const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='comprobante-turno-'+lastData.id+'.pdf'; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1500);
    } catch(e) { console.error(e); alert('No se pudo generar el PDF. Probá nuevamente.'); }
  }
  $('downloadReceipt').addEventListener('click', downloadReceiptPdf);
  $('printReceipt').addEventListener('click', () => { if (!lastData) return; const w=window.open('','_blank'); w.document.write('<!doctype html><title>Comprobante '+lastData.id+'</title><style>@import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap");body{font-family:"DM Sans",sans-serif;font-weight:700;padding:32px;line-height:1.8}h1{color:#123b66}</style><h1>Hospital Centenario</h1><h2>Comprobante digital de turno</h2><pre>'+receiptText().join('\n')+'</pre>'); w.document.close(); w.focus(); w.print(); });
  $('downloadCalendar').addEventListener('click', () => { if (!lastData) return; const start=lastData.fecha.replaceAll('-','')+'T'+lastData.hora.replace(':','').replace(' hs','')+'00'; const ics=['BEGIN:VCALENDAR','VERSION:2.0','BEGIN:VEVENT','SUMMARY:Turno Hospital Centenario - '+lastData.especialidad,'DTSTART:'+start,'DTEND:'+start,'DESCRIPTION:Código '+lastData.id+' - '+lastData.pabellon,'LOCATION:Hospital Centenario Gualeguaychú','END:VEVENT','END:VCALENDAR'].join('\r\n'); const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([ics],{type:'text/calendar'})); a.download='turno-'+lastData.id+'.ics'; a.click(); });
  $('newAppointment').addEventListener('click', () => { clearInterval(countdownTimer); form.reset(); assignment.hidden=true; receipt.hidden=true; lastData=null; showStep(1); window.scrollTo({top:0,behavior:'smooth'}); });
}());
