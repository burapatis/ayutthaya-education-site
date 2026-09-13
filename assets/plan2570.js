'use strict';
(()=>{
 const form=document.getElementById('plan2570-form');if(!form)return;
 const fields=Array.from(form.querySelectorAll('textarea'));
 const status=document.getElementById('plan2570-status');
 form.addEventListener('submit',e=>{
  e.preventDefault();
  if(!fields.some(f=>f.value.trim())){status.textContent='ยังไม่มีข้อความ โปรดกรอกอย่างน้อยหนึ่งช่อง หรือดาวน์โหลดใบงานเปล่าจากลิงก์ด้านบน';fields[0].focus();return;}
  const text='# ใบงานทบทวนแผน 2566–2570 และโครงการปีงบประมาณ 2570\n\nร่างเพื่อพิจารณา ยังไม่ใช่มติรับรอง ห้ามเผยแพร่ข้อมูลส่วนบุคคล\n\n'+fields.map(f=>'## '+f.dataset.title+'\n\n'+(f.value.trim()||'ยังไม่กรอก / รอยืนยัน')).join('\n\n');
  const url=URL.createObjectURL(new Blob([text],{type:'text/markdown;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='ใบงานแผน2570.md';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  status.textContent='จัดทำไฟล์ดาวน์โหลดแล้ว โปรดตรวจว่าไฟล์อยู่ในอุปกรณ์ของคุณ ข้อมูลไม่ได้ส่งไปยังเว็บไซต์';
 });
 document.getElementById('plan2570-clear').addEventListener('click',()=>{if(!confirm('ล้างข้อความทั้ง 10 ช่องหรือไม่? ควรดาวน์โหลดก่อนหากต้องการเก็บไว้'))return;form.reset();status.textContent='ล้างข้อความแล้ว';fields[0].focus();});
 form.querySelector('[data-js-form]').disabled=false;
})();
