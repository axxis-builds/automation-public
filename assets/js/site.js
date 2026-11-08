// Progressive enhancement only: every page is complete without this script.

(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Viewfinder timecode (HH:MM:SS:FF at 24 fps)
  const timecode = document.querySelector('[data-timecode]');
  if (timecode) {
    const FPS = 24;
    const offsetFrames = 12 * FPS; // start at 00:00:12:00
    const started = performance.now();
    const pad = (n) => String(n).padStart(2, '0');
    const render = (frames) => {
      const ff = frames % FPS;
      const totalSeconds = Math.floor(frames / FPS);
      timecode.textContent = `${pad(Math.floor(totalSeconds / 3600))}:${pad(Math.floor(totalSeconds / 60) % 60)}:${pad(totalSeconds % 60)}:${pad(ff)}`;
    };
    if (reducedMotion) {
      render(offsetFrames);
    } else {
      const tick = (now) => {
        render(offsetFrames + Math.floor(((now - started) / 1000) * FPS));
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }

  // Reveal sections as they scroll into view
  const revealables = document.querySelectorAll('.on-scroll');
  if (revealables.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    revealables.forEach((el) => observer.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add('is-visible'));
  }

  // Table of contents: highlight the section being read
  const tocLinks = [...document.querySelectorAll('.toc a[href^="#"]')];
  if (tocLinks.length && 'IntersectionObserver' in window) {
    const byId = new Map(tocLinks.map((link) => [link.hash.slice(1), link]));
    const setActive = (id) => {
      tocLinks.forEach((link) => link.classList.toggle('is-active', link.hash === `#${id}`));
    };
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -70% 0px' },
    );
    byId.forEach((_, id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  // Current year in the footer
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
})();
