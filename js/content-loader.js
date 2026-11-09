/* Loads dashboard-managed JSON while keeping the existing Nicepage visual theme. */
(function () {
  'use strict';
  const BASE='data/';
  const esc=(value)=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const safeUrl=(value)=>{
    const raw=String(value||'').trim();if(!raw)return'';
    try{const url=new URL(raw,window.location.href);return ['http:','https:'].includes(url.protocol)?url.href:'';}catch(_){return'';}
  };
  const link=(url,label,cls)=>{const href=safeUrl(url);return href?`<a${cls?` class="${cls}"`:''} href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`:'';};
  async function load(file){try{const response=await fetch(`${BASE}${file}`,{cache:'no-store'});if(!response.ok)return[];const json=await response.json();return Array.isArray(json)?json:[];}catch(error){console.warn(`Could not load ${file}`,error);return[];}}
  function parseDate(value){
    const text=String(value??'').trim();if(!text)return null;
    if(/^\d{4}$/.test(text))return Date.UTC(Number(text),0,1);
    const range=text.match(/^(\d{4})\s*(?:-|–|—|to)\s*(\d{4})$/i);if(range)return Date.UTC(Number(range[2]),0,1);
    if(/^\d{4}-\d{2}$/.test(text))return Date.parse(`${text}-01T00:00:00Z`);
    const parsed=Date.parse(text);return Number.isFinite(parsed)?parsed:null;
  }
  function sortNewest(items,field){
    return [...(items||[])].sort((a,b)=>{
      if(field==='legacyRank' && (a.legacyRank!==undefined || b.legacyRank!==undefined)) {
        const rankA=Number.isFinite(Number(a.legacyRank))?Number(a.legacyRank):0;
        const rankB=Number.isFinite(Number(b.legacyRank))?Number(b.legacyRank):0;
        if(rankA!==rankB)return rankB-rankA;
      }
      const ca=Date.parse(a.updatedAt||a.createdAt||'');
      const cb=Date.parse(b.updatedAt||b.createdAt||'');
      const da=parseDate(a[field]) ?? (Number.isFinite(ca)?ca:0);
      const db=parseDate(b[field]) ?? (Number.isFinite(cb)?cb:0);
      return db-da;
    });
  }
  function renderProfile(profile){
    if(!profile)return;
    const name=document.querySelector('#carousel_4809 .u-text-1');
    if(name)name.innerHTML=`<b>${esc(profile.name||'')}${profile.nativeName?`<br>${esc(profile.nativeName)}`:''}</b>`;
    const bio=document.querySelector('#carousel_4809 .u-text-2');
    if(bio){
      let bioText=String(profile.biography||'');
      const supervisor=String(profile.supervisorName||'').trim();
      const supervisorUrl=safeUrl(profile.supervisorUrl);
      let bioHtml=esc(bioText);
      if(supervisor&&supervisorUrl){const escapedName=esc(supervisor);const idx=bioHtml.indexOf(escapedName);if(idx>=0)bioHtml=bioHtml.slice(0,idx)+`<a href="${esc(supervisorUrl)}" target="_blank" rel="noopener noreferrer">${escapedName}</a>`+bioHtml.slice(idx+escapedName.length);}
      bio.innerHTML=bioHtml;
    }
    const photo=document.querySelector('#carousel_4809 .u-image-1');
    const photoUrl=safeUrl(profile.profileImageUrl);if(photo&&photoUrl)photo.style.backgroundImage=`url("${photoUrl.replace(/"/g,'%22')}")`;
    const interest=document.querySelector('#carousel_3064 h2');
    if(interest){
      const values=Array.isArray(profile.researchInterests)?profile.researchInterests:String(profile.researchInterests||'').split(/\n|,/).map(x=>x.trim()).filter(Boolean);
      interest.innerHTML=`${esc(profile.researchIntro||'I am highly interested in research fields.')}<br><br><span class="u-text-palette-5-base"><span style="text-decoration:underline !important;">My research interests</span></span><br>${values.map(esc).join(' · ')}`;
    }
    const co=document.querySelector('#carousel_5426 .u-text-2');if(co&&profile.coCurricularIntro)co.textContent=profile.coCurricularIntro;
    const contact=document.querySelector('#sec-257e');
    if(contact){
      const social=[['.u-icon-1',profile.linkedinUrl],['.u-icon-2',profile.githubUrl],['.u-icon-3',profile.youtubeUrl],['.u-icon-4',profile.researchgateUrl]];
      social.forEach(([selector,url])=>{const el=contact.querySelector(selector);if(el&&safeUrl(url))el.setAttribute('data-href',safeUrl(url));});
      const email=contact.querySelector('a.u-btn-1');if(email&&profile.email){email.href=`mailto:${encodeURIComponent(profile.email)}`;}
    }
  }
  function renderEducation(items,profile){
    const section=document.querySelector('#sec-15b9');const p=section?.querySelector('p.u-text-2');if(!p||!items.length)return;
    const html=sortNewest(items,'endYear').map(item=>{
      const range=[item.startYear,item.endYear].filter(Boolean).join('–');
      const institution=safeUrl(item.url)?link(item.url,item.institution||'Institution'):`<strong>${esc(item.institution||'')}</strong>`;
      return `<span class="u-text-palette-2-base">[${esc(range)}]</span> ${esc(item.degree||'')} ${item.field?`in <span style="font-style:italic;">${esc(item.field)}</span>`:''}${item.field?', ':', '}${institution}${item.location?`, ${esc(item.location)}`:''}${item.details?`<br><small>${esc(item.details)}</small>`:''}<br>`;
    }).join('');
    const resume=safeUrl(profile?.resumeUrl);
    p.innerHTML=html+(resume?`<span style="font-size:1.1rem;">Resume&nbsp; ${link(resume,'[pdf]','u-btn u-btn-round u-button-style u-palette-1-base')}</span>`:'');
  }
  function renderExperience(items){
    const p=document.querySelector('#sec-6f50 p.u-text-2');if(!p||!items.length)return;
    p.innerHTML=sortNewest(items,'startDate').map(item=>{
      const period=[item.startDate,item.endDate].filter(Boolean).join(' – ');
      const course=safeUrl(item.courseUrl)?` <span class="u-text-palette-4-base">${link(item.courseUrl,'[courses]')}</span>`:'';
      const details=[item.employmentType,item.location].filter(Boolean).join(' · ');
      return `<span class="u-text-palette-1-base">[${esc(period)}]</span> ${esc(item.position||'')} <strong>${esc(item.organization||'')}</strong>${details?` <span class="cms-subdetail">(${esc(details)})</span>`:''}${course}${item.description?`<br><small>${esc(item.description)}</small>`:''}<br><br>`;
    }).join('');
  }
  function renderMilestones(items){
    const section=document.querySelector('#sec-e57c');const legacy=section?.querySelector('#carousel-5989');if(!section||!items.length)return;
    if(legacy)legacy.style.display='none';
    let root=section.querySelector('.cms-home-timeline');if(!root){root=document.createElement('div');root.className='cms-home-timeline';legacy?legacy.after(root):section.querySelector('.u-sheet-1')?.appendChild(root);}
    root.innerHTML=sortNewest(items,'date').map(item=>`<article class="cms-timeline-card"><time>${esc(item.date||'')}</time><h3>${esc(item.title||'')}</h3>${item.description?`<p>${esc(item.description)}</p>`:''}${item.url?link(item.url,'Related link','cms-timeline-link'):''}</article>`).join('');
  }
  function renderTestScores(items){
    const row=document.querySelector('#sec-ac12 .u-layout-row');if(!row||!items.length)return;
    row.innerHTML=sortNewest(items,'date').map(item=>{
      const labels=['Listening','Reading','Writing','Speaking','Literacy','Comprehension','Conversation','Production','Verbal','Quantitative','Analytical Writing'];
      const keys=['listening','reading','writing','speaking','literacy','comprehension','conversation','production','verbal','quantitative','analyticalWriting'];
      const subs=keys.map((key,index)=>item[key]?`${labels[index]}: ${esc(item[key])}`:'').filter(Boolean).join(' · ');
      const score=item.overall?`Score: <strong>${esc(item.overall)}</strong>`:esc(item.status||'');
      return `<div class="u-container-style u-layout-cell u-size-30 cms-test-card"><div class="u-container-layout u-container-layout-1"><h2 class="u-subtitle u-text u-text-default">${esc(item.testName||'Test')}</h2><p class="u-large-text u-text u-text-default u-text-palette-2-base u-text-variant">${score}</p>${subs?`<p class="u-text cms-test-subscores">${subs}</p>`:''}${item.notes?`<p class="u-text">${esc(item.notes)}</p>`:''}${item.date?`<small>${esc(item.date)}</small>`:''}</div></div>`;
    }).join('');
  }
  function renderPublications(items){
    const legacy=Array.from(document.querySelectorAll('section#carousel_9e9a,section#carousel_e4b5,section#sec-f28c'));if(!legacy.length||!items.length)return;
    legacy.forEach(section=>section.style.display='none');
    const heading=document.querySelector('section#sec-cb3d');if(!heading)return;
    let root=document.querySelector('#cms-publications-root');if(!root){root=document.createElement('div');root.id='cms-publications-root';heading.after(root);}
    root.innerHTML=sortNewest(items,'legacyRank').map((item,index)=>{
      const links=[];
      if(item.venueUrl)links.push(link(item.venueUrl,'Journal / conference'));
      if(item.url)links.push(link(item.url,'Paper / details'));
      if(item.doi)links.push(link(item.doi.startsWith('http')?item.doi:`https://doi.org/${item.doi}`,'DOI'));
      if(item.pdfUrl)links.push(link(item.pdfUrl,'PDF'));
      if(Array.isArray(item.links))item.links.forEach(entry=>links.push(link(entry.url,entry.label||'Link')));
      const venue=[item.status,item.venue].filter(Boolean).join(' · ');
      return `<section class="u-clearfix u-grey-75 u-section-2 cms-publication"><div class="u-clearfix u-sheet u-sheet-1"><div class="u-clearfix u-expanded-width u-gutter-10 u-layout-wrap u-layout-wrap-1"><div class="u-layout"><div class="u-layout-row"><div class="u-container-style u-grey-75 u-layout-cell u-right-cell u-size-60"><div class="u-border-2 u-border-custom-color-2 u-container-layout u-container-layout-1"><blockquote class="u-align-center u-border-20 u-custom-font u-font-merriweather u-indent-0 u-text u-text-1"><b>${esc(item.year||'')}</b></blockquote><h2 class="u-align-center u-text u-text-palette-5-base u-text-2">${esc(item.title||'Untitled publication')}</h2><p class="u-align-center u-text u-text-3"><b>${esc(item.authors||'')}</b>${venue?`<br>${esc(venue)}`:''}</p>${item.abstract?`<p class="u-align-justify u-small-text u-text u-text-variant u-text-4"><span class="u-text-palette-1-base">Abstract: </span>${esc(item.abstract)}</p>`:''}<div class="cms-publication-links">${links.filter(Boolean).join(' ')}</div></div></div></div></div></div></div></section>`;
    }).join('');
  }
  function renderResearchProjects(items){
    const legacy=Array.from(document.querySelectorAll('section#sec-2d06,section#sec-8864,section#sec-8e23,section#sec-ea91'));if(!legacy.length||!items.length)return;
    legacy.forEach(section=>section.style.display='none');
    const heading=document.querySelector('section#carousel_79a3');if(!heading)return;
    let root=document.querySelector('#cms-research-projects-root');if(!root){root=document.createElement('div');root.id='cms-research-projects-root';heading.after(root);}
    root.innerHTML=sortNewest(items,'year').map(item=>{
      const links=[];
      if(item.githubUrl)links.push(link(item.githubUrl,'GitHub'));
      if(item.paperUrl)links.push(link(item.paperUrl,'Paper / details'));
      if(Array.isArray(item.links))item.links.forEach(entry=>links.push(link(entry.url,entry.label||'Link')));
      const img=safeUrl(item.imageUrl);
      return `<section class="u-clearfix u-grey-75 u-section-6 cms-research-project"><div class="u-clearfix u-sheet u-sheet-1"><div class="u-align-left u-expanded-width u-left-0 u-shape u-shape-rectangle u-shape-1"></div><div class="u-clearfix u-expanded-width-xs u-gutter-0 u-layout-custom-xs u-layout-wrap u-layout-wrap-1"><div class="u-layout"><div class="u-layout-row"><div class="u-align-center-sm u-align-left-lg u-align-left-md u-align-left-xl u-container-style u-layout-cell u-left-cell u-size-43-lg u-size-43-md u-size-43-sm u-size-43-xl u-size-60-xs u-layout-cell-1"><div class="u-border-2 u-border-white u-container-layout u-valign-top u-container-layout-1"><h3 class="u-text u-text-1">${esc(item.title||'Untitled project')}</h3>${item.description?`<p class="u-align-left-xs u-text u-text-2">${esc(item.description)}</p>`:''}${item.technologies?`<p class="u-text u-text-3"><strong>Technologies:</strong> ${esc(item.technologies)}</p>`:''}${item.role||item.year?`<p class="u-text u-text-3">${esc([item.role,item.year].filter(Boolean).join(' | '))}</p>`:''}</div></div><div class="u-align-left u-container-style u-layout-cell u-right-cell u-size-17-lg u-size-17-md u-size-17-sm u-size-17-xl u-size-60-xs u-layout-cell-2"><div class="u-border-7 u-border-white u-container-layout u-valign-middle-lg u-valign-middle-md u-valign-middle-sm u-valign-middle-xl u-container-layout-2">${img?`<img src="${esc(img)}" alt="${esc(item.title||'Project image')}" style="max-width:100%;height:auto;margin-bottom:14px;">`:''}${links.filter(Boolean).join('<br><br>')||'<span>Project details</span>'}</div></div></div></div></div></div></section>`;
    }).join('');
  }
  function renderAcademicProjects(items){
    const section=document.querySelector('#sec-640f');const sheet=section?.querySelector('.u-sheet');if(!sheet||!items.length)return;
    const original=sheet.querySelector('p.u-text-2');if(original)original.style.display='none';
    const heading=sheet.querySelector('h1');
    let root=sheet.querySelector('.cms-academic-projects-root');if(!root){root=document.createElement('div');root.className='cms-academic-projects-root';heading?heading.after(root):sheet.appendChild(root);}
    root.innerHTML=sortNewest(items,'year').map(item=>{
      const links=(Array.isArray(item.links)?item.links:[]).map(entry=>link(entry.url,`[${entry.label||'Link'}]`)).filter(Boolean).join(' ');
      const meta=[item.course,item.technologies,item.year].filter(Boolean).join(' | ');
      return `<article class="cms-academic-project"><div class="cms-academic-meta">${esc(meta)}</div><h3>${esc(item.title||'Untitled project')}</h3>${item.description?`<p>${esc(item.description)}</p>`:''}${links?`<div class="cms-academic-links">${links}</div>`:''}</article>`;
    }).join('');
  }


  function renderTeachingCourses(items){
    if(!items.length)return;
    const uuHeading=document.querySelector('#sec-0347');
    const shaheenHeading=document.querySelector('#sec-5421');
    const legacyUU=document.querySelector('#sec-160e');
    const legacyShaheen=document.querySelector('#sec-096b');
    if(legacyUU)legacyUU.style.display='none';
    if(legacyShaheen)legacyShaheen.style.display='none';
    const renderInstitution=(heading, institution)=>{
      if(!heading)return;
      const subset=items.filter(x=>String(x.institution||'').toLowerCase()===institution.toLowerCase());
      let root=heading.nextElementSibling;
      if(!root||!root.classList.contains('cms-teaching-root')){root=document.createElement('section');root.className='cms-teaching-root u-clearfix u-grey-75';heading.after(root);}
      const groups=new Map();
      sortNewest(subset,'year').forEach(item=>{const key=item.term||item.year||'Courses';if(!groups.has(key))groups.set(key,[]);groups.get(key).push(item);});
      root.innerHTML=Array.from(groups.entries()).map(([term,courses])=>`<div class="cms-course-period"><h3>${esc(term)}</h3><ul>${courses.map(course=>`<li>${course.courseCode?`<strong>${esc(course.courseCode)}:</strong> `:''}${esc(course.courseTitle||'')}${course.details?`<small>${esc(course.details)}</small>`:''}</li>`).join('')}</ul></div>`).join('');
    };
    renderInstitution(uuHeading,'Uttara University');
    renderInstitution(shaheenHeading,'Shaheen Cadet School and College');
  }
  function renderCertifications(items){
    const section=document.querySelector('#sec-2891');if(!section||!items.length)return;
    const oldList=section.querySelector('ul.u-text-1');if(oldList)oldList.style.display='none';
    const oldGallery=section.querySelector('.colorlib-blog');if(oldGallery)oldGallery.style.display='none';
    const intro=section.querySelector('#carousel_d71a');
    let root=section.querySelector('.cms-certifications-root');
    if(!root){root=document.createElement('div');root.className='cms-certifications-root';(intro||section.querySelector('.u-sheet-1')||section).after(root);}
    root.innerHTML=sortNewest(items,'date').map(item=>{
      const image=safeUrl(item.imageUrl);
      const links=[];
      if(item.url)links.push(link(item.url,'Certificate / course'));
      (Array.isArray(item.links)?item.links:[]).forEach(x=>links.push(link(x.url,x.label||'Link')));
      const date=item.displayDate||item.date||'';
      return `<article class="cms-certificate-card">${image?`<a href="${esc(image)}" target="_blank" rel="noopener"><img src="${esc(image)}" alt="${esc(item.title||'Certificate')}" loading="lazy"></a>`:''}<div class="cms-certificate-body"><h3>${esc(item.title||'Certificate')}</h3><p class="cms-certificate-meta">${esc([date,item.category].filter(Boolean).join(' · '))}</p>${item.description?`<p>${esc(item.description)}</p>`:''}<div class="cms-card-links">${links.filter(Boolean).join(' ')}</div></div></article>`;
    }).join('');
  }
  function renderLeadership(items){
    const section=document.querySelector('#carousel_be25');if(!section||!items.length)return;
    const legacy=section.querySelector('.u-layout-grid');if(legacy)legacy.style.display='none';
    const sheet=section.querySelector('.u-sheet-1')||section;
    let root=sheet.querySelector('.cms-leadership-root');if(!root){root=document.createElement('div');root.className='cms-activity-grid cms-leadership-root';sheet.appendChild(root);}
    root.innerHTML=sortNewest(items,'startDate').map(item=>{
      const links=(Array.isArray(item.links)?item.links:[]).map(x=>link(x.url,x.label||'Related link')).filter(Boolean).join(' ');
      const period=[item.startDate,item.endDate].filter(Boolean).join(' – ');
      return `<article class="cms-activity-card"><div class="cms-activity-meta">${esc([period,item.organization].filter(Boolean).join(' · '))}</div><h3>${esc(item.title||'Leadership activity')}</h3>${item.description?`<p>${esc(item.description)}</p>`:''}<div class="cms-card-links">${links}</div></article>`;
    }).join('');
  }
  function renderShowcases(items){
    const section=document.querySelector('#carousel_webdev');if(!section||!items.length)return;
    const legacy=section.querySelector('.u-layout-grid');if(legacy)legacy.style.display='none';
    const sheet=section.querySelector('.u-sheet-1')||section;
    let root=sheet.querySelector('.cms-showcase-root');if(!root){root=document.createElement('div');root.className='cms-activity-grid cms-showcase-root';sheet.appendChild(root);}
    root.innerHTML=sortNewest(items,'').map(item=>{
      const links=[];if(item.url)links.push(link(item.url,'Open project'));(Array.isArray(item.links)?item.links:[]).forEach(x=>links.push(link(x.url,x.label||'Link')));
      return `<article class="cms-activity-card"><div class="cms-activity-meta">${esc(item.category||'')}</div><h3>${esc(item.title||'Showcase item')}</h3>${item.description?`<p>${esc(item.description)}</p>`:''}<div class="cms-card-links">${links.filter(Boolean).join(' ')}</div></article>`;
    }).join('');
  }
  function renderAchievements(items){
    const section=document.querySelector('#sec-1d5f');if(!section||!items.length)return;
    const legacy=section.querySelector('.u-group');if(legacy)legacy.style.display='none';
    const sheet=section.querySelector('.u-sheet-1')||section;
    let root=sheet.querySelector('.cms-achievements-root');if(!root){root=document.createElement('div');root.className='cms-activity-grid cms-achievements-root';sheet.appendChild(root);}
    root.innerHTML=sortNewest(items,'date').map(item=>{
      const links=(Array.isArray(item.links)?item.links:[]).map(x=>link(x.url,x.label||'Related link')).filter(Boolean).join(' ');
      return `<article class="cms-activity-card"><div class="cms-activity-meta">${esc([item.date,item.category].filter(Boolean).join(' · '))}</div><h3>${esc(item.title||'Achievement')}</h3>${item.description?`<p>${esc(item.description)}</p>`:''}<div class="cms-card-links">${links}</div></article>`;
    }).join('');
  }

  Promise.all([
    load('home-profile.json'),load('education.json'),load('experience.json'),load('milestones.json'),load('test-scores.json'),
    load('publications.json'),load('research-projects.json'),load('academic-projects.json'),
    load('teaching-courses.json'),load('certifications.json'),load('leadership.json'),load('achievements.json'),load('showcases.json')
  ]).then(([profile,education,experience,milestones,testScores,publications,researchProjects,academicProjects,teachingCourses,certifications,leadership,achievements,showcases])=>{
    renderProfile(profile[0]);
    renderEducation(education,profile[0]);
    renderExperience(experience);
    renderMilestones(milestones);
    renderTestScores(testScores);
    renderPublications(publications);
    renderResearchProjects(researchProjects);
    renderAcademicProjects(academicProjects);
    renderTeachingCourses(teachingCourses);
    renderCertifications(certifications);
    renderLeadership(leadership);
    renderAchievements(achievements);
    renderShowcases(showcases);
  });
})();
