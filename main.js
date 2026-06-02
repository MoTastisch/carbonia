// ---- Config ----
async function loadConfigs() {
  const [p, d, l] = await Promise.all([
    fetch('data/projects.json').then(r => r.json()),
    fetch('data/downloads.json').then(r => r.json()),
    fetch('data/links.json').then(r => r.json()),
  ]);
  return { projects: p, downloads: d, links: l };
}

// ---- Render projects ----
function renderProjects(data) {
  document.getElementById('projectTable').innerHTML = data.items.map(p => `
    <a href="#" class="table-row table-item">
      <span class="proj-name">${p.name}</span>
      <span><span class="badge badge-${p.statusType}">${p.status}</span></span>
      <span class="proj-phase">${p.phase}</span>
      <span class="proj-date">${p.updated}</span>
    </a>
  `).join('');
}

// ---- Render downloads ----
function renderDownloads(data) {
  document.getElementById('templateGrid').innerHTML = data.items.map(d => `
    <div class="template-card" data-category="${d.category}">
      <div class="tmpl-icon">${d.icon}</div>
      <div class="tmpl-info">
        <div class="tmpl-name">${d.name}</div>
        <div class="tmpl-meta">${d.meta}</div>
      </div>
      <a href="${d.file}" download class="btn btn-sm">Download</a>
    </div>
  `).join('');
}

// ---- Render links ----
function renderLinks(data) {
  document.getElementById('linkGrid').innerHTML = data.items.map(l => `
    <a href="${l.url}" target="_blank" rel="noopener" class="link-card">
      <div class="lnk-icon">${l.icon}</div>
      <div class="lnk-info">
        <div class="lnk-name">${l.name}</div>
        <div class="lnk-label">${l.label}</div>
      </div>
    </a>
  `).join('');
}

// ---- Counters + terminal ----
function updateCounters(projects, downloads, links) {
  const activeProjects = projects.items.filter(p => p.statusType !== 'gray').length;

  document.getElementById('terminal-projects').textContent = `${activeProjects} aktiv`;
  document.getElementById('terminal-downloads').textContent = `${downloads.items.length} verfügbar`;
  document.getElementById('downloads-count').textContent = `${downloads.items.length} Dateien`;
  document.getElementById('links-count').textContent = `${links.items.length} Links`;
  document.getElementById('count-projects').textContent = projects.items.length;
  document.getElementById('count-downloads').textContent = downloads.items.length;
  document.getElementById('count-links').textContent = links.items.length;
}

// ---- Last updated + year ----
function updateMeta(projects, downloads, links) {
  const dates = [projects.lastUpdated, downloads.lastUpdated, links.lastUpdated].sort();
  const latest = new Date(dates[dates.length - 1]);
  const formatted = latest.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
  document.getElementById('terminal-updated').textContent = formatted;
  document.getElementById('footer-year').textContent = new Date().getFullYear();
}

// ---- Download filters ----
function initFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      document.querySelectorAll('#templateGrid .template-card').forEach(card => {
        card.style.display = filter === 'all' || card.dataset.category === filter ? '' : 'none';
      });
    });
  });
}

// ---- Nav scroll active ----
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.style.color = link.getAttribute('href') === `#${id}` ? 'var(--text)' : '';
        });
      }
    });
  }, { threshold: 0.3 });
  sections.forEach(s => observer.observe(s));
}

// ---- Mobile nav ----
function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', false);
    });
  });
}

// ---- Init ----
(async () => {
  try {
    const { projects, downloads, links } = await loadConfigs();
    renderProjects(projects);
    renderDownloads(downloads);
    renderLinks(links);
    updateCounters(projects, downloads, links);
    updateMeta(projects, downloads, links);
    initFilters();
    initScrollSpy();
    initMobileNav();
  } catch (e) {
    console.error('Config load failed:', e);
  }
})();
