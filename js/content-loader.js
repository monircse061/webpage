/* Adds dashboard-managed content while preserving the original Nicepage content. */
(function () {
  'use strict';
  const DATA_BASE = 'data/';
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[ch]);
  const safeUrl = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return '';
    try {
      const url = new URL(raw, window.location.href);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch (_) { return ''; }
  };
  const link = (url, label, cls) => {
    const href = safeUrl(url);
    return href ? `<a${cls ? ` class="${cls}"` : ''} href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>` : '';
  };
  async function load(file) {
    try {
      const response = await fetch(`${DATA_BASE}${file}`, { cache: 'no-store' });
      if (!response.ok) return [];
      const json = await response.json();
      return Array.isArray(json) ? json : [];
    } catch (error) {
      console.warn(`Could not load ${file}`, error);
      return [];
    }
  }
  function renderPublications(items) {
    const existing = Array.from(document.querySelectorAll('section#carousel_9e9a'));
    if (!existing.length || !items.length) return;
    let anchor = existing[existing.length - 1];
    items.forEach((item, index) => {
      const section = document.createElement('section');
      section.className = 'u-clearfix u-grey-75 u-section-2 cms-publication';
      section.dataset.cmsId = item.id || `publication-${index}`;
      const status = item.status ? `<br><strong>${esc(item.status)}</strong>` : '';
      const doi = item.doi ? link(item.doi.startsWith('http') ? item.doi : `https://doi.org/${item.doi}`, 'DOI') : '';
      const pdf = link(item.pdfUrl || item.url, 'Paper / PDF');
      const venueLink = link(item.venueUrl, item.venue || 'Journal / Conference');
      section.innerHTML = `
        <div class="u-clearfix u-sheet u-sheet-1">
          <div class="u-clearfix u-expanded-width u-gutter-10 u-layout-wrap u-layout-wrap-1">
            <div class="u-layout"><div class="u-layout-row">
              <div class="u-container-style u-grey-75 u-layout-cell u-right-cell u-size-60 u-layout-cell-1">
                <div class="u-border-2 u-border-custom-color-2 u-container-layout u-container-layout-1">
                  <blockquote class="u-align-center u-border-20 u-custom-font u-font-merriweather u-indent-0 u-text u-text-1"><b>${esc(item.year || '')}</b></blockquote>
                  <h2 class="u-align-center u-text u-text-palette-5-base u-text-2">${esc(item.title || 'Untitled publication')}</h2>
                  <p class="u-align-center u-text u-text-3"><b>${esc(item.authors || '')}</b>${status}<br>${venueLink}</p>
                  ${item.abstract ? `<p class="u-align-justify u-small-text u-text u-text-variant u-text-4"><span class="u-text-palette-1-base">Abstract: </span>${esc(item.abstract)}</p>` : ''}
                  <div class="cms-publication-links">${doi} ${pdf}</div>
                </div>
              </div>
            </div></div>
          </div>
        </div>`;
      anchor.after(section);
      anchor = section;
    });
  }
  function renderResearchProjects(items) {
    const existing = Array.from(document.querySelectorAll('section#sec-2d06, section#sec-8864, section#sec-ea91'));
    if (!existing.length || !items.length) return;
    let anchor = existing[existing.length - 1];
    items.forEach((item, index) => {
      const section = document.createElement('section');
      section.className = 'u-clearfix u-grey-75 u-section-6 cms-research-project';
      section.dataset.cmsId = item.id || `research-project-${index}`;
      const projectLinks = [link(item.githubUrl, 'GitHub'), link(item.paperUrl, 'Paper / Details')].filter(Boolean).join('<br><br>');
      const image = safeUrl(item.imageUrl);
      const technologies = item.technologies ? `<p class="u-text u-text-3"><strong>Technologies:</strong> ${esc(item.technologies)}</p>` : '';
      section.innerHTML = `
        <div class="u-clearfix u-sheet u-sheet-1">
          <div class="u-align-left u-expanded-width u-left-0 u-shape u-shape-rectangle u-shape-1"></div>
          <div class="u-clearfix u-expanded-width-xs u-gutter-0 u-layout-custom-xs u-layout-wrap u-layout-wrap-1">
            <div class="u-layout"><div class="u-layout-row">
              <div class="u-align-center-sm u-align-left-lg u-align-left-md u-align-left-xl u-container-style u-layout-cell u-left-cell u-size-43-lg u-size-43-md u-size-43-sm u-size-43-xl u-size-60-xs u-layout-cell-1">
                <div class="u-border-2 u-border-white u-container-layout u-valign-top u-container-layout-1">
                  <h3 class="u-text u-text-1">${esc(item.title || 'Untitled project')}</h3>
                  ${item.description ? `<p class="u-align-left-xs u-text u-text-2">${esc(item.description)}</p>` : ''}
                  ${technologies}
                  ${item.year || item.role ? `<p class="u-text u-text-3">${esc([item.role, item.year].filter(Boolean).join(' | '))}</p>` : ''}
                </div>
              </div>
              <div class="u-align-left u-container-style u-layout-cell u-right-cell u-size-17-lg u-size-17-md u-size-17-sm u-size-17-xl u-size-60-xs u-layout-cell-2">
                <div class="u-border-7 u-border-white u-container-layout u-valign-middle-lg u-valign-middle-md u-valign-middle-sm u-valign-middle-xl u-container-layout-2">
                  ${image ? `<img src="${esc(image)}" alt="${esc(item.title || 'Project image')}" style="max-width:100%;height:auto;margin-bottom:14px;">` : ''}
                  ${projectLinks || '<span>Project details</span>'}
                </div>
              </div>
            </div></div>
          </div>
        </div>`;
      anchor.after(section);
      anchor = section;
    });
  }
  function renderAcademicProjects(items) {
    const sheet = document.querySelector('#sec-640f .u-sheet');
    if (!sheet || !items.length) return;
    const marker = sheet.querySelector('.cms-academic-projects-marker') || (() => {
      const node = document.createElement('div');
      node.className = 'cms-academic-projects-marker';
      sheet.appendChild(node);
      return node;
    })();
    items.forEach((item, index) => {
      const article = document.createElement('article');
      article.className = 'cms-academic-project u-text u-text-2';
      article.dataset.cmsId = item.id || `academic-project-${index}`;
      const links = (Array.isArray(item.links) ? item.links : []).map((entry) => link(entry.url, `[${entry.label || 'Link'}]`)).filter(Boolean).join(' ');
      article.innerHTML = `<br><br><span class="u-file-icon u-icon"><img alt="" src="images/2672101.png"></span> ${esc(item.course || item.level || 'Academic Project')}${item.technologies ? ` | <span class="u-text-palette-1-base">${esc(item.technologies)}</span>` : ''}<br><b><span style="text-transform:uppercase;background-color:#cce5ff;padding:2px 4px;border-radius:4px">${esc(item.title || 'Untitled project')}</span> ${links}</b>${item.description ? `<p>${esc(item.description)}</p>` : ''}`;
      marker.before(article);
    });
  }
  Promise.all([load('publications.json'), load('research-projects.json'), load('academic-projects.json')])
    .then(([publications, researchProjects, academicProjects]) => {
      if (document.querySelector('section#carousel_9e9a')) renderPublications(publications);
      if (document.querySelector('section#sec-2d06, section#sec-8864, section#sec-ea91')) renderResearchProjects(researchProjects);
      if (document.querySelector('#sec-640f')) renderAcademicProjects(academicProjects);
    });
})();
