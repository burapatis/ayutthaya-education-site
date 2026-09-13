'use strict';
const menu=document.querySelector('.menu-toggle');
if(menu){menu.hidden=false;document.documentElement.classList.add('js-menu');menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));document.getElementById('navigation').classList.toggle('is-open',open);});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){menu.click();menu.focus();}});}
document.querySelectorAll('[data-print]').forEach(b=>b.addEventListener('click',()=>window.print()));

const saveFile=(filename,text,type='text/plain;charset=utf-8')=>{
 const blob=new Blob([text],{type}),url=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
};
const status=(id,message)=>{const el=document.getElementById(id);if(el)el.textContent=message;};

const search=document.getElementById('document-search');
if(search){
 document.querySelector('[data-library-controls]').hidden=false;
 const category=document.getElementById('document-category'),cards=[...document.querySelectorAll('.doc-card')];
 const filter=()=>{const terms=search.value.trim().toLocaleLowerCase('th').split(/\s+/).filter(Boolean);let count=0;cards.forEach(c=>{const match=(!category.value||c.dataset.category===category.value)&&terms.every(t=>c.dataset.search.toLocaleLowerCase('th').includes(t));c.hidden=!match;if(match)count++;});status('library-count',`แสดง ${count} จาก ${cards.length} รายการ`);document.getElementById('library-empty').hidden=count!==0;};
 search.addEventListener('input',filter);category.addEventListener('change',filter);
 document.getElementById('clear-search').addEventListener('click',()=>{search.value='';category.value='';filter();search.focus();});
}

const assessment=document.getElementById('assessment-form');
if(assessment){
 const KEY='ayutthaya-education.self-assessment.v1';
 const phase=document.getElementById('assessment-phase');
 let current='before';let records={before:null,after:null};let drafts={before:Array(12).fill(null),after:Array(12).fill(null)};
 const collect=()=>Array.from({length:12},(_,i)=>{const value=assessment.querySelector(`input[name="q${i+1}"]:checked`);return value?Number(value.value):null;});
 const fill=values=>{assessment.querySelectorAll('input[type=radio]').forEach(r=>{r.checked=values[Number(r.name.slice(1))-1]===Number(r.value);});};
 const show=()=>{
  const panel=document.getElementById('assessment-result');const values=records[current];const summary=EduCore.summarize(values);
  if(!summary){panel.hidden=true;return;}
  panel.hidden=false;
  // Only validated numbers and fixed labels enter this HTML; user text is never inserted.
  const comparison=EduCore.compare(records.before,records.after);
  let html=`<h2>ผล${current==='before'?'ก่อน':'หลัง'}เรียนรู้</h2><p>ความมั่นใจในความเข้าใจและการปฏิบัติ (11 ข้อ)</p><div class="score-stat">${summary.capabilityMean.toFixed(2)} <span class="small">จาก 5</span></div><p>การเห็นความสำคัญของสิทธิและการดูแลผู้เรียน (ข้อ 11): <strong>${summary.attitude} จาก 5</strong></p>`;
  if(comparison){const delta=comparison.change;html+=`<h3>เปรียบเทียบคำตอบที่ครบทั้งสองครั้ง</h3><p>ค่าเฉลี่ยความมั่นใจ: ${comparison.before.capabilityMean.toFixed(2)} → ${comparison.after.capabilityMean.toFixed(2)}<br>เปลี่ยนแปลง ${delta>0?'+':''}${delta.toFixed(2)} คะแนน บนมาตรา 1–5</p><p>ทัศนคติข้อ 11: ${comparison.before.attitude} → ${comparison.after.attitude} คะแนน</p><p class="small">ไม่แปลงเป็นร้อยละการเรียนรู้ และไม่สรุปว่าคะแนนที่เพิ่มเกิดจากการบรรยายโดยตรง</p>`;}
  else html+='<p>ยังเปรียบเทียบไม่ได้: ต้องมีคำตอบครบทั้งก่อนและหลังในหน้านี้ หรือบันทึกไว้บนอุปกรณ์เดียวกัน</p>';
  html+='<p><strong>สิ่งที่ควรฝึกต่อ:</strong> เลือกข้อที่ยังไม่มั่นใจไปฝึกด้วยใบงาน แล้วใช้ชิ้นงานจริงและการแลกเปลี่ยนกับเพื่อนร่วมงานประกอบการสะท้อนผล</p>';
  panel.innerHTML=html;
 };
 try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved&&saved.version===1){for(const p of ['before','after']){if(EduCore.valid(saved[p])){records[p]=saved[p];drafts[p]=saved[p].slice();}}if(records.before||records.after){fill(drafts.before);show();status('assessment-status','พบผลที่เคยเลือกบันทึกไว้บนอุปกรณ์นี้ ข้อมูลยังไม่ได้ส่งให้ผู้จัดทำ');}}}catch{status('assessment-status','ไม่สามารถอ่านข้อมูลที่บันทึกไว้ได้ ยังทำแบบประเมินและดาวน์โหลดผลในครั้งนี้ได้ตามปกติ');}
 phase.addEventListener('change',()=>{drafts[current]=collect();current=phase.value;fill(drafts[current]);show();status('assessment-status',`กำลังประเมิน${current==='before'?'ก่อน':'หลัง'}เรียนรู้`);});
 assessment.addEventListener('change',e=>{if(e.target.matches('input[type=radio]')){drafts[current]=collect();records[current]=null;document.getElementById('assessment-result').hidden=true;status('assessment-status','คำตอบเปลี่ยนแล้ว กดดูผลเพื่อคำนวณใหม่ และกดบันทึกอีกครั้งหากต้องการเก็บการแก้ไข');}});
 const evaluate=()=>{if(!assessment.reportValidity())return false;const values=collect();if(!EduCore.valid(values))return false;records[current]=values;drafts[current]=values.slice();show();return true;};
 assessment.addEventListener('submit',e=>{e.preventDefault();if(evaluate())status('assessment-status','คำนวณแล้ว ผลอยู่เฉพาะการเปิดหน้านี้ กดบันทึกหากต้องการกลับมาทำต่อภายหลัง');});
 document.getElementById('save-assessment').addEventListener('click',()=>{if(!evaluate())return;try{localStorage.setItem(KEY,JSON.stringify({version:1,before:records.before,after:records.after,savedAt:new Date().toISOString()}));status('assessment-status','บันทึกผลบนอุปกรณ์นี้แล้ว ไม่มีการส่งคะแนนให้เว็บไซต์');}catch{status('assessment-status','อุปกรณ์ไม่อนุญาตให้บันทึก โปรดดาวน์โหลดผลแทน ผลยังอยู่ในหน้านี้จนกว่าจะปิดหรือเปลี่ยนหน้า');}});
 document.getElementById('export-assessment').addEventListener('click',()=>{if(!evaluate())return;const quote=v=>`"${String(v??'').replace(/"/g,'""')}"`;const lines=[['ข้อ','รายการประเมิน','ก่อนเรียนรู้','หลังเรียนรู้','ผลต่าง (หลัง-ก่อน)']];for(let i=0;i<12;i++){const label=assessment.querySelectorAll('legend')[i].textContent;const before=records.before?.[i],after=records.after?.[i];lines.push([i+1,label,before,after,before!=null&&after!=null?after-before:'']);}const a=EduCore.summarize(records.before),b=EduCore.summarize(records.after);lines.push(['','ค่าเฉลี่ยความมั่นใจ 11 ข้อ (ไม่รวมข้อ 11)',a?.capabilityMean.toFixed(2)??'',b?.capabilityMean.toFixed(2)??'',a&&b?(b.capabilityMean-a.capabilityMean).toFixed(2):'']);lines.push(['','ผลประเมินตนเอง ไม่ใช่ผลทดสอบทักษะจริง','','','']);saveFile('self-assessment.csv','\uFEFF'+lines.map(row=>row.map(quote).join(',')).join('\r\n'),'text/csv;charset=utf-8');status('assessment-status','เตรียมไฟล์ผลและคำตอบแล้ว ช่องว่างหมายถึงยังไม่มีผลครบชุดในช่วงนั้น ไม่ใช่ศูนย์คะแนน');});
 document.getElementById('clear-assessment').addEventListener('click',()=>{if(!window.confirm('ล้างคำตอบและผลแบบประเมินที่บันทึกไว้บนอุปกรณ์นี้หรือไม่? ไฟล์ที่ดาวน์โหลดไปแล้วจะไม่ถูกลบ'))return;let removed=true;try{localStorage.removeItem(KEY);}catch{removed=false;}records={before:null,after:null};drafts={before:Array(12).fill(null),after:Array(12).fill(null)};fill(drafts[current]);show();status('assessment-status',removed?'ล้างคำตอบและผลที่บันทึกบนอุปกรณ์นี้แล้ว':'ล้างคำตอบในหน้านี้แล้ว แต่ลบข้อมูลที่บันทึกไม่ได้ โปรดล้างข้อมูลเว็บไซต์จากการตั้งค่าเบราว์เซอร์');});
}

const worksheet=document.getElementById('worksheet-form');
if(worksheet){
 worksheet.addEventListener('submit',e=>{e.preventDefault();if(!worksheet.reportValidity())return;const title=worksheet.elements.title.value.trim();if(!title){status('worksheet-status','โปรดระบุชื่อประเด็นก่อนดาวน์โหลด');worksheet.elements.title.focus();return;}const parts=['# บัตรออกแบบยุทธศาสตร์',`ชื่อประเด็น: ${title}`,'สถานะ: ใบงานเพื่อการเรียนรู้ ยังไม่ใช่แผนที่รับรองแล้ว',`วันที่จัดทำ: ${new Date().toLocaleDateString('th-TH')}`];worksheet.querySelectorAll('textarea').forEach(input=>{const label=worksheet.querySelector(`label[for="${input.id}"]`).textContent;parts.push(`## ${label}\n\n${input.value.trim()||'ยังไม่ได้ระบุ — ต้องเติมข้อมูลก่อนใช้จริง'}`);});parts.push('ผู้จัดทำชุดเครื่องมือ: บูรพาทิศ พลอยสุวรรณ์ ผู้วิจัยอิสระ');saveFile('strategy-worksheet-filled.md',parts.join('\n\n')+'\n','text/markdown;charset=utf-8');status('worksheet-status','เตรียมไฟล์ใบงานแล้ว โปรดตรวจช่องที่ยังว่างและหลักฐานก่อนนำไปใช้ ข้อมูลไม่ถูกส่งให้เว็บไซต์');});
 document.getElementById('clear-worksheet').addEventListener('click',()=>{if(window.confirm('ล้างข้อความในใบงานหน้านี้หรือไม่?')){worksheet.reset();status('worksheet-status','ล้างใบงานแล้ว');}});
 document.querySelectorAll('[data-quality]').forEach(c=>c.addEventListener('change',()=>status('quality-count',`มีหลักฐานรองรับ ${document.querySelectorAll('[data-quality]:checked').length} จาก 10 ประเด็น — ไม่ใช่คะแนนรับรองคุณภาพ`)));
}

const community=document.getElementById('community-form');
if(community){
 const projectId=EduCore.projectIdFromSearch(window.location.search);
 if(projectId){
  const context=document.getElementById('exchange-project-context');
  if(context){context.textContent=`กำลังแลกเปลี่ยนเรื่องโครงการ ${projectId} — ข้อความนี้ยังไม่ถูกส่งหรือเผยแพร่`;context.hidden=false;}
  if(!community.elements.message.value.trim())community.elements.message.value=`โครงการ ${projectId}\n\nสิ่งที่อยากชวนคิด:\n\nข้อเสนอหรือแหล่งข้อมูล:\n\nสิ่งที่ควรปรับเมื่อใช้กับพื้นที่ของฉัน:\n`;
 }
 const message=()=>{const topic=community.elements.topic.value,body=community.elements.message.value.trim();return {topic,body:`เรียน คุณบูรพาทิศ พลอยสุวรรณ์\n\nประเด็น: ${topic}\n\n${body}\n\nส่งจากการเตรียมข้อความบนเว็บไซต์เรียนรู้ยุทธศาสตร์การศึกษาอยุธยา\nข้อความนี้ส่งเพื่อแลกเปลี่ยน ไม่ใช่การอนุญาตให้เผยแพร่ต่อสาธารณะ`};};
 const ready=()=>{if(!community.reportValidity())return false;if(!community.elements.message.value.trim()){status('exchange-status','โปรดเขียนข้อความก่อนดำเนินการ');return false;}return true;};
 community.addEventListener('submit',e=>{e.preventDefault();if(!ready())return;const m=message();window.location.href=`mailto:burapatis@gmail.com?subject=${encodeURIComponent('[แลกเปลี่ยนยุทธศาสตร์การศึกษา] '+m.topic)}&body=${encodeURIComponent(m.body)}`;status('exchange-status','ขอเปิดแอปอีเมลแล้ว ยังไม่ได้ส่งข้อความ โปรดตรวจทานและกดส่งในแอปอีเมล หากไม่เปิดหรือข้อความไม่ครบ ให้ดาวน์โหลดข้อความแทน');});
 document.getElementById('download-exchange').addEventListener('click',()=>{if(!ready())return;saveFile('education-exchange.txt',message().body);status('exchange-status','เตรียมไฟล์ข้อความแล้ว คุณต้องนำไปส่งอีเมลเอง เว็บไซต์ยังไม่ได้รับหรือเผยแพร่ข้อความ');});
 const url=EduCore.safeDiscussionUrl(window.SITE_CONFIG?.discussionsUrl);
 if(url){const holder=document.getElementById('discussion-link'),link=document.createElement('a');link.className='button secondary';link.href=url;link.textContent='ไปกระดานสนทนาสาธารณะ (GitHub)';link.rel='noopener noreferrer';holder.append(link);holder.hidden=false;document.getElementById('discussion-unconfigured').hidden=true;}
}
document.getElementById('jump-to-slide')?.addEventListener('click',()=>{const id=document.getElementById('slide-jump').value;const target=document.getElementById(id);if(target){target.scrollIntoView({behavior:'instant',block:'start'});const heading=target.querySelector('h2');heading.tabIndex=-1;heading.focus({preventScroll:true});history.replaceState(null,'','#'+id);}});
// Enable forms only after all handlers are attached. Without JS they cannot submit data to hosting.
document.querySelectorAll('fieldset[data-js-form]').forEach(fieldset=>{fieldset.disabled=false;});
