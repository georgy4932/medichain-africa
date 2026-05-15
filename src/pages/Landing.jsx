<!-- Changes: hero split layout with facility network panel, SVG icons replacing emoji throughout, facility network section with node-style cards, command center preview updated to infra console style, features section with DM Sans titles + surface meta + uppercase tags, trust section with infra copy + updated trust items, nav updated with Capabilities link, footer with Status/Docs links -->
<!DOCTYPE html>
<html lang="en" style="background:#050f1a;">
<head>
  <meta charset="UTF-8" />
  <meta name="theme-color" content="#050f1a" />
  <meta name="color-scheme" content="dark" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MediChain Africa — Medicine Availability Network</title>
  <meta name="description" content="Africa's medicine availability and pharmaceutical supply intelligence network. Know where medicines are. Move stock before patients are affected." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #050f1a; --bg-card: #0a1828; --bg-raised: #0e2038;
      --border: #1a3050; --border-2: #223a58;
      --teal: #19c2b5; --teal-dim: rgba(25,194,181,0.08); --teal-border: rgba(25,194,181,0.18);
      --warn: #f5a524; --danger: #ef4444; --success: #22c55e; --purple: #8b5cf6;
      --text-1: #f0f6ff; --text-2: #8bb4d4; --text-3: #4a6d8c;
      --sans: 'DM Sans', -apple-system, sans-serif;
      --serif: 'Instrument Serif', Georgia, serif;
      --mono: 'JetBrains Mono', monospace;
    }
    html { font-size: 15px; scroll-behavior: smooth; }
    body { font-family: var(--sans); background: #050f1a !important; color: var(--text-1); line-height: 1.6; overflow-x: hidden; }
    body::before {
      content: ''; position: fixed; inset: 0;
      background-image: linear-gradient(rgba(25,194,181,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(25,194,181,0.025) 1px,transparent 1px);
      background-size: 48px 48px; pointer-events: none; z-index: 0;
    }

    /* ── NAV ── */
    nav { position: fixed; top:0;left:0;right:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:0 48px; height:56px; background:rgba(5,15,26,0.94); backdrop-filter:blur(20px); border-bottom:1px solid var(--border); }
    .nav-left { display:flex; align-items:center; gap:32px; }
    .nav-brand { display:flex; align-items:center; gap:9px; text-decoration:none; flex-shrink:0; }
    .nav-logo { width:26px;height:26px; background:var(--teal); border-radius:5px; display:flex;align-items:center;justify-content:center; }
    .nav-logo svg { width:12px;height:12px; color:#050f1a; }
    .nav-name { font-size:14px;font-weight:600;color:var(--text-1);letter-spacing:-0.02em; }
    .nav-links { display:flex; gap:24px; list-style:none; }
    .nav-links a { font-size:12.5px;color:var(--text-2);text-decoration:none;transition:color 0.15s;letter-spacing:0.01em; }
    .nav-links a:hover { color:var(--text-1); }
    .nav-right { display:flex;align-items:center;gap:12px; }
    .nav-signin { font-size:13px;color:var(--text-2);text-decoration:none;transition:color 0.15s; }
    .nav-signin:hover { color:var(--text-1); }
    .nav-cta { display:inline-flex;align-items:center;gap:6px;padding:7px 16px;background:var(--teal);color:#050f1a;font-family:var(--sans);font-size:13px;font-weight:600;border-radius:5px;text-decoration:none;transition:background 0.15s; }
    .nav-cta:hover { background:#12a79c; }

    /* ── HERO — infra split layout ── */
    .hero { min-height:100vh; display:grid; grid-template-columns:minmax(0,1.2fr) minmax(0,1fr); column-gap:48px; align-items:center; padding:100px 72px 80px; position:relative;z-index:1; }
    .hero-left { display:flex;flex-direction:column; }
    .hero-eyebrow { display:inline-flex;align-items:center;gap:7px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--teal);margin-bottom:20px; }
    .eyebrow-dot { width:5px;height:5px;border-radius:50%;background:var(--teal);animation:pulse 2s infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
    .hero-headline { font-family:var(--sans);font-size:clamp(28px,3.6vw,46px);font-weight:700;line-height:1.12;letter-spacing:-0.03em;color:var(--text-1);margin-bottom:18px; }
    .hero-headline em { font-style:normal;color:var(--teal); }
    .hero-sub { font-size:14.5px;color:var(--text-2);max-width:480px;line-height:1.7;margin-bottom:32px;font-weight:300; }
    .hero-actions { display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px; }
    .hero-meta { font-size:11px;color:var(--text-3);display:flex;align-items:center;gap:6px; }
    .hero-meta svg { flex-shrink:0; }
    .btn-primary { display:inline-flex;align-items:center;gap:7px;padding:10px 20px;background:var(--teal);color:#050f1a;font-family:var(--sans);font-size:13.5px;font-weight:600;border-radius:6px;text-decoration:none;transition:background 0.15s,transform 0.15s;border:none;cursor:pointer; }
    .btn-primary:hover { background:#12a79c;transform:translateY(-1px); }
    .btn-secondary { display:inline-flex;align-items:center;gap:7px;padding:10px 20px;background:transparent;color:var(--text-2);font-family:var(--sans);font-size:13.5px;font-weight:500;border-radius:6px;text-decoration:none;border:1px solid var(--border-2);transition:color 0.15s,border-color 0.15s; }
    .btn-secondary:hover { color:var(--text-1);border-color:var(--text-3); }

    /* ── NETWORK PANEL (right column) ── */
    .network-panel { background:var(--bg-card);border:1px solid var(--border);border-radius:12px;overflow:hidden;box-shadow:0 24px 56px rgba(0,0,0,0.55); }
    .panel-header { display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--bg-raised);border-bottom:1px solid var(--border); }
    .panel-title { font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-2); }
    .panel-online { display:flex;align-items:center;gap:5px;font-family:var(--mono);font-size:9px;color:var(--success); }
    .online-dot { width:5px;height:5px;border-radius:50%;background:var(--success);animation:pulse 2s infinite; }
    .panel-body { padding:14px; }
    .panel-section-label { font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-3);margin-bottom:7px; }
    /* Facility rows in panel */
    .panel-fac-row { display:flex;align-items:center;gap:8px;padding:7px 9px;background:var(--bg-raised);border:1px solid var(--border);border-radius:5px;margin-bottom:4px; }
    .panel-fac-row:last-of-type { margin-bottom:0; }
    .pf-dot { width:5px;height:5px;border-radius:50%;flex-shrink:0; }
    .pf-name { font-size:11px;color:var(--text-2);flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
    .pf-type { font-size:9px;color:var(--text-3);flex-shrink:0;margin-right:4px; }
    .pf-chip { font-family:var(--mono);font-size:9px;padding:2px 6px;border-radius:3px;flex-shrink:0; }
    .panel-divider { height:1px;background:var(--border);margin:10px 0; }
    /* Network health summary */
    .net-health { display:grid;grid-template-columns:repeat(3,1fr);gap:5px; }
    .nh-item { background:var(--bg-raised);border:1px solid var(--border);border-radius:5px;padding:8px 10px; }
    .nh-num { font-family:var(--mono);font-size:15px;font-weight:500;line-height:1;margin-bottom:2px; }
    .nh-label { font-size:8px;color:var(--text-3);text-transform:uppercase;letter-spacing:0.08em;line-height:1.3; }
    /* Topo type strip */
    .topo-strip { display:flex;gap:4px;margin-bottom:10px; }
    .topo-node { background:var(--bg-raised);border:1px solid var(--border);border-radius:5px;padding:7px 6px;display:flex;flex-direction:column;align-items:center;gap:3px;position:relative;flex:1; }
    .topo-icon { width:22px;height:22px;border-radius:4px;display:flex;align-items:center;justify-content:center; }
    .topo-icon svg { width:12px;height:12px; }
    .topo-txt { font-size:7.5px;color:var(--text-3);text-transform:uppercase;letter-spacing:0.04em;text-align:center;line-height:1.2; }
    .topo-status { width:5px;height:5px;border-radius:50%;position:absolute;top:4px;right:4px; }

    /* ── STAT BAR ── */
    .stat-bar { display:flex;position:relative;z-index:1;border-top:1px solid var(--border);border-bottom:1px solid var(--border);background:var(--bg); }
    .stat-item { flex:1;padding:18px 28px;border-right:1px solid var(--border); }
    .stat-item:last-child { border-right:none; }
    .stat-num { font-family:var(--mono);font-size:18px;font-weight:500;color:var(--teal);letter-spacing:-0.02em;display:block;margin-bottom:3px; }
    .stat-label { font-size:10px;color:var(--text-3);text-transform:uppercase;letter-spacing:0.1em; }

    /* ── LAYOUT ── */
    section { position:relative;z-index:1;background:var(--bg); }
    .container { max-width:1100px;margin:0 auto;padding:0 48px; }
    .section-pad { padding:88px 0; }
    .section-label { display:flex;align-items:center;gap:10px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:var(--teal);margin-bottom:22px; }
    .section-label::after { content:'';flex:1;height:1px;background:var(--border); }

    /* ── PROBLEM ── */
    .problem-headline { font-size:clamp(24px,4vw,40px);font-weight:700;line-height:1.15;letter-spacing:-0.025em;max-width:600px;margin-bottom:36px;color:var(--text-1); }
    .problem-headline em { font-style:normal;color:var(--text-2); }
    .problem-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border);border-radius:10px;overflow:hidden; }
    .problem-card { background:var(--bg-card);padding:24px 20px;display:flex;flex-direction:column;gap:10px;transition:background 0.15s; }
    .problem-card:hover { background:var(--bg-raised); }
    .p-icon { width:34px;height:34px;border-radius:6px;background:var(--bg-raised);border:1px solid var(--border-2);display:flex;align-items:center;justify-content:center; }
    .p-icon svg { width:16px;height:16px;color:var(--text-2); }
    .p-title { font-size:13.5px;font-weight:600;color:var(--text-1);letter-spacing:-0.01em; }
    .p-desc { font-size:12.5px;color:var(--text-2);line-height:1.65; }

    /* ── HOW IT WORKS ── */
    .how-grid { display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:start; }
    .how-headline { font-family:var(--sans);font-size:clamp(20px,3vw,32px);font-weight:700;letter-spacing:-0.025em;line-height:1.2;margin-bottom:28px;color:var(--text-1); }
    .steps { display:flex;flex-direction:column; }
    .step { display:flex;gap:16px;padding:20px 0;border-bottom:1px solid var(--border); }
    .step:last-child { border-bottom:none; }
    .step-num { font-family:var(--mono);font-size:10px;color:var(--teal);font-weight:500;flex-shrink:0;padding-top:2px;letter-spacing:0.05em;width:24px; }
    .step-title { font-size:13.5px;font-weight:600;color:var(--text-1);margin-bottom:5px;letter-spacing:-0.01em; }
    .step-desc { font-size:12.5px;color:var(--text-2);line-height:1.65; }

    /* ── COMMAND CENTER PREVIEW ── */
    .cmd-preview { background:var(--bg-card);border:1px solid var(--border);border-radius:10px;overflow:hidden;box-shadow:0 16px 40px rgba(0,0,0,0.4); }
    .cmd-bar { padding:9px 14px;background:var(--bg-raised);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:6px; }
    .cmd-dot { width:7px;height:7px;border-radius:50%; }
    .cmd-url { font-family:var(--mono);font-size:9px;color:var(--text-3);margin-left:6px; }
    .cmd-body { padding:13px; }
    .cmd-eyebrow { font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--text-3);margin-bottom:2px; }
    .cmd-title { font-family:var(--sans);font-size:13px;font-weight:700;color:var(--text-1);letter-spacing:-0.02em;margin-bottom:11px; }
    /* Neutral metric cards — color only in number */
    .cmd-metrics-row { display:grid;grid-template-columns:repeat(2,1fr);gap:5px;margin-bottom:10px; }
    .cmd-metric { background:var(--bg-raised);border:1px solid var(--border);border-radius:5px;padding:8px 10px; }
    .cmd-metric-num { font-family:var(--mono);font-size:18px;font-weight:500;line-height:1;margin-bottom:2px; }
    .cmd-metric-label { font-size:8px;color:var(--text-3);text-transform:uppercase;letter-spacing:0.08em; }
    /* Facility status list */
    .cmd-divider { height:1px;background:var(--border);margin:9px 0; }
    .cmd-list-label { font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-3);margin-bottom:6px; }
    .cmd-row { display:flex;align-items:center;gap:6px;padding:5px 0;border-bottom:1px solid rgba(26,48,80,0.4);font-size:10px; }
    .cmd-row:last-child { border-bottom:none; }
    .cmd-row-dot { width:5px;height:5px;border-radius:50%;flex-shrink:0; }
    .cmd-row-name { color:var(--text-2);flex:1; }
    .cmd-row-med { color:var(--text-3);font-size:9.5px;flex:1; }
    .cmd-status-chip { font-family:var(--mono);font-size:8.5px;padding:2px 5px;border-radius:3px;flex-shrink:0; }

    /* ── FACILITY NETWORK ── */
    .who-intro { font-size:13.5px;color:var(--text-2);margin-top:8px;margin-bottom:0;line-height:1.5; }
    .who-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border);border-radius:10px;overflow:hidden;margin-top:28px; }
    .who-card { background:var(--bg-card);padding:20px 18px;display:flex;flex-direction:column;gap:9px;transition:background 0.15s;position:relative; }
    .who-card:hover { background:var(--bg-raised); }
    /* Subtle node indicator */
    .who-card::before { content:'';position:absolute;top:12px;right:12px;width:4px;height:4px;border-radius:50%;background:var(--border-2); }
    .who-icon { width:30px;height:30px;border-radius:5px;background:var(--bg-raised);border:1px solid var(--border-2);display:flex;align-items:center;justify-content:center; }
    .who-icon svg { width:14px;height:14px;color:var(--text-2);stroke-width:1.8; }
    .who-title { font-size:13px;font-weight:600;color:var(--text-1);letter-spacing:-0.01em; }
    .who-desc { font-size:11.5px;color:var(--text-2);line-height:1.6; }

    /* ── FEATURES ── */
    .features-grid { display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:var(--border);border-radius:10px;overflow:hidden;margin-top:36px; }
    .feature-card { background:var(--bg-card);padding:28px 24px;display:flex;flex-direction:column;gap:10px;transition:background 0.15s; }
    .feature-card:hover { background:var(--bg-raised); }
    .feature-tag { display:inline-flex;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:var(--teal);background:var(--teal-dim);border:1px solid var(--teal-border);padding:2px 7px;border-radius:3px;width:fit-content; }
    .feature-title { font-family:var(--sans);font-size:15.5px;font-weight:700;color:var(--text-1);letter-spacing:-0.02em;line-height:1.25; }
    .feature-desc { font-size:12.5px;color:var(--text-2);line-height:1.7; }
    .feature-surface { font-size:9.5px;color:var(--text-3);font-family:var(--mono);letter-spacing:0.02em; }

    /* ── TRUST ── */
    .trust { padding:80px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border);background:var(--bg); }
    .trust-inner { max-width:640px;margin:0 auto;text-align:center;padding:0 48px; }
    .trust-quote { font-family:var(--serif);font-size:clamp(17px,2.8vw,26px);line-height:1.5;color:var(--text-1);margin-bottom:12px;font-style:italic; }
    .trust-attr { font-size:10px;color:var(--text-3);text-transform:uppercase;letter-spacing:0.12em;margin-bottom:14px; }
    .trust-infra { font-size:12px;color:var(--text-2);line-height:1.6;margin-bottom:32px; }
    .trust-items { display:flex;align-items:center;justify-content:center;gap:22px;flex-wrap:wrap; }
    .trust-item { display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-2); }
    .trust-item svg { color:var(--teal);width:13px;height:13px;flex-shrink:0;stroke-width:2; }

    /* ── CTA ── */
    .cta-section { padding:112px 0;text-align:center;position:relative;background:var(--bg); }
    .cta-section::before { content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:560px;height:360px;background:radial-gradient(ellipse,rgba(25,194,181,0.06) 0%,transparent 70%);pointer-events:none; }
    .cta-headline { font-family:var(--sans);font-size:clamp(26px,5vw,50px);font-weight:700;line-height:1.1;letter-spacing:-0.03em;max-width:560px;margin:0 auto 16px;color:var(--text-1); }
    .cta-headline em { font-style:normal;color:var(--teal); }
    .cta-sub { font-size:14px;color:var(--text-2);max-width:400px;margin:0 auto 30px;line-height:1.65;font-weight:300; }
    .cta-note { margin-top:12px;font-size:11px;color:var(--text-3); }

    /* ── FOOTER ── */
    footer { padding:24px 48px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;position:relative;z-index:1;background:var(--bg); }
    .footer-brand { display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text-3); }
    .footer-links { display:flex;gap:16px;flex-wrap:wrap; }
    .footer-links a { font-size:11.5px;color:var(--text-3);text-decoration:none;transition:color 0.15s; }
    .footer-links a:hover { color:var(--text-2); }

    /* ── RESPONSIVE ── */
    @media (max-width:960px) {
      nav { padding:0 24px; }
      .nav-links { display:none; }
      .hero { grid-template-columns:1fr;padding:88px 24px 48px;column-gap:0;row-gap:36px; }
      .how-grid { grid-template-columns:1fr;gap:32px; }
      .problem-grid,.who-grid { grid-template-columns:1fr 1fr; }
      .features-grid { grid-template-columns:1fr; }
      .container { padding:0 24px; }
      footer { padding:20px 24px;flex-direction:column;align-items:flex-start; }
      .trust-inner { padding:0 24px; }
    }
    @media (max-width:640px) {
      .problem-grid,.who-grid { grid-template-columns:1fr; }
      .stat-bar { flex-direction:column; }
      .stat-item { border-right:none;border-bottom:1px solid var(--border); }
      .stat-item:last-child { border-bottom:none; }
      .topo-strip { flex-wrap:wrap; }
      .net-health { grid-template-columns:1fr 1fr; }
    }
    @media (max-width:480px) { .cmd-preview { display:none; } }
  </style>
</head>
<body>

<!-- NAV -->
<nav>
  <div class="nav-left">
    <a href="#" class="nav-brand">
      <div class="nav-logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M2 12h20"/></svg>
      </div>
      <span class="nav-name">MediChain Africa</span>
    </a>
    <ul class="nav-links">
      <li><a href="#how">Product</a></li>
      <li><a href="#network">Facilities</a></li>
      <li><a href="#capabilities">Capabilities</a></li>
      <li><a href="/docs">Docs</a></li>
    </ul>
  </div>
  <div class="nav-right">
    <a href="https://medichain.africa/auth" class="nav-signin">Sign in</a>
    <a href="https://medichain.africa/auth" class="nav-cta">Join the network →</a>
  </div>
</nav>

<!-- HERO — two-column infra split -->
<section class="hero">
  <!-- Left: copy + CTAs -->
  <div class="hero-left">
    <div class="hero-eyebrow">
      <div class="eyebrow-dot"></div>
      Medicine Availability Network · Africa
    </div>
    <h1 class="hero-headline">
      Know where medicines are.<br/>
      Move stock <em>before</em><br/>patients are affected.
    </h1>
    <p class="hero-sub">
      MediChain Africa connects pharmacies, clinics, hospitals, and distributors into a real-time medicine availability network — so stockouts can be prevented, not just discovered.
    </p>
    <div class="hero-actions">
      <a href="https://medichain.africa/auth" class="btn-primary">
        Register your facility
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </a>
      <a href="#how" class="btn-secondary">See how it works</a>
    </div>
    <div class="hero-meta">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      Built for pharmacies, hospitals, distributors, and health systems
    </div>
  </div>

  <!-- Right: facility network ops panel -->
  <div class="network-panel">
    <div class="panel-header">
      <span class="panel-title">Facility Network — Lagos Region</span>
      <div class="panel-online"><div class="online-dot"></div>Network online</div>
    </div>
    <div class="panel-body">

      <!-- Facility type strip -->
      <div class="panel-section-label">Node types</div>
      <div class="topo-strip">
        <div class="topo-node">
          <div class="topo-status" style="background:var(--success)"></div>
          <div class="topo-icon" style="background:rgba(25,194,181,0.08);border:1px solid rgba(25,194,181,0.2);">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>
          </div>
          <div class="topo-txt">Pharmacy</div>
        </div>
        <div class="topo-node">
          <div class="topo-status" style="background:var(--success)"></div>
          <div class="topo-icon" style="background:rgba(56,189,248,0.08);border:1px solid rgba(56,189,248,0.2);">
            <svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="1.8"><path d="M8 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/><path d="M17 21v-6"/><path d="M14 18h6"/></svg>
          </div>
          <div class="topo-txt">Hospital</div>
        </div>
        <div class="topo-node">
          <div class="topo-status" style="background:var(--warn)"></div>
          <div class="topo-icon" style="background:rgba(245,165,36,0.08);border:1px solid rgba(245,165,36,0.2);">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--warn)" stroke-width="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
          </div>
          <div class="topo-txt">Clinic</div>
        </div>
        <div class="topo-node">
          <div class="topo-status" style="background:var(--success)"></div>
          <div class="topo-icon" style="background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.2);">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--purple)" stroke-width="1.8"><rect x="1" y="3" width="15" height="13"/><polygon points="16,8 20,8 23,11 23,16 16,16 16,8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          </div>
          <div class="topo-txt">Distributor</div>
        </div>
      </div>

      <div class="panel-divider"></div>

      <!-- Active facility rows -->
      <div class="panel-section-label">Active nodes</div>
      <div class="panel-fac-row">
        <div class="pf-dot" style="background:var(--success)"></div>
        <span class="pf-name">Egomedical Pharmacy</span>
        <span class="pf-type">Pharmacy</span>
        <span class="pf-chip" style="background:rgba(25,194,181,0.1);color:var(--teal)">24 SKUs</span>
      </div>
      <div class="panel-fac-row">
        <div class="pf-dot" style="background:var(--success)"></div>
        <span class="pf-name">LUTH Hospital Pharmacy</span>
        <span class="pf-type">Hospital</span>
        <span class="pf-chip" style="background:rgba(34,197,94,0.1);color:var(--success)">Stable</span>
      </div>
      <div class="panel-fac-row">
        <div class="pf-dot" style="background:var(--warn)"></div>
        <span class="pf-name">Hope Clinic · Surulere</span>
        <span class="pf-type">Clinic</span>
        <span class="pf-chip" style="background:rgba(245,165,36,0.1);color:var(--warn)">2 at risk</span>
      </div>
      <div class="panel-fac-row">
        <div class="pf-dot" style="background:var(--success)"></div>
        <span class="pf-name">Prime Distributor</span>
        <span class="pf-type">Distributor</span>
        <span class="pf-chip" style="background:rgba(139,92,246,0.1);color:var(--purple)">3 transfers</span>
      </div>
      <div class="panel-fac-row">
        <div class="pf-dot" style="background:var(--danger)"></div>
        <span class="pf-name">Isale Eko PHC</span>
        <span class="pf-type">PHC</span>
        <span class="pf-chip" style="background:rgba(239,68,68,0.1);color:var(--danger)">Stockout</span>
      </div>

      <div class="panel-divider"></div>

      <!-- Network health summary -->
      <div class="panel-section-label">Network health</div>
      <div class="net-health">
        <div class="nh-item">
          <div class="nh-num" style="color:var(--teal)">5</div>
          <div class="nh-label">Facilities online</div>
        </div>
        <div class="nh-item">
          <div class="nh-num" style="color:var(--purple)">3</div>
          <div class="nh-label">Active transfers</div>
        </div>
        <div class="nh-item">
          <div class="nh-num" style="color:var(--warn)">2</div>
          <div class="nh-label">Shortage alerts</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- STAT BAR -->
<div class="stat-bar">
  <div class="stat-item"><span class="stat-num">Real-time</span><span class="stat-label">Medicine availability</span></div>
  <div class="stat-item"><span class="stat-num">Verified</span><span class="stat-label">Facility network</span></div>
  <div class="stat-item"><span class="stat-num">Secure</span><span class="stat-label">Data segregation</span></div>
  <div class="stat-item"><span class="stat-num">Free</span><span class="stat-label">During beta</span></div>
</div>

<!-- PROBLEM -->
<section class="section-pad">
  <div class="container">
    <div class="section-label">The problem</div>
    <h2 class="problem-headline">Medicines exist nearby.<br/><em>But no one knows where.</em></h2>
    <div class="problem-grid">
      <div class="problem-card">
        <div class="p-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
        </div>
        <div class="p-title">Invisible surplus</div>
        <div class="p-desc">Pharmacies and hospitals sit on excess stock — including near-expiry medicines — with no way to offer it to facilities that need it.</div>
      </div>
      <div class="problem-card">
        <div class="p-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div class="p-title">Undetected shortages</div>
        <div class="p-desc">Stockouts are discovered at the dispensing counter, not before. By then, patients are already affected and alternatives take days to source.</div>
      </div>
      <div class="problem-card">
        <div class="p-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 5.55 5.55l1.62-1.62a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 14.92z"/>
          </svg>
        </div>
        <div class="p-title">Manual coordination</div>
        <div class="p-desc">When a facility runs out, they call around. WhatsApp groups. Personal contacts. Hours lost. No visibility, no trust, no system.</div>
      </div>
    </div>
  </div>
</section>

<!-- HOW IT WORKS -->
<section class="section-pad" id="how" style="border-top:1px solid var(--border);">
  <div class="container">
    <div class="section-label">How it works</div>
    <div class="how-grid">
      <div>
        <h2 class="how-headline">Three steps to a connected supply network</h2>
        <div class="steps">
          <div class="step">
            <span class="step-num">01</span>
            <div>
              <div class="step-title">Register and publish your inventory</div>
              <div class="step-desc">Create your facility profile and add medicine stock. Your inventory immediately powers real-time availability intelligence — visible to other verified facilities in the network.</div>
            </div>
          </div>
          <div class="step">
            <span class="step-num">02</span>
            <div>
              <div class="step-title">Search the network when stock runs low</div>
              <div class="step-desc">Query by medicine name and location. See real availability at verified nearby facilities — quantity, expiry date, facility type — without exposing sensitive pricing or supplier data.</div>
            </div>
          </div>
          <div class="step">
            <span class="step-num">03</span>
            <div>
              <div class="step-title">Request a transfer. Prevent the stockout.</div>
              <div class="step-desc">Submit a structured transfer request. The supplying facility approves and dispatches — fully tracked with email notifications and a complete audit trail at every stage.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Command center preview — infra console style -->
      <div class="cmd-preview">
        <div class="cmd-bar">
          <div class="cmd-dot" style="background:#ef4444"></div>
          <div class="cmd-dot" style="background:#f5a524"></div>
          <div class="cmd-dot" style="background:#22c55e"></div>
          <span class="cmd-url">medichain.africa · Command Center</span>
        </div>
        <div class="cmd-body">
          <div class="cmd-eyebrow">Supply Network · Command Center</div>
          <div class="cmd-title">Egomedical Pharmacy — Ikeja</div>
          <!-- Neutral metric cards, color only in numbers -->
          <div class="cmd-metrics-row">
            <div class="cmd-metric">
              <div class="cmd-metric-num" style="color:var(--teal)">24</div>
              <div class="cmd-metric-label">SKUs in stock</div>
            </div>
            <div class="cmd-metric">
              <div class="cmd-metric-num" style="color:var(--warn)">2</div>
              <div class="cmd-metric-label">At risk</div>
            </div>
            <div class="cmd-metric">
              <div class="cmd-metric-num" style="color:var(--purple)">3</div>
              <div class="cmd-metric-label">Transfers active</div>
            </div>
            <div class="cmd-metric">
              <div class="cmd-metric-num" style="color:var(--success)">0</div>
              <div class="cmd-metric-label">Stockouts</div>
            </div>
          </div>
          <div class="cmd-divider"></div>
          <div class="cmd-list-label">Recent network activity</div>
          <div class="cmd-row">
            <div class="cmd-row-dot" style="background:var(--success)"></div>
            <span class="cmd-row-name">Hope Clinic</span>
            <span class="cmd-row-med">Amoxicillin 500mg</span>
            <span class="cmd-status-chip" style="background:rgba(34,197,94,0.1);color:var(--success)">Redistributed</span>
          </div>
          <div class="cmd-row">
            <div class="cmd-row-dot" style="background:var(--warn)"></div>
            <span class="cmd-row-name">Isale Eko PHC</span>
            <span class="cmd-row-med">Artemether/LF</span>
            <span class="cmd-status-chip" style="background:rgba(245,165,36,0.1);color:var(--warn)">At risk</span>
          </div>
          <div class="cmd-row">
            <div class="cmd-row-dot" style="background:var(--teal)"></div>
            <span class="cmd-row-name">Prime Distributor</span>
            <span class="cmd-row-med">Metformin 500mg</span>
            <span class="cmd-status-chip" style="background:rgba(25,194,181,0.1);color:var(--teal)">Stable</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- FACILITY NETWORK -->
<section class="section-pad" id="network" style="border-top:1px solid var(--border);">
  <div class="container">
    <div class="section-label">Facility network</div>
    <h2 style="font-family:var(--sans);font-size:clamp(20px,3.2vw,36px);font-weight:700;letter-spacing:-0.025em;max-width:520px;line-height:1.2;color:var(--text-1);">
      Every facility that touches medicine supply in Africa
    </h2>
    <p class="who-intro">MediChain connects every facility that touches medicine supply — as verified nodes in a shared availability network.</p>
    <div class="who-grid">
      <div class="who-card">
        <div class="who-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>
        </div>
        <div class="who-title">Independent Pharmacies</div>
        <div class="who-desc">Publish stock to the network, source from nearby verified facilities, and redistribute near-expiry stock before it's wasted.</div>
      </div>
      <div class="who-card">
        <div class="who-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/><path d="M17 21v-6"/><path d="M14 18h6"/></svg>
        </div>
        <div class="who-title">Hospitals &amp; Clinics</div>
        <div class="who-desc">Monitor essential medicine coverage continuously. Get shortage alerts before they reach patients and coordinate emergency transfers.</div>
      </div>
      <div class="who-card">
        <div class="who-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>
        </div>
        <div class="who-title">Primary Health Centers</div>
        <div class="who-desc">Access network supply when government stock runs short. Know which nearby facilities have what your patients need right now.</div>
      </div>
      <div class="who-card">
        <div class="who-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="3" width="15" height="13"/><polygon points="16,8 20,8 23,11 23,16 16,16 16,8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
        </div>
        <div class="who-title">Distributors &amp; Wholesalers</div>
        <div class="who-desc">See real demand signals from the network. Understand which medicines are moving fastest and where shortages are emerging.</div>
      </div>
      <div class="who-card">
        <div class="who-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        </div>
        <div class="who-title">NGOs &amp; Health Programs</div>
        <div class="who-desc">Monitor essential medicine availability across your facility networks. Identify supply gaps and redistribution opportunities across regions.</div>
      </div>
      <div class="who-card">
        <div class="who-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        </div>
        <div class="who-title">Government &amp; Health Systems</div>
        <div class="who-desc">Track essential medicine coverage by region. Get early warning signals on emerging shortages across public facilities.</div>
      </div>
    </div>
  </div>
</section>

<!-- PLATFORM CAPABILITIES -->
<section class="section-pad" id="capabilities" style="border-top:1px solid var(--border);">
  <div class="container">
    <div class="section-label">Platform capabilities</div>
    <div class="features-grid">
      <div class="feature-card">
        <span class="feature-tag">NETWORK</span>
        <div class="feature-title">Real-time medicine availability search</div>
        <div class="feature-desc">Query by medicine name and location. See verified stock availability — quantity, expiry, facility type — across the entire network instantly. Role-based access ensures only authorised facilities can see each other's data.</div>
        <div class="feature-surface">Surface: Medicine Network · Search console</div>
      </div>
      <div class="feature-card">
        <span class="feature-tag">INTELLIGENCE</span>
        <div class="feature-title">Shortage alerts before they reach patients</div>
        <div class="feature-desc">Automatic alerts when stock falls below reorder level or approaches expiry. Know your risk position continuously, not at the point of dispensing. Alert logic runs at the database level — no polling required.</div>
        <div class="feature-surface">Surface: Analytics console · Facility command center</div>
      </div>
      <div class="feature-card">
        <span class="feature-tag">REDISTRIBUTION</span>
        <div class="feature-title">Structured transfer coordination</div>
        <div class="feature-desc">Request stock from network facilities with a structured approval workflow. Every transfer is tracked from request to delivery — with full audit trail, quantity reservation, and email notifications at each stage.</div>
        <div class="feature-surface">Surface: Redistribution workflow · Transfer pipeline</div>
      </div>
      <div class="feature-card">
        <span class="feature-tag">TRUST</span>
        <div class="feature-title">Verified facility network with data governance</div>
        <div class="feature-desc">Only verified facilities appear in network search. Sensitive data — supplier details, cost pricing, contact information — is protected by row-level security and only shared after a transfer is agreed between both parties.</div>
        <div class="feature-surface">Surface: Facility verification &amp; access control</div>
      </div>
    </div>
  </div>
</section>

<!-- TRUST -->
<section class="trust">
  <div class="trust-inner">
    <div class="trust-quote">"The local health ecosystem should know where trusted medicine supply exists and be able to move it before stockouts hurt patients."</div>
    <div class="trust-attr">The MediChain Africa thesis</div>
    <div class="trust-infra">
      Secure, multi-facility infrastructure for medicine availability.<br/>
      Data partitioned by facility — sensitive fields never exposed in network search.
    </div>
    <div class="trust-items">
      <div class="trust-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        Secure infrastructure
      </div>
      <div class="trust-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        Facility-level access control
      </div>
      <div class="trust-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>
        Works on low connectivity
      </div>
      <div class="trust-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        Nigeria-first, Africa-ready
      </div>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="cta-section">
  <h2 class="cta-headline">Join the network.<br/><em>Before the next stockout.</em></h2>
  <p class="cta-sub">Register your facility in minutes. Add your inventory. Become part of Africa's medicine availability network.</p>
  <a href="https://medichain.africa/auth" class="btn-primary" style="font-size:15px;padding:12px 28px;">Register your facility →</a>
  <p class="cta-note">Free during beta · No credit card required · medichain.africa</p>
</section>

<!-- FOOTER -->
<footer>
  <div class="footer-brand">
    <div class="nav-logo" style="width:20px;height:20px;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:10px;height:10px;color:#050f1a;"><path d="M12 2v20M2 12h20"/></svg>
    </div>
    MediChain Africa · Medicine availability infrastructure
  </div>
  <div class="footer-links">
    <a href="https://medichain.africa/auth">Sign in</a>
    <a href="/docs">Docs</a>
    <a href="#">Status</a>
    <a href="mailto:hello@medichain.africa">hello@medichain.africa</a>
    <a href="#">Privacy</a>
  </div>
</footer>

</body>
</html>
