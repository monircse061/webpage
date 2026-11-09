'use strict';

const TYPES = {
  homeProfile: {
    label: 'Home page profile', title: 'Home page profile', singleton: true,
    fields: [
      ['name','Display name','text',true,'Name shown on the homepage'],
      ['nativeName','Name in Bangla / Korean','text',false,'Optional additional name'],
      ['headline','Professional headline','text',false,'Optional title or short role'],
      ['biography','Homepage biography','textarea',true,'Your introduction and current academic profile'],
      ['profileImageUrl','Profile image URL / uploaded image','text',false,'Relative repository path or public image URL'],
      ['resumeUrl','CV / resume PDF URL','text',false,'Link to your current CV or resume'],
      ['researchIntro','Research section introduction','text',false,'Short heading above your research interests'],
      ['researchInterests','Research interests (one per line)','list',false,'One research area per line'],
      ['supervisorName','Supervisor name','text',false,'Optional name linked in your biography'],
      ['supervisorUrl','Supervisor website','url',false,'Optional supervisor profile'],
      ['labUrl','Lab / group website','url',false,'Optional laboratory or group page'],
      ['coCurricularIntro','Co-curricular introduction','textarea',false,'Introduction shown in the homepage co-curricular section'],
      ['linkedinUrl','LinkedIn URL','url',false,''],
      ['githubUrl','GitHub profile URL','url',false,''],
      ['youtubeUrl','YouTube channel URL','url',false,''],
      ['researchgateUrl','ResearchGate URL','url',false,''],
      ['email','Contact email','text',false,'']
    ]
  },
  education: {
    label: 'Education', title: 'Education', sortField: 'endYear',
    fields: [
      ['degree','Degree / qualification','text',true,'e.g. MSc, BSc, Higher Secondary Certificate'],
      ['field','Subject / major','text',false,'e.g. Artificial Intelligence Convergence'],
      ['institution','Institution','text',true,'University, college, or school'],
      ['location','Location','text',false,'City, country'],
      ['startYear','Start year','text',false,'e.g. 2024'],
      ['endYear','End year','text',false,'e.g. 2025'],
      ['details','Additional details','textarea',false,'CGPA, honours, thesis, scholarship, or other details'],
      ['url','Institution / programme URL','url',false,'']
    ]
  },
  experience: {
    label: 'Experience', title: 'Experience', sortField: 'startDate',
    fields: [
      ['position','Position / role','text',true,'e.g. Lecturer, Research Assistant'],
      ['organization','Organization / laboratory','text',true,'University, company, school, or lab'],
      ['location','Location','text',false,'City, country'],
      ['startDate','Start date','text',false,'Use YYYY-MM, e.g. 2026-09'],
      ['endDate','End date','text',false,'Use YYYY-MM or Ongoing'],
      ['employmentType','Employment type','text',false,'e.g. Full-time, Part-time, Research Assistant'],
      ['description','Description / responsibilities','textarea',false,'Optional role summary'],
      ['courseUrl','Courses / related URL','text',false,'e.g. Teaching.html or a public URL']
    ]
  },
  milestones: {
    label: 'Homepage milestone', title: 'Homepage timeline', sortField: 'date',
    fields: [
      ['date','Date','text',true,'Use YYYY-MM-DD or a clear date, e.g. 2025-10-27'],
      ['title','Milestone title','text',true,'e.g. Joined as a Lecturer'],
      ['description','Description','textarea',false,'Event details'],
      ['url','Related link','url',false,'Optional publication, conference, or news link']
    ]
  },
  testScores: {
    label: 'Standardized test score', title: 'Standardized test scores', sortField: 'date',
    fields: [
      ['testName','Test name','text',true,'e.g. DET, IELTS, PTE Academic, TOEFL, GRE'],
      ['overall','Overall score','text',false,'e.g. 115, 7.5, 75'],
      ['date','Test date','text',false,'Use YYYY-MM or YYYY-MM-DD'],
      ['status','Status','select',false,''],
      ['listening','Listening','text',false,''],
      ['reading','Reading','text',false,''],
      ['writing','Writing','text',false,''],
      ['speaking','Speaking','text',false,''],
      ['literacy','Literacy (DET)','text',false,''],
      ['comprehension','Comprehension (DET)','text',false,''],
      ['conversation','Conversation (DET)','text',false,''],
      ['production','Production (DET)','text',false,''],
      ['verbal','Verbal (GRE)','text',false,''],
      ['quantitative','Quantitative (GRE)','text',false,''],
      ['analyticalWriting','Analytical writing (GRE)','text',false,''],
      ['notes','Notes','textarea',false,'Optional note, e.g. planned or superscore']
    ]
  },
  publications: {
    label: 'Research paper', title: 'Research papers', sortField: 'legacyRank',
    fields: [
      ['title','Paper title','text',true,'Full title of the publication'],
      ['authors','Authors','text',true,'Use the author order shown in the paper'],
      ['venue','Journal / conference','text',false,'Name of the journal or conference'],
      ['venueUrl','Journal / conference URL','url',false,'Optional publisher or venue page'],
      ['year','Year','text',false,'e.g. 2026'],
      ['legacyRank','Display order (higher appears first)','number',false,'The current entries are numbered in their original website order. New papers receive the next highest order automatically.'],
      ['status','Publication status','select',false,''],
      ['doi','DOI','text',false,'You may enter the DOI or its full URL'],
      ['url','Publication page URL','url',false,'Optional article landing page'],
      ['pdfUrl','PDF URL / uploaded PDF path','text',false,'You can paste a URL or upload a PDF below'],
      ['abstract','Abstract','textarea',false,'A short description of the paper'],
      ['links','Additional links','links',false,'Optional additional paper, conference, or certificate links']
    ]
  },
  researchProjects: {
    label: 'Research project', title: 'Research projects', sortField: 'year',
    fields: [
      ['title','Project title','text',true,'Name of the research project'],
      ['description','Project description','textarea',true,'Explain the goal, method, and contribution'],
      ['technologies','Technologies / methods','textarea',false,'e.g. Python, PyTorch, LLM, RAG'],
      ['role','Your role','text',false,'e.g. Researcher, Lead Developer'],
      ['year','Year / period','text',false,'e.g. 2025 or 2024–2025'],
      ['githubUrl','GitHub URL','url',false,'Source code or repository'],
      ['paperUrl','Paper / project details URL','url',false,'Optional paper, demo, or details'],
      ['imageUrl','Image URL / uploaded image path','text',false,'Optional project image'],
      ['links','Additional links','links',false,'One link per line: Label|URL']
    ]
  },
  academicProjects: {
    label: 'Academic project', title: 'Academic projects', sortField: 'year',
    fields: [
      ['title','Project title','text',true,'Name of the academic project'],
      ['course','Course / programme','text',false,'e.g. MSc Project, CSE 360'],
      ['level','Study level','text',false,'e.g. MSc, Undergraduate'],
      ['year','Year / period','text',false,'e.g. 2025 or 2021–2022; used for newest-first sorting'],
      ['technologies','Technologies / tools','textarea',false,'Languages, frameworks, tools, and methods'],
      ['description','Project description','textarea',false,'A short explanation of the project'],
      ['links','Project links','links',false,'Write one link per line: Label|URL']
    ]
  },
  teachingCourses: {
    label: 'Teaching course', title: 'Teaching courses', sortField: 'year',
    fields: [
      ['institution','Institution','text',true,'e.g. Uttara University, Shaheen Cadet School and College'],
      ['term','Semester / period','text',true,'e.g. Fall 2025, Spring 2023, March–August 2022'],
      ['year','Year','text',true,'Used to sort the teaching history newest first'],
      ['courseCode','Course code','text',false,'e.g. CSE0613207'],
      ['courseTitle','Course title','text',true,'Name of the course'],
      ['details','Additional details','textarea',false,'Optional note about the course'],
      ['courseUrl','Related course URL','text',false,'Optional course page or Teaching.html']
    ]
  },
  certifications: {
    label: 'Certificate / course', title: 'Certificates and courses', sortField: 'date',
    fields: [
      ['title','Certificate / course title','text',true,'Full certificate or course name'],
      ['date','Date','text',false,'Use YYYY-MM-DD or a clear date, e.g. April 02, 2022'],
      ['category','Category','text',false,'e.g. Research, Python, Data Science, Leadership'],
      ['description','Description','textarea',false,'Optional details'],
      ['imageUrl','Certificate image URL / repository path','text',false,'Existing images use paths such as images/certificate.png'],
      ['url','Certificate / course URL','url',false,'Optional public certificate or course page'],
      ['links','Additional links','links',false,'One link per line: Label|URL']
    ]
  },
  leadership: {
    label: 'Leadership / voluntary role', title: 'Leadership and voluntary experience', sortField: 'startDate',
    fields: [
      ['title','Role / activity','text',true,'e.g. District Team Leader at ICT Olympiad Bangladesh'],
      ['organization','Organization','text',false,'Club, institution, or event organizer'],
      ['startDate','Start year / date','text',false,'e.g. 2022'],
      ['endDate','End year / date','text',false,'e.g. 2023 or Ongoing'],
      ['description','Description','textarea',false,'Responsibilities and contributions'],
      ['links','Related links','links',false,'One link per line: Label|URL']
    ]
  },
  achievements: {
    label: 'Award / scholarship', title: 'Awards and scholarships', sortField: 'date',
    fields: [
      ['title','Award / scholarship title','text',true,'Full title'],
      ['date','Date / year','text',false,'e.g. 2022-06 or 2016'],
      ['category','Category','text',false,'e.g. Scholarship, Academic award, Leadership'],
      ['description','Description','textarea',false,'Details, ranking, eligibility, or awarding body'],
      ['links','Related links','links',false,'One link per line: Label|URL']
    ]
  },
  showcases: {
    label: 'Web / design showcase', title: 'Web development and design showcase', sortField: '',
    fields: [
      ['title','Project / portfolio title','text',true,'e.g. Sign Up Page (HTML & CSS)'],
      ['category','Category','text',false,'e.g. Web development, Design portfolio'],
      ['description','Description','textarea',false,'A short description of the work'],
      ['url','Live demo / profile URL','url',false,'Public URL'],
      ['links','Additional links','links',false,'One link per line: Label|URL']
    ]
  }
};

let currentUser = null;
let currentView = 'overview';
let activeType = 'publications';
let editingId = null;
let content = Object.fromEntries(Object.keys(TYPES).map(key => [key, []]));
const sortModes = Object.fromEntries(Object.keys(TYPES).map(key => [key, 'newest']));
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
  try { result = await api('/api/me', {headers:{}}); }
  catch (_) { $('#login-screen').hidden=false; $('#app').hidden=true; return; }
  currentUser=result.user;
  $('#user-label').textContent=`@${currentUser.login}`;
  $('#login-screen').hidden=true;
  $('#app').hidden=false;
  try { await loadAll(); }
  catch(error) { notice(error.message,'error'); }
}
async function loadAll() {
  const results=await Promise.all(Object.keys(TYPES).map(async key=>[key,(await api(`/api/content?type=${encodeURIComponent(key)}`,{headers:{}})).items]));
  results.forEach(([key,items])=>content[key]=items);
  renderAll();
}
function parseSortDate(value) {
  const text=String(value??'').trim();
  if(!text || /^ongoing|present|current$/i.test(text)) return /^ongoing|present|current$/i.test(text) ? Date.now() : null;
  const yearRange=text.match(/^(\d{4})\s*(?:-|–|—|to)\s*(\d{4})$/i);
  if(yearRange) return Date.UTC(Number(yearRange[2]),0,1);
  if(/^\d{4}$/.test(text)) return Date.UTC(Number(text),0,1);
  if(/^\d{4}-\d{2}$/.test(text)) return Date.parse(`${text}-01T00:00:00Z`);
  const time=Date.parse(text);
  return Number.isFinite(time) ? time : null;
}
function itemSortValue(type,item) {
  const field=TYPES[type].sortField;
  const raw=field ? item[field] : '';
  if(field==='legacyRank' && raw!=='' && raw!==null && raw!==undefined && Number.isFinite(Number(raw))) return Number(raw);
  const parsed=parseSortDate(raw);
  if(parsed!==null) return parsed;
  const fallback=Date.parse(item.updatedAt||item.createdAt||'');
  return Number.isFinite(fallback) ? fallback : 0;
}
function sortedItems(type,items) {
  const direction=sortModes[type]==='oldest' ? 1 : -1;
  return [...items].sort((a,b)=>{
    const diff=itemSortValue(type,a)-itemSortValue(type,b);
    if(diff!==0) return direction*diff;
    return String(a.title||a.testName||a.position||'').localeCompare(String(b.title||b.testName||b.position||''));
  });
}
function displayTitle(type,item) {
  if(type==='homeProfile') return item.name || 'Homepage profile';
  if(type==='education') return [item.degree,item.field].filter(Boolean).join(' in ') || 'Education';
  if(type==='experience') return item.position || 'Experience';
  if(type==='testScores') return item.testName || 'Test score';
  if(type==='teachingCourses') return `${item.courseCode ? item.courseCode + ': ' : ''}${item.courseTitle || 'Course'}`;
  if(type==='certifications') return item.title || 'Certificate / course';
  if(type==='leadership') return item.title || 'Leadership activity';
  if(type==='achievements') return item.title || 'Award / scholarship';
  if(type==='showcases') return item.title || 'Showcase item';
  return item.title || 'Untitled';
}
function itemMeta(type,item) {
  if(type==='homeProfile') return 'Biography, research interests, photo, CV and contact links';
  if(type==='education') return [item.institution,[item.startYear,item.endYear].filter(Boolean).join('–'),item.location].filter(Boolean).join(' · ');
  if(type==='experience') return [item.organization,[item.startDate,item.endDate].filter(Boolean).join(' – '),item.location].filter(Boolean).join(' · ');
  if(type==='milestones') return [item.date,item.description].filter(Boolean).join(' · ');
  if(type==='testScores') return [item.overall?`Overall: ${item.overall}`:'',item.date,item.status].filter(Boolean).join(' · ');
  if(type==='teachingCourses') return [item.institution,item.term,item.year].filter(Boolean).join(' · ');
  if(type==='certifications') return [item.category,item.date].filter(Boolean).join(' · ');
  if(type==='leadership') return [item.organization,[item.startDate,item.endDate].filter(Boolean).join(' – ')].filter(Boolean).join(' · ');
  if(type==='achievements') return [item.category,item.date].filter(Boolean).join(' · ');
  if(type==='showcases') return item.category || item.url || '';
  if(type==='publications') return [item.venue,item.year,item.status].filter(Boolean).join(' · ');
  if(type==='researchProjects') return [item.technologies,item.year].filter(Boolean).join(' · ');
  return [item.course,item.year,item.level].filter(Boolean).join(' · ');
}
function rowHtml(type,item) {
  const title=displayTitle(type,item);
  const meta=itemMeta(type,item);
  const id=escapeHtml(item.id||'');
  const canDelete=type!=='homeProfile';
  return `<div class="content-row"><div class="item-main"><strong>${escapeHtml(title)}</strong><small>${escapeHtml(meta||TYPES[type].label)}${item.status?` <span class="status-badge">${escapeHtml(item.status)}</span>`:''}</small></div><div class="item-actions"><button class="text-button" data-edit="${type}" data-id="${id}">Edit</button>${canDelete?`<button class="text-button delete" data-delete="${type}" data-id="${id}">Delete</button>`:''}</div></div>`;
}
function renderAll() {
  Object.keys(TYPES).forEach(type=>{
    const items=sortedItems(type,content[type]||[]);
    const count=$(`#count-${type}`); if(count) count.textContent=items.length;
    const total=$(`#total-${type}`); if(total) total.textContent=`${items.length} item${items.length===1?'':'s'}`;
    const container=$(`#list-${type}`);
    if(container) container.innerHTML=items.length?items.map(item=>rowHtml(type,item)).join(''):'<p class="empty-state">No entries yet. Use the button above to add your first entry.</p>';
    const selector=$(`[data-sort="${type}"]`); if(selector) selector.value=sortModes[type];
    if(type==='homeProfile') {
      const summary=$('#profile-summary');
      const item=items[0];
      if(summary) summary.innerHTML=item?`<div class="profile-preview"><strong>${escapeHtml(item.name||'')}</strong><p>${escapeHtml(item.biography||'')}</p><small>${escapeHtml(Array.isArray(item.researchInterests)?item.researchInterests.join(' · '):item.researchInterests||'')}</small></div>`:'<p class="empty-state">Homepage profile has not been configured yet.</p>';
    }
  });
  const recent=Object.keys(TYPES).flatMap(type=>(content[type]||[]).map(item=>({...item,_type:type})))
    .sort((a,b)=>String(b.updatedAt||b.createdAt||'').localeCompare(String(a.updatedAt||a.createdAt||''))).slice(0,8);
  $('#recent-list').innerHTML=recent.length?recent.map(item=>`<div class="recent-row"><div class="item-main"><strong>${escapeHtml(displayTitle(item._type,item))}</strong><small>${escapeHtml(TYPES[item._type].label)} · ${escapeHtml(item.updatedAt?'Updated':'Added')}</small></div><button class="text-button" data-edit="${item._type}" data-id="${escapeHtml(item.id)}">Edit</button></div>`).join(''):'<p class="empty-state">No content yet. Start by editing your homepage profile or adding a paper or project.</p>';
}
function switchView(view) {
  if(!TYPES[view] && view!=='overview') return;
  currentView=view;
  document.querySelectorAll('.view').forEach(el=>el.hidden=el.id!==`view-${view}`);
  document.querySelectorAll('.nav-item').forEach(el=>el.classList.toggle('active',el.dataset.view===view));
  $('#page-title').textContent=view==='overview'?'Overview':TYPES[view].title;
  hideNotice();
}
function renderField(field,value='') {
  const [name,label,type,required,hint]=field;
  const full=['textarea','links','list'].includes(type);
  if(type==='select') {
    const opts=name==='status'?['Published','Accepted','Under Review','Preprint','In Preparation','Planned','Not reported','Completed']:['Published','Accepted','Under Review','Preprint','In Preparation'];
    const options=opts.map(v=>`<option value="${escapeHtml(v)}" ${value===v?'selected':''}>${escapeHtml(v)}</option>`).join('');
    return `<div class="field"><label for="field-${name}">${label}${required?' *':''}</label><select id="field-${name}" name="${name}">${options}</select>${hint?`<span class="hint">${escapeHtml(hint)}</span>`:''}</div>`;
  }
  if(type==='links'||type==='list') {
    const val=type==='links'?(Array.isArray(value)?value:[]).map(x=>`${x.label||''}|${x.url||''}`).join('\n'):(Array.isArray(value)?value.join('\n'):String(value||''));
    const placeholder=type==='links'?'GitHub|https://github.com/...\nDemo|https://...':'One item per line';
    const helper=type==='links'?'Write one link per line: Label|URL':'Write one item per line.';
    return `<div class="field full-width"><label for="field-${name}">${label}${required?' *':''}</label><textarea id="field-${name}" name="${name}" placeholder="${escapeHtml(placeholder)}">${escapeHtml(val)}</textarea><span class="hint">${escapeHtml(hint||helper)}</span></div>`;
  }
  const input=type==='textarea'?`<textarea id="field-${name}" name="${name}" ${required?'required':''} placeholder="${escapeHtml(hint||'Enter '+label.toLowerCase())}">${escapeHtml(value)}</textarea>`:`<input id="field-${name}" name="${name}" type="${type==='url'?'url':type==='number'?'number':'text'}" value="${escapeHtml(value)}" ${required?'required':''} placeholder="${escapeHtml(hint||'Enter '+label.toLowerCase())}">`;
  return `<div class="field ${full?'full-width':''}"><label for="field-${name}">${label}${required?' *':''}</label>${input}${hint?`<span class="hint">${escapeHtml(hint)}</span>`:''}</div>`;
}
function openEditor(type,id=null) {
  if(!TYPES[type]) return;
  activeType=type; editingId=id;
  let item=id?(content[type]||[]).find(x=>x.id===id):null;
  if(!item && TYPES[type].singleton) item=(content[type]||[])[0]||{};
  item=item||{};
  $('#dialog-title').textContent=`${id||TYPES[type].singleton?'Edit':'Add'} ${TYPES[type].label.toLowerCase()}`;
  $('#form-fields').innerHTML=TYPES[type].fields.map(field=>renderField(field,item[field[0]]??(field[0]==='status'?'Published':''))).join('');
  if(['publications','researchProjects','homeProfile','certifications'].includes(type)) {
    const controls=[];
    if(type==='publications') controls.push({kind:'pdf',target:'pdfUrl',label:'Upload paper PDF'});
    if(type==='researchProjects') controls.push({kind:'image',target:'imageUrl',label:'Upload project image'});
    if(type==='homeProfile') controls.push({kind:'image',target:'profileImageUrl',label:'Upload profile image'},{kind:'pdf',target:'resumeUrl',label:'Upload CV / resume PDF'});
    if(type==='certifications') controls.push({kind:'image',target:'imageUrl',label:'Upload certificate image'});
    controls.forEach((control,index)=>{
      const idSuffix=`${control.kind}-${index}`;
      $('#form-fields').insertAdjacentHTML('beforeend',`<div class="field full-width"><label>${control.label}</label><div class="upload-row"><input id="asset-file-${idSuffix}" type="file" accept="${control.kind==='pdf'?'.pdf,application/pdf':'image/png,image/jpeg,image/webp'}"><button type="button" id="upload-asset-${idSuffix}" class="button secondary small">Upload to GitHub</button></div><span class="hint">The file will be committed to your repository's uploads folder and its path will be placed in the ${escapeHtml(control.target)} field.</span></div>`);
      $(`#upload-asset-${idSuffix}`).addEventListener('click',()=>uploadAsset(control.kind,control.target,idSuffix));
    });
  }
  $('#form-message').textContent='';
  $('#save-button').disabled=false;
  $('#content-dialog').showModal();
}
async function uploadAsset(kind,target,idSuffix) {
  const file=$(`#asset-file-${idSuffix}`)?.files?.[0];
  if(!file){$('#form-message').textContent='Choose a file first.';return;}
  const allowed=kind==='pdf'?file.type==='application/pdf':['image/png','image/jpeg','image/webp'].includes(file.type);
  if(!allowed){$('#form-message').textContent=kind==='pdf'?'Please choose a PDF file.':'Choose a PNG, JPG, or WebP image.';return;}
  if(file.size>8*1024*1024){$('#form-message').textContent='The file must be smaller than 8 MB.';return;}
  $('#form-message').textContent='Uploading and committing file to GitHub…';
  const button=$(`#upload-asset-${idSuffix}`);button.disabled=true;
  try{
    const base64=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=reject;reader.readAsDataURL(file);});
    const result=await api('/api/upload',{method:'POST',body:JSON.stringify({name:file.name,mimeType:file.type,contentBase64:base64})});
    const input=$(`#field-${target}`);if(input)input.value=result.path;
    $('#form-message').textContent=`Uploaded: ${result.path}`;
  }catch(error){$('#form-message').textContent=error.message;}
  finally{button.disabled=false;}
}
function collectForm() {
  const item={};
  for(const [name,label,type] of TYPES[activeType].fields){
    const value=$(`#field-${name}`)?.value?.trim()??'';
    if(type==='links') item[name]=value.split('\n').map(line=>{const [label,url]=line.split('|');return{label:(label||'').trim(),url:(url||'').trim()};}).filter(x=>x.label&&x.url);
    else if(type==='list') item[name]=value.split('\n').map(x=>x.trim()).filter(Boolean);
    else item[name]=value;
  }
  return item;
}
async function saveContent(event) {
  event.preventDefault();
  const payload=collectForm();
  const config=TYPES[activeType];
  const required=config.fields.filter(f=>f[3]).map(f=>f[0]);
  if(required.some(key=>!payload[key])){$('#form-message').textContent='Please complete all required fields.';return;}
  const items=[...(content[activeType]||[])];
  const now=new Date().toISOString();
  if(config.singleton){
    const prior=items[0]||{};
    items.splice(0,items.length,{...prior,...payload,id:prior.id||'home-profile',createdAt:prior.createdAt||now,updatedAt:now});
  }else if(editingId){
    const index=items.findIndex(x=>x.id===editingId);if(index<0)return;
    items[index]={...items[index],...payload,updatedAt:now};
  }else{
    if(activeType==='publications') {
      const highest=Math.max(0,...items.map(x=>Number(x.legacyRank)||0));
      payload.legacyRank=Number(payload.legacyRank)||highest+1;
    }
    items.unshift({id:crypto.randomUUID(),...payload,createdAt:now});
  }
  $('#save-button').disabled=true;$('#form-message').textContent='Saving changes to GitHub…';
  try{
    await api(`/api/content?type=${encodeURIComponent(activeType)}`,{method:'PUT',body:JSON.stringify({items})});
    content[activeType]=items;$('#content-dialog').close();renderAll();notice('Changes committed to GitHub. GitHub Pages will publish the update after its deployment finishes.');
  }catch(error){$('#form-message').textContent=error.message;$('#save-button').disabled=false;}
}
async function deleteContent(type,id){
  const item=(content[type]||[]).find(x=>x.id===id);
  if(!item||!window.confirm(`Delete “${displayTitle(type,item)}”? This change will be committed to GitHub.`))return;
  const items=content[type].filter(x=>x.id!==id);
  try{await api(`/api/content?type=${encodeURIComponent(type)}`,{method:'PUT',body:JSON.stringify({items})});content[type]=items;renderAll();notice('Entry deleted and the change was committed to GitHub.');}
  catch(error){notice(error.message,'error');}
}
document.addEventListener('click',event=>{
  const nav=event.target.closest('[data-view]');if(nav){switchView(nav.dataset.view);return;}
  const create=event.target.closest('[data-create]');if(create){openEditor(create.dataset.create);return;}
  const edit=event.target.closest('[data-edit]');if(edit){openEditor(edit.dataset.edit,edit.dataset.id);return;}
  const del=event.target.closest('[data-delete]');if(del){deleteContent(del.dataset.delete,del.dataset.id);return;}
});
document.addEventListener('change',event=>{
  const sort=event.target.closest('[data-sort]');if(sort){sortModes[sort.dataset.sort]=sort.value;renderAll();}
});
$('#content-form').addEventListener('submit',saveContent);
$('#close-dialog').addEventListener('click',()=>$('#content-dialog').close());
$('#cancel-button').addEventListener('click',()=>$('#content-dialog').close());
$('#logout-button').addEventListener('click',async()=>{try{await api('/auth/logout',{method:'POST',body:'{}'});}catch(_){}location.href='/';});
init().catch(error=>{console.error(error);$('#login-screen').hidden=false;});
