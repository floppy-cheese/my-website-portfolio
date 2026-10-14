// ============================================
//  PORTFOLIO — MAIN.JS
// ============================================
document.addEventListener('DOMContentLoaded', () => {

  // ---- ACTIVE NAV ON SCROLL ----
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
        });
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => observer.observe(s));

  // ---- MOBILE NAV TOGGLE ----
  const toggle = document.querySelector('.nav-toggle');
  const navLinksEl = document.querySelector('.nav-links');
  toggle.addEventListener('click', () => {
    navLinksEl.classList.toggle('open');
    const bars = toggle.querySelectorAll('span');
    const isOpen = navLinksEl.classList.contains('open');
    bars[0].style.transform = isOpen ? 'rotate(45deg) translate(4px, 4px)' : '';
    bars[1].style.opacity   = isOpen ? '0' : '1';
    bars[2].style.transform = isOpen ? 'rotate(-45deg) translate(4px, -4px)' : '';
  });

  // Close mobile nav on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinksEl.classList.remove('open');
      toggle.querySelectorAll('span').forEach(b => {
        b.style.transform = '';
        b.style.opacity = '1';
      });
    });
  });

  // ---- SCROLL REVEAL ----
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => revealObserver.observe(el));

  // ---- STAGGER REVEAL FOR GRIDS ----
  document.querySelectorAll('.project-card.reveal').forEach((card, i) => {
    card.style.transitionDelay = (i * 0.08) + 's';
  });

  // ---- PROJECT OVERLAY (AJAX) ----
  const overlay   = document.getElementById('project-overlay');
  const backdrop  = document.getElementById('overlay-backdrop');
  const closeBtn  = document.getElementById('overlay-close');
  const contentEl = document.getElementById('overlay-content');

  const loadingHTML = `
    <div class="overlay-loading">
      <span class="loading-dot"></span>
      <span class="loading-dot"></span>
      <span class="loading-dot"></span>
    </div>`;

  function openOverlay(projectPath) {
    contentEl.innerHTML = loadingHTML;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';

    fetch(projectPath)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.text();
      })
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const projectMain = doc.querySelector('.project-page') || doc.querySelector('main') || doc.body;
        contentEl.innerHTML = projectMain.innerHTML;
        contentEl.querySelectorAll('video').forEach(v => v.load());
      })
      .catch(() => {
        contentEl.innerHTML = `
          <div style="text-align:center; padding: 4rem 2rem;">
            <p style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--muted); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 1rem;">// coming soon</p>
            <h2 style="font-family: var(--font-display); font-size: 2rem; text-transform: uppercase; color: var(--accent-tag);">Page Not Ready Yet</h2>
            <p style="margin-top: 1rem; color: var(--muted); font-size: 0.9rem;">This project page is still being built.</p>
          </div>`;
      });
  }

  function closeOverlay() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => { contentEl.innerHTML = loadingHTML; }, 450);
  }

  // Attach to project-link buttons that have data-project
  document.querySelectorAll('.project-link[data-project]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openOverlay(btn.dataset.project);
    });
  });

  closeBtn?.addEventListener('click', closeOverlay);
  backdrop?.addEventListener('click', closeOverlay);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeOverlay();
  });

});