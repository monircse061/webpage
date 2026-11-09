'use strict';
const TYPES = {
  publications: {
    label: 'Research paper', file: 'publications.json', title: 'Research papers',
    fields: [
      ['title','Paper title','text',true,'Full title of the publication'],
      ['authors','Authors','text',true,'Use the author order shown in the paper'],
      ['venue','Journal / conference','text',false,'Name of the journal or conference'],
      ['venueUrl','Journal / conference URL','url',false,'Optional publisher or venue page'],
      ['year','Year','text',false,'e.g. 2026'],
      ['status','Publication status','select',false,'Published, accepted, or under review'],
      ['doi','DOI','text',false,'You may enter the DOI or its full URL'],
      ['url','Publication page URL','url',false,'Optional article landing page'],
      ['pdfUrl','PDF URL / uploaded PDF path','text',false,'You can paste a URL or upload a PDF below'],
      ['abstract','Abstract','textarea',false,'A short description of the paper']
    ]
  },
  researchProjects: {
    label: 'Research project', file: 'research-projects.json', title: 'Research projects',
    fields: [
      ['title','Project title','text',true,'Name of the research project'],
      ['description','Project description','textarea',true,'Explain the goal, method, and contribution'],
      ['technologies','Technologies / methods','text',false,'e.g. Python, PyTorch, LLM, RAG'],
      ['role','Your role','text',false,'e.g. Researcher, Lead Developer'],
      ['year','Year / period','text',false,'e.g. 2025–2026'],
      ['githubUrl','GitHub URL','url',false,'Source code or repository'],
      ['paperUrl','Paper / project details URL','url',false,'Optional paper, demo, or details'],
      ['imageUrl','Image URL / uploaded image path','text',false,'Optional project image']
    ]
  },
  academicProjects: {
    label: 'Academic project', file: 'academic-projects.json', title: 'Academic projects',
    fields: [
      ['title','Project title','text',true,'Name of the academic project'],
      ['course','Course / programme','text',false,'e.g. MSc Project, CSE 360'],
      ['level','Study level','text',false,'e.g. MSc, Undergraduate'],
      ['technologies','Technologies / tools','text',false,'Languages, frameworks, tools, and methods'],
      ['description','Project description','textarea',false,'A short explanation of the project'],
      ['links','Project links','links',false,'Add one or more labels and URLs']
    ]
  }
};
let currentUser = null;
let currentView = 'overview';
let activeType = 'publications';
let editingId = null;
let content = {publications:[],researchProjects:[],academicProjects:[]};
const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const notice = (message, kind='success') => { const el=$('#notice'); el.textContent=message; el.className=`notice ${kind}`; el.hidden=false; window.scrollTo({top:0,behavior:'smooth'}); };
const hideNotice = () => { $('#notice').hidden=true; };
async function api(path, options={}) {
  const response = await fetch(path, {credentials:'same-origin', ...options, headers:{'Content-Type':'application/json', ...(options.headers||{})}});
  const result = await response.json().catch(()=>({error:'The server returned an invalid response.'}));
  if (!response.ok) throw new Error(result.error || `Request failed (${response.status})`);
  return result;
}
async function init() {
  let result;
  try {
    result = await api('/api/me', {headers:{}});
  } catch (_) {
    $('#login-screen').hidden = false;
    $('#app').hidden = true;
    return;
  }
  currentUser = result.user;
  $('#user-label').textContent = `@${currentUser.login}`;
  $('#login-screen').hidden = true;
  $('#app').hidden = false;
  try {
    await loadAll();
  } catch (error) {
    notice(error.message, 'error');
  }
}
async function loadAll() {
  const keys = Object.keys(TYPES);
  const results = await Promise.all(keys.map(async key => [key, (await api(`/api/content?type=${key}`, {headers:{}})).items]));
  results.forEach(([key, items]) => content[key] = items);
  renderAll();
}
function renderAll() {
  Object.keys(TYPES).forEach(type => {
    const items = content[type] || [];
    $(`#count-${type}`).textContent = items.length;
    $(`#total-${type}`).textContent = `${items.length} item${items.length===1?'':'s'}`;
    const container = $(`#list-${type}`);
    if (!items.length) { container.innerHTML = '<p class="empty-state">No items yet. Use the button above to add your first item.</p>'; return; }
    container.innerHTML = items.map(item => rowHtml(type,item)).join('');
  });
  const recent = Object.keys(TYPES).flatMap(type => (content[type]||[]).map(item=>({...item,_type:type})))
    .sort((a,b)=>String(b.updatedAt||b.createdAt||'').localeCompare(String(a.updatedAt||a.createdAt||''))).slice(0,5);
  $('#recent-list').innerHTML = recent.length ? recent.map(item=>`<div class="recent-row"><div class="item-main"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(TYPES[item._type].label)} · ${escapeHtml(item.updatedAt ? 'Updated' : 'Added')}</small></div><button class="text-button" data-edit="${item._type}" data-id="${escapeHtml(item.id)}">Edit</button></div>`).join('') : '<p class="empty-state">No dashboard-managed content yet. Add your first item using a quick action above.</p>';
}
function rowHtml(type,item) {
  const meta = type==='publications' ? [item.venue,item.year,item.status].filter(Boolean).join(' · ') : type==='researchProjects' ? [item.technologies,item.year].filter(Boolean).join(' · ') : [item.course,item.level].filter(Boolean).join(' · ');
  return `<div class="content-row"><div class="item-main"><strong>${escapeHtml(item.title||'Untitled')}</strong><small>${escapeHtml(meta||TYPES[type].label)} <span class="status-badge">${escapeHtml(item.status||'Saved')}</span></small></div><div class="item-actions"><button class="text-button" data-edit="${type}" data-id="${escapeHtml(item.id)}">Edit</button><button class="text-button delete" data-delete="${type}" data-id="${escapeHtml(item.id)}">Delete</button></div></div>`;
}
function switchView(view) {
  currentView=view;
  document.querySelectorAll('.view').forEach(el=>el.hidden=el.id!==`view-${view}`);
  document.querySelectorAll('.nav-item').forEach(el=>el.classList.toggle('active',el.dataset.view===view));
  $('#page-title').textContent = view==='overview' ? 'Overview' : TYPES[view].title;
  hideNotice();
}
function renderField(field, value='') {
  const [name,label,type,required,hint] = field;
  const full = type==='textarea' || type==='links';
  if (type==='select') {
    const options=['Published','Accepted','Under Review','Preprint','In Preparation'];
    return `<div class="field"><label for="field-${name}">${label}</label><select id="field-${name}" name="${name}">${options.map(v=>`<option ${value===v?'selected':''}>${v}</option>`).join('')}</select><span class="hint">${hint||''}</span></div>`;
  }
  if (type==='links') {
    const arr=Array.isArray(value)?value:[];
    const val=arr.map(x=>`${x.label||''}|${x.url||''}`).join('\n');
    return `<div class="field full-width"><label for="field-${name}">${label}</label><textarea id="field-${name}" name="${name}" placeholder="GitHub|https://github.com/...&#10;Demo|https://...">${escapeHtml(val)}</textarea><span class="hint">Write one link per line in this format: Label|URL</span></div>`;
  }
  const input = type==='textarea' ? `<textarea id="field-${name}" name="${name}" ${required?'required':''} placeholder="${escapeHtml(hint||'Enter '+label.toLowerCase())}">${escapeHtml(value)}</textarea>` : `<input id="field-${name}" name="${name}" type="${type==='url'?'url':'text'}" value="${escapeHtml(value)}" ${required?'required':''} placeholder="${escapeHtml(hint||'Enter '+label.toLowerCase())}">`;
  return `<div class="field ${full?'full-width':''}"><label for="field-${name}">${label}${required?' *':''}</label>${input}${type!=='textarea'&&hint?`<span class="hint">${escapeHtml(hint)}</span>`:''}</div>`;
}
function openEditor(type,id=null) {
  activeType=type; editingId=id;
  const item=id ? content[type].find(x=>x.id===id) : {};
  $('#dialog-title').textContent = `${id?'Edit':'Add'} ${TYPES[type].label.toLowerCase()}`;
  $('#form-fields').innerHTML = TYPES[type].fields.map(field=>renderField(field,item?.[field[0]] ?? (field[0]==='status'?'Published':''))).join('');
  if (type==='publications' || type==='researchProjects') {
    const isPdf = type==='publications';
    const label=isPdf?'Upload PDF':'Upload project image';
    $('#form-fields').insertAdjacentHTML('beforeend',`<div class="field full-width"><label>${label}</label><div class="upload-row"><input id="asset-file" type="file" accept="${isPdf?'.pdf,application/pdf':'image/png,image/jpeg,image/webp'}"><button type="button" id="upload-asset" class="button secondary small">Upload to GitHub</button></div><span class="hint">The uploaded file will be saved in your repository's uploads folder. Its path will be inserted into the relevant URL field.</span></div>`);
    $('#upload-asset').addEventListener('click',()=>uploadAsset(isPdf?'pdf':'image'));
  }
  $('#form-message').textContent='';
  $('#save-button').disabled=false;
  $('#content-dialog').showModal();
}
async function uploadAsset(kind) {
  const file=$('#asset-file')?.files?.[0];
  if (!file) { $('#form-message').textContent='Choose a file first.'; return; }
  const allowed = kind==='pdf' ? file.type==='application/pdf' : ['image/png','image/jpeg','image/webp'].includes(file.type);
  if (!allowed) { $('#form-message').textContent=kind==='pdf'?'Please choose a PDF file.':'Choose a PNG, JPG, or WebP image.'; return; }
  if (file.size>8*1024*1024) { $('#form-message').textContent='The file must be smaller than 8 MB.'; return; }
  $('#form-message').textContent='Uploading and committing file to GitHub…';
  $('#upload-asset').disabled=true;
  try {
    const base64=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=reject;reader.readAsDataURL(file);});
    const result=await api('/api/upload',{method:'POST',body:JSON.stringify({name:file.name,mimeType:file.type,contentBase64:base64})});
    const target=activeType==='publications'?'pdfUrl':'imageUrl';
    const input=$(`#field-${target}`);
    if(input) input.value=result.path;
    $('#form-message').textContent=`Uploaded: ${result.path}`;
  } catch(error) { $('#form-message').textContent=error.message; }
  finally { $('#upload-asset').disabled=false; }
}
function collectForm() {
  const item={};
  for (const [name,label,type] of TYPES[activeType].fields) {
    const value=$(`#field-${name}`)?.value?.trim() ?? '';
    item[name]=type==='links' ? value.split('\n').map(line=>{const [label,url]=line.split('|');return {label:(label||'').trim(),url:(url||'').trim()};}).filter(x=>x.label&&x.url) : value;
  }
  return item;
}
async function saveContent(event) {
  event.preventDefault();
  const payload=collectForm();
  const required=TYPES[activeType].fields.filter(f=>f[3]).map(f=>f[0]);
  if(required.some(key=>!payload[key])) { $('#form-message').textContent='Please complete all required fields.'; return; }
  const items=[...content[activeType]];
  const now=new Date().toISOString();
  if(editingId) {
    const index=items.findIndex(x=>x.id===editingId);
    if(index<0) return;
    items[index]={...items[index],...payload,updatedAt:now};
  } else {
    items.unshift({id:crypto.randomUUID(),...payload,createdAt:now});
  }
  $('#save-button').disabled=true;
  $('#form-message').textContent='Saving changes to GitHub…';
  try {
    await api(`/api/content?type=${activeType}`,{method:'PUT',body:JSON.stringify({items})});
    content[activeType]=items;
    $('#content-dialog').close();
    renderAll();
    notice('Changes committed to GitHub. Your live website will update after GitHub Pages finishes deploying.');
  } catch(error) {
    $('#form-message').textContent=error.message;
    $('#save-button').disabled=false;
  }
}
async function deleteContent(type,id) {
  const item=content[type].find(x=>x.id===id);
  if(!item || !window.confirm(`Delete “${item.title}”? This change will be committed to GitHub.`)) return;
  const items=content[type].filter(x=>x.id!==id);
  try {
    await api(`/api/content?type=${type}`,{method:'PUT',body:JSON.stringify({items})});
    content[type]=items; renderAll(); notice('Item deleted and the change was committed to GitHub.');
  } catch(error) { notice(error.message,'error'); }
}
document.addEventListener('click',event=>{
  const nav=event.target.closest('[data-view]'); if(nav){switchView(nav.dataset.view);return;}
  const create=event.target.closest('[data-create]'); if(create){openEditor(create.dataset.create);return;}
  const edit=event.target.closest('[data-edit]'); if(edit){openEditor(edit.dataset.edit,edit.dataset.id);return;}
  const del=event.target.closest('[data-delete]'); if(del){deleteContent(del.dataset.delete,del.dataset.id);return;}
});
$('#content-form').addEventListener('submit',saveContent);
$('#close-dialog').addEventListener('click',()=>$('#content-dialog').close());
$('#cancel-button').addEventListener('click',()=>$('#content-dialog').close());
$('#logout-button').addEventListener('click',async()=>{try{await api('/auth/logout',{method:'POST',body:'{}'});}catch(_){}location.href='/';});
init().catch(error=>{console.error(error);$('#login-screen').hidden=false;});
