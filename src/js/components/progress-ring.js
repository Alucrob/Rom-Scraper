/* ═══════════════════════════════════════════════════
   PROGRESS RING — Circular indeterminate/determinate
   ═══════════════════════════════════════════════════ */

function createProgressRing(size = 48, strokeWidth = 3) {
  const r = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * r;

  const wrap = document.createElement('div');
  wrap.className = 'progress-ring indeterminate';
  wrap.style.width = size + 'px';
  wrap.style.height = size + 'px';

  wrap.innerHTML = `
    <svg viewBox="0 0 ${size} ${size}">
      <circle class="progress-ring-track" cx="${size/2}" cy="${size/2}" r="${r}"/>
      <circle class="progress-ring-fill" cx="${size/2}" cy="${size/2}" r="${r}"
              style="stroke-dasharray:${circumference};stroke-dashoffset:${circumference}"/>
    </svg>`;

  return {
    el: wrap,
    setProgress(pct) {
      wrap.classList.remove('indeterminate');
      const fill = wrap.querySelector('.progress-ring-fill');
      const offset = circumference - (pct / 100) * circumference;
      fill.style.strokeDasharray = circumference;
      fill.style.strokeDashoffset = offset;
    },
    setIndeterminate() {
      wrap.classList.add('indeterminate');
    },
  };
}

window.ProgressRing = { create: createProgressRing };
