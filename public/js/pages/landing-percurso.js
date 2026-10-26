/* Native-scroll storytelling: sticky stage, horizontal track, vertical fallback. */
(() => {
  'use strict';
  const section = document.getElementById('como-funciona');
  const stage = section?.querySelector('.journey-stage');
  const track = document.getElementById('journeyTrack');
  if (!section || !stage || !track) return;
  const panels = [...track.children];
  const dots = [...section.querySelectorAll('[data-step]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 1000px) and (min-height: 650px)');
  const off = () => reduced.matches || document.body.classList.contains('motion-off');
  let horizontal = false, width = 0, distance = 0, origin = 0, raf = 0, active = -1, disposed = false;
  document.body.classList.add('scroll-story');

  function select(index) {
    if (active === index) return;
    active = index;
    dots.forEach((dot, i) => {
      if (i === index) dot.setAttribute('aria-current', 'step');
      else dot.removeAttribute('aria-current');
    });
  }
  function render() {
    raf = 0;
    if (!horizontal || disposed) return;
    const passed = Math.max(0, Math.min(distance, scrollY - origin));
    track.style.transform = `translate3d(${-passed}px,0,0)`;
    section.style.setProperty('--journey-progress', String(passed / distance));
    select(Math.min(panels.length - 1, Math.round(passed / width)));
  }
  function schedule() { if (!raf && horizontal && !document.hidden) raf = requestAnimationFrame(render); }
  function measure() {
    const wasHorizontal = horizontal;
    const previousOrigin = origin, previousDistance = distance;
    const previousY = scrollY;
    const wasInside = wasHorizontal && previousY >= previousOrigin && previousY <= previousOrigin + previousDistance;
    horizontal = desktop.matches && !off();
    section.classList.toggle('is-horizontal', horizontal);
    if (horizontal) {
      const height = Math.min(innerHeight - 120, 790);
      section.style.setProperty('--journey-height', `${height}px`);
      width = section.querySelector('.journey-window').clientWidth;
      distance = width * (panels.length - 1);
      section.style.setProperty('--journey-total', `${height + distance}px`);
      origin = section.getBoundingClientRect().top + scrollY - 100;
      render();
    } else {
      track.style.removeProperty('transform');
      section.style.removeProperty('--journey-total');
      section.style.removeProperty('--journey-progress');
      select(0);
      // Switching preference/viewport while pinned must not jump past later content.
      if (wasInside) {
        const index = Math.min(panels.length - 1, Math.round((previousY - previousOrigin) / (previousDistance / (panels.length - 1))));
        scrollTo({top: panels[index].getBoundingClientRect().top + scrollY - 115, behavior: 'instant'});
      }
    }
  }
  function go(index) {
    if (horizontal) {
      scrollTo({top: origin + width * index, behavior: off() ? 'instant' : 'smooth'});
    } else panels[index].scrollIntoView({block:'center', behavior: off() ? 'instant' : 'smooth'});
  }
  dots.forEach((dot, i) => dot.addEventListener('click', () => go(i)));
  track.addEventListener('focusin', event => {
    if (!horizontal) return;
    const index = panels.findIndex(panel => panel.contains(event.target));
    if (index < 0) return;
    // Native keyboard access to a planet brings its entire step into view.
    scrollTo({top: origin + width * index, behavior:'instant'});
  });
  section.querySelector('.journey-controls').addEventListener('keydown', event => {
    const index = dots.indexOf(document.activeElement);
    if (index < 0) return;
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % dots.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + dots.length) % dots.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = dots.length - 1;
    if (next === undefined) return;
    event.preventDefault(); dots[next].focus(); go(next);
  });

  const scenes = [...document.querySelectorAll('.paint-scene,.about-section,.contact-section')];
  scenes[0]?.classList.add('scene-enter');
  let observer;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('scene-shown'); observer.unobserve(entry.target);
    }), {threshold:.12});
    scenes.forEach(scene => observer.observe(scene));
  } else scenes.forEach(scene => scene.classList.add('scene-shown'));

  // Assets above the stage may change its origin while loading.
  const resize = new ResizeObserver(measure);
  resize.observe(document.querySelector('.hero'));
  resize.observe(document.querySelector('.style-section'));
  window.addEventListener('resize', measure, {passive:true});
  window.addEventListener('scroll', schedule, {passive:true});
  document.addEventListener('landing:motion', measure);
  document.addEventListener('landing:layout', measure);
  window.addEventListener('load', measure, {once:true});
  document.addEventListener('visibilitychange', () => { if (!document.hidden) schedule(); });
  reduced.addEventListener('change', measure);
  desktop.addEventListener('change', measure);
  document.fonts.ready.then(measure);
  measure();
  window.addEventListener('pagehide', event => {
    if (event.persisted) return;
    disposed = true; cancelAnimationFrame(raf); resize.disconnect(); observer?.disconnect();
  });
})();
