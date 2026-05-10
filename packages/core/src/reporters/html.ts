import process from 'node:process';
import type { AnalysisResult, CarbonScore, FileResult, Violation } from '../types.js';

// ─── Sorting ──────────────────────────────────────────────────────────────────

const SEVERITY_RANK: Record<Violation['severity'], number> = { error: 0, warn: 1, info: 2 };
const IMPACT_RANK: Record<Violation['energyImpact'], number> = { high: 0, medium: 1, low: 2 };

function sortViolations(violations: Violation[]): Violation[] {
  return [...violations].sort((a, b) =>
    SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] ||
    IMPACT_RANK[a.energyImpact] - IMPACT_RANK[b.energyImpact],
  );
}

function worstSeverityRank(file: FileResult): number {
  return Math.min(...file.violations.map(v => SEVERITY_RANK[v.severity]));
}

function sortFiles(files: FileResult[]): FileResult[] {
  return [...files].sort((a, b) => {
    const rankDiff = worstSeverityRank(a) - worstSeverityRank(b);
    if (rankDiff !== 0) return rankDiff;
    return b.violations.filter(v => v.severity === 'error').length -
           a.violations.filter(v => v.severity === 'error').length ||
           b.violations.length - a.violations.length;
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function gradeClass(grade: CarbonScore['grade']): string {
  return 'grade-' + grade.replace('+', 'plus').toLowerCase();
}

function scoreHex(score: number): string {
  if (score >= 85) return '#22c55e';
  if (score >= 70) return '#facc15';
  if (score >= 55) return '#fb923c';
  return '#f87171';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function violationRow(v: Violation, filePath: string): string {
  const shortPath = esc(filePath.replace(process.cwd(), '.'));
  const sevClass = `vtag-${v.severity === 'warn' ? 'warn' : v.severity}`;
  const impClass = `vtag-${v.energyImpact}`;
  const dotClass = `dot dot-${v.severity === 'warn' ? 'warn' : v.severity}`;

  return `
        <div class="vrow">
          <div class="vrow-top">
            <span class="${dotClass}"></span>
            <span class="vtag ${sevClass}">${v.severity === 'error' ? 'Error' : v.severity === 'warn' ? 'Warning' : 'Info'}</span>
            <span class="vtag ${impClass}">${v.energyImpact.charAt(0).toUpperCase() + v.energyImpact.slice(1)} impact</span>
            <code class="vloc">${shortPath}:${v.line}</code>
            <code class="vrule">${esc(v.ruleId)}</code>
            ${v.estimatedSavingKb ? `<span class="vsaving">💾 ~${v.estimatedSavingKb}KB saved</span>` : ''}
          </div>
          <p class="vmsg">${esc(v.message)}</p>
          ${v.suggestion ? `<p class="vsug">→ ${esc(v.suggestion)}</p>` : ''}
        </div>`;
}

function fileCard(file: FileResult, isFirst: boolean): string {
  if (file.violations.length === 0) return '';
  const shortPath = esc(file.filePath.replace(process.cwd(), '.'));
  const sorted = sortViolations(file.violations);
  const errors = file.violations.filter(v => v.severity === 'error').length;
  const warns  = file.violations.filter(v => v.severity === 'warn').length;
  const infos  = file.violations.filter(v => v.severity === 'info').length;

  const chips = [
    errors ? `<span class="chip chip-e">${errors} error${errors !== 1 ? 's' : ''}</span>` : '',
    warns  ? `<span class="chip chip-w">${warns} warning${warns !== 1 ? 's' : ''}</span>` : '',
    infos  ? `<span class="chip chip-i">${infos} info</span>` : '',
  ].filter(Boolean).join('');

  return `
      <details class="fcard"${isFirst ? ' open' : ''}>
        <summary class="fcard-head">
          <svg class="chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          <svg class="file-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <code class="fpath">${shortPath}</code>
          <div class="fchips">${chips}</div>
        </summary>
        <div class="fcard-body">
          ${sorted.map(v => violationRow(v, file.filePath)).join('')}
        </div>
      </details>`;
}

function pillarBar(label: string, rawScore: number, weight: string, pillarId: string): string {
  const score = Math.round(Math.min(100, Math.max(0, rawScore)));
  const color = scoreHex(score);
  const iconChar  = score >= 90 ? '✓' : score < 70 ? '!' : '~';
  const iconClass = score >= 90 ? 'picon picon-good' : score < 70 ? 'picon picon-warn' : 'picon picon-ok';
  return `
        <div class="prow" id="${pillarId}" style="--bar-color:${color};--bar-width:${score}%">
          <div class="prow-left">
            <span class="${iconClass}">${iconChar}</span>
            <span class="plabel">${label}</span>
          </div>
          <div class="pbar-wrap">
            <div class="pbar-fill"></div>
          </div>
          <div class="prow-right">
            <span class="pscore">${score}</span>
            <span class="pweight">${weight}</span>
          </div>
        </div>`;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function htmlReport(result: AnalysisResult): string {
  const { score, summary, files } = result;
  const gc = (() => {
    const m: Record<string, string> = { 'A+': '#22c55e', A: '#86efac', B: '#facc15', C: '#fb923c', D: '#f87171', F: '#ef4444' };
    return m[score.grade] ?? '#94a3b8';
  })();

  const filesWithViolations = files.filter(f => f.violations.length > 0);
  const totalViolations = summary.errorCount + summary.warningCount + summary.infoCount;
  const analyzedAt = new Date(summary.analyzedAt).toLocaleString();

  const gradeRows = [
    { grade: 'A+' as const, range: '95 – 100', desc: 'Exemplary',  note: 'Industry best practice' },
    { grade: 'A'  as const, range: '85 – 94',  desc: 'Excellent',  note: 'Minor improvements possible' },
    { grade: 'B'  as const, range: '70 – 84',  desc: 'Good',       note: 'Some inefficiencies to address' },
    { grade: 'C'  as const, range: '55 – 69',  desc: 'Fair',       note: 'Several high-impact issues' },
    { grade: 'D'  as const, range: '40 – 54',  desc: 'Poor',       note: 'Significant work needed' },
    { grade: 'F'  as const, range: '0 – 39',   desc: 'Critical',   note: 'Major inefficiencies throughout' },
  ].map(r => {
    const isCurrent = r.grade === score.grade;
    const gc = gradeClass(r.grade);
    return `
          <div class="grade-row${isCurrent ? ` grade-current grade-current-${gc}` : ''}">
            <span class="grade-letter ${gc}">${r.grade}</span>
            <span class="grade-range">${r.range}</span>
            <span class="grade-desc">${r.desc}</span>
            <span class="grade-note">${r.note}</span>
            ${isCurrent ? `<span class="grade-you ${gc}-you">← you</span>` : ''}
          </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>eco-linter Report</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:      #09090b;
      --surface: #18181b;
      --border:  #27272a;
      --muted:   #3f3f46;
      --text:    #e4e4e7;
      --subtle:  #71717a;
      --radius:  10px;
      --gc:      ${gc};
    }

    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--bg); color: var(--text); font-size: 14px; line-height: 1.6; min-height: 100vh; }

    /* ── Layout ── */
    .wrap { max-width: 860px; margin: 0 auto; padding: 48px 24px 80px; }

    /* ── Header ── */
    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 48px; }
    .header-brand { display: flex; align-items: center; gap: 10px; }
    .header-brand svg { opacity: .7; }
    .header-brand span { font-size: 13px; font-weight: 600; color: var(--subtle); letter-spacing: .03em; text-transform: uppercase; }
    .header-meta { font-size: 12px; color: var(--subtle); }

    /* ── Hero ── */
    .hero { display: grid; grid-template-columns: auto 1fr; gap: 40px; align-items: center; background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 36px 40px; margin-bottom: 32px; }
    .hero-score { text-align: center; }
    .score-ring {
      width: 120px; height: 120px; border-radius: 50%;
      border: 3px solid var(--gc);
      box-shadow: 0 0 0 6px color-mix(in srgb, var(--gc) 9%, transparent), 0 0 40px color-mix(in srgb, var(--gc) 15%, transparent);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      margin: 0 auto 16px;
    }
    .score-num { font-size: 42px; font-weight: 800; color: var(--gc); line-height: 1; letter-spacing: -2px; }
    .score-denom { font-size: 12px; color: var(--subtle); margin-top: 2px; }
    .grade-pill { display: inline-flex; align-items: center; padding: 5px 16px; border-radius: 999px; border: 1px solid color-mix(in srgb, var(--gc) 26%, transparent); background: color-mix(in srgb, var(--gc) 7%, transparent); color: var(--gc); font-size: 13px; font-weight: 700; }
    .hero-stats h2 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
    .hero-stats .sub { color: var(--subtle); font-size: 13px; margin-bottom: 24px; }
    .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; }
    .stat-card { background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 16px; }
    .stat-val { font-size: 20px; font-weight: 700; line-height: 1; margin-bottom: 4px; }
    .stat-key { font-size: 11px; color: var(--subtle); text-transform: uppercase; letter-spacing: .05em; }
    .stat-co2    .stat-val { color: #86efac; }
    .stat-errors .stat-val { color: #fca5a5; }
    .stat-warns  .stat-val { color: #fcd34d; }
    .stat-info   .stat-val { color: #93c5fd; }

    /* ── Section ── */
    .section { margin-bottom: 32px; }
    .section-head { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
    .section-title { font-size: 13px; font-weight: 600; color: var(--subtle); text-transform: uppercase; letter-spacing: .06em; }
    .section-count { font-size: 11px; color: var(--muted); background: var(--surface); border: 1px solid var(--border); padding: 1px 8px; border-radius: 999px; }

    /* ── Pillars ── */
    .pillars { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
    .prow { display: grid; grid-template-columns: 200px 1fr 100px; align-items: center; gap: 16px; padding: 14px 20px; border-bottom: 1px solid var(--border); }
    .prow:last-child { border-bottom: none; }
    .prow-left { display: flex; align-items: center; gap: 10px; }
    .picon { font-size: 12px; font-weight: 800; width: 18px; text-align: center; }
    .picon-good { color: #22c55e; }
    .picon-warn { color: #f59e0b; }
    .picon-ok   { color: #94a3b8; }
    .plabel { font-size: 13px; color: var(--text); }
    .pbar-wrap { height: 6px; background: var(--border); border-radius: 999px; overflow: hidden; }
    .pbar-fill { height: 100%; border-radius: 999px; background: var(--bar-color); width: var(--bar-width); }
    .prow-right { display: flex; align-items: center; justify-content: flex-end; gap: 12px; }
    .pscore { font-size: 15px; font-weight: 700; min-width: 28px; text-align: right; color: var(--bar-color); }
    .pweight { font-size: 11px; color: var(--muted); min-width: 32px; text-align: right; }

    /* ── Grade Scale ── */
    .grade-list { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
    .grade-row { display: flex; align-items: center; gap: 16px; padding: 12px 20px; border-bottom: 1px solid var(--border); }
    .grade-list .grade-row:last-child { border-bottom: none; }
    .grade-letter { font-size: 15px; font-weight: 800; min-width: 28px; }
    .grade-range  { font-size: 12px; color: var(--subtle); min-width: 72px; font-variant-numeric: tabular-nums; }
    .grade-desc   { font-size: 13px; font-weight: 600; min-width: 90px; }
    .grade-note   { font-size: 12px; color: var(--subtle); flex: 1; }
    .grade-you    { font-size: 11px; font-weight: 700; padding: 2px 10px; border-radius: 999px; margin-left: auto; white-space: nowrap; }

    /* Per-grade colors */
    .grade-aplus { color: #22c55e; }
    .grade-a     { color: #86efac; }
    .grade-b     { color: #facc15; }
    .grade-c     { color: #fb923c; }
    .grade-d     { color: #f87171; }
    .grade-f     { color: #ef4444; }

    /* Grade-current highlight per grade */
    .grade-current-grade-aplus { border-radius: var(--radius); margin: 4px; border: 1px solid #22c55e33; background: #22c55e08; }
    .grade-current-grade-a     { border-radius: var(--radius); margin: 4px; border: 1px solid #86efac33; background: #86efac08; }
    .grade-current-grade-b     { border-radius: var(--radius); margin: 4px; border: 1px solid #facc1533; background: #facc1508; }
    .grade-current-grade-c     { border-radius: var(--radius); margin: 4px; border: 1px solid #fb923c33; background: #fb923c08; }
    .grade-current-grade-d     { border-radius: var(--radius); margin: 4px; border: 1px solid #f8717133; background: #f8717108; }
    .grade-current-grade-f     { border-radius: var(--radius); margin: 4px; border: 1px solid #ef444433; background: #ef444408; }

    /* "← you" pill per grade */
    .grade-aplus-you { background: #22c55e22; color: #22c55e; }
    .grade-a-you     { background: #86efac22; color: #86efac; }
    .grade-b-you     { background: #facc1522; color: #facc15; }
    .grade-c-you     { background: #fb923c22; color: #fb923c; }
    .grade-d-you     { background: #f8717122; color: #f87171; }
    .grade-f-you     { background: #ef444422; color: #ef4444; }

    /* ── File cards ── */
    .fcard { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; margin-bottom: 12px; }
    .fcard-head { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-bottom: 1px solid var(--border); background: #1c1c1f; list-style: none; cursor: pointer; user-select: none; }
    .fcard-head::-webkit-details-marker { display: none; }
    .fcard:not([open]) .fcard-head { border-bottom: none; }
    .chevron { flex-shrink: 0; transition: transform .25s ease; opacity: .5; }
    .fcard[open] .chevron { transform: rotate(180deg); }
    .file-icon { opacity: .4; flex-shrink: 0; }
    .fpath { font-size: 12px; color: #a78bfa; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .fchips { display: flex; gap: 6px; flex-shrink: 0; }
    .chip { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 999px; }
    .chip-e { background: #450a0a; color: #fca5a5; }
    .chip-w { background: #431407; color: #fcd34d; }
    .chip-i { background: #172554; color: #93c5fd; }
    .fcard-body { overflow: hidden; }

    /* ── Violations ── */
    .vrow { padding: 14px 16px; border-bottom: 1px solid var(--border); }
    .vrow:last-child { border-bottom: none; }
    .vrow-top { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 6px; }
    .dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
    .dot-error { background: #fca5a5; }
    .dot-warn  { background: #fcd34d; }
    .dot-info  { background: #93c5fd; }
    .vtag { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px; border: 1px solid; }
    .vtag-error  { color: #ef4444; border-color: #ef444422; background: #ef444411; }
    .vtag-warn   { color: #f59e0b; border-color: #f59e0b22; background: #f59e0b11; }
    .vtag-info   { color: #3b82f6; border-color: #3b82f622; background: #3b82f611; }
    .vtag-high   { color: #fca5a5; border-color: #fca5a522; background: #450a0a; }
    .vtag-medium { color: #fdba74; border-color: #fdba7422; background: #431407; }
    .vtag-low    { color: #86efac; border-color: #86efac22; background: #052e16; }
    .vloc { font-size: 11px; color: var(--subtle); background: var(--bg); padding: 2px 6px; border-radius: 4px; }
    .vrule { font-size: 11px; color: #71717a; background: var(--bg); padding: 2px 6px; border-radius: 4px; }
    .vsaving { font-size: 11px; color: #86efac; margin-left: auto; }
    .vmsg { font-size: 13px; color: var(--text); }
    .vsug { font-size: 12px; color: var(--subtle); margin-top: 4px; font-style: italic; }

    /* ── Empty state ── */
    .empty { text-align: center; padding: 48px 24px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); }
    .empty-icon { font-size: 32px; margin-bottom: 12px; }
    .empty-title { font-size: 16px; font-weight: 600; color: #22c55e; margin-bottom: 4px; }
    .empty-sub { font-size: 13px; color: var(--subtle); }

    /* ── Footer ── */
    .footer { text-align: center; color: var(--muted); font-size: 12px; margin-top: 56px; padding-top: 24px; border-top: 1px solid var(--border); }
    .footer p + p { margin-top: 6px; }

    @media (max-width: 600px) {
      .hero { grid-template-columns: 1fr; gap: 24px; padding: 24px; }
      .prow { grid-template-columns: 140px 1fr 80px; }
    }
  </style>
</head>
<body>
<div class="wrap">

  <div class="header">
    <div class="header-brand">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 2c2.5 2.5 4 6 4 10"/><path d="M2 12h10"/><path d="M12 2v10"/></svg>
      <span>eco-linter</span>
    </div>
    <div class="header-meta">${esc(analyzedAt)}</div>
  </div>

  <div class="hero">
    <div class="hero-score">
      <div class="score-ring">
        <span class="score-num">${score.overall}</span>
        <span class="score-denom">/ 100</span>
      </div>
      <div class="grade-pill">Grade ${esc(score.grade)}</div>
    </div>
    <div class="hero-stats">
      <h2>Carbon Score Report</h2>
      <p class="sub">${summary.totalFiles} files analysed · ${totalViolations} violation${totalViolations !== 1 ? 's' : ''} found</p>
      <div class="stat-grid">
        <div class="stat-card stat-co2">
          <div class="stat-val">${score.estimatedCO2ePerBuild}g</div>
          <div class="stat-key">CO₂e / build</div>
        </div>
        <div class="stat-card stat-errors">
          <div class="stat-val">${summary.errorCount}</div>
          <div class="stat-key">Errors</div>
        </div>
        <div class="stat-card stat-warns">
          <div class="stat-val">${summary.warningCount}</div>
          <div class="stat-key">Warnings</div>
        </div>
        <div class="stat-card stat-info">
          <div class="stat-val">${summary.infoCount}</div>
          <div class="stat-key">Info</div>
        </div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-head"><span class="section-title">Pillar Breakdown</span></div>
    <div class="pillars">
      ${pillarBar('Loop Efficiency',        score.pillars.loopEfficiency,        '30%', 'pillar-loop')}
      ${pillarBar('Dependency Health',      score.pillars.dependencyHealth,      '35%', 'pillar-dep')}
      ${pillarBar('Tree-Shakability',       score.pillars.treeShakability,       '25%', 'pillar-tree')}
      ${pillarBar('Algorithmic Complexity', score.pillars.algorithmicComplexity, '10%', 'pillar-algo')}
    </div>
  </div>

  <div class="section">
    <div class="section-head"><span class="section-title">Grade Scale</span></div>
    <div class="grade-list">${gradeRows}</div>
  </div>

  <div class="section">
    <div class="section-head">
      <span class="section-title">Violations</span>
      <span class="section-count">${totalViolations}</span>
    </div>
    ${filesWithViolations.length === 0
      ? `<div class="empty">
          <div class="empty-icon">🌿</div>
          <div class="empty-title">No violations found</div>
          <div class="empty-sub">Perfect score — your code meets all eco-linter rules.</div>
        </div>`
      : sortFiles(filesWithViolations).map((f, i) => fileCard(f, i === 0)).join('')
    }
  </div>

  <div class="footer">
    <p>CO₂e figures are estimates — not power measurements. Based on cyclomatic complexity proxies, bundle size, and regional carbon intensity.</p>
    <p>Generated by <strong>eco-linter</strong> v1.0.0</p>
  </div>

</div>

<script>
  document.querySelectorAll('details.fcard').forEach(details => {
    const summary = details.querySelector('summary');
    const body    = details.querySelector('.fcard-body');
    if (!summary || !body) return;

    body.style.height = details.open ? 'auto' : '0px';

    summary.addEventListener('click', e => {
      e.preventDefault();
      if (details.open) {
        body.style.height = body.scrollHeight + 'px';
        requestAnimationFrame(() => {
          body.style.transition = 'height .28s cubic-bezier(.4,0,.2,1)';
          body.style.height = '0px';
        });
        body.addEventListener('transitionend', () => {
          body.style.transition = '';
          details.removeAttribute('open');
        }, { once: true });
      } else {
        details.setAttribute('open', '');
        const target = body.scrollHeight + 'px';
        body.style.height = '0px';
        requestAnimationFrame(() => {
          body.style.transition = 'height .28s cubic-bezier(.4,0,.2,1)';
          body.style.height = target;
        });
        body.addEventListener('transitionend', () => {
          body.style.transition = '';
          body.style.height = 'auto';
        }, { once: true });
      }
    });
  });
</script>
</body>
</html>`;
}
