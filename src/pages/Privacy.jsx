// src/pages/Privacy.jsx
// Privacy policy — public, no auth required

export default function PrivacyPage() {
  const updated = 'May 17, 2025'

  return (
    <>
      <style>{`
        .pp *, .pp *::before, .pp *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .pp {
          font-family: 'DM Sans', -apple-system, sans-serif;
          background: #050f1a;
          color: #f0f6ff;
          line-height: 1.6;
          min-height: 100vh;
          overflow-y: auto;
        }
        .pp::before {
          content: ''; position: fixed; inset: 0;
          background-image: linear-gradient(rgba(25,194,181,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(25,194,181,0.02) 1px,transparent 1px);
          background-size: 48px 48px; pointer-events: none; z-index: 0;
        }
        .pp-nav { position: fixed; top:0;left:0;right:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:0 48px; height:56px; background:rgba(5,15,26,0.95); backdrop-filter:blur(20px); border-bottom:1px solid #1a3050; }
        .pp-brand { display:flex; align-items:center; gap:9px; text-decoration:none; }
        .pp-logo { width:26px;height:26px; background:#19c2b5; border-radius:5px; display:flex;align-items:center;justify-content:center; }
        .pp-logo svg { width:12px;height:12px; color:#050f1a; }
        .pp-name { font-size:14px;font-weight:600;color:#f0f6ff;letter-spacing:-0.02em; }
        .pp-tag { font-size:11px;color:#4a6d8c;margin-left:4px; }
        .pp-back { font-size:13px;color:#8bb4d4;text-decoration:none;display:flex;align-items:center;gap:5px;transition:color 0.15s; }
        .pp-back:hover { color:#f0f6ff; }

        .pp-body { max-width:720px; margin:0 auto; padding:88px 48px 96px; position:relative;z-index:1; }
        .pp-eyebrow { font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:#19c2b5;margin-bottom:12px; }
        .pp-title { font-size:32px;font-weight:700;letter-spacing:-0.03em;color:#f0f6ff;margin-bottom:8px;line-height:1.15; }
        .pp-updated { font-size:12px;color:#4a6d8c;margin-bottom:48px; }
        .pp-intro { font-size:14px;color:#8bb4d4;line-height:1.7;margin-bottom:48px;padding:20px 24px;background:#0a1828;border:1px solid #1a3050;border-radius:8px; }

        .pp-section { margin-bottom:40px; }
        .pp-section-title { font-size:17px;font-weight:700;color:#f0f6ff;letter-spacing:-0.02em;margin-bottom:10px;display:flex;align-items:center;gap:10px; }
        .pp-section-num { font-family:'JetBrains Mono',monospace;font-size:10px;color:#19c2b5;font-weight:500;background:rgba(25,194,181,0.08);border:1px solid rgba(25,194,181,0.18);padding:2px 7px;border-radius:3px; }
        .pp-text { font-size:13.5px;color:#8bb4d4;line-height:1.75;margin-bottom:12px; }
        .pp-text a { color:#19c2b5; }
        .pp-list { margin:8px 0 12px 0;display:flex;flex-direction:column;gap:6px; }
        .pp-list-item { display:flex;gap:10px;font-size:13.5px;color:#8bb4d4;line-height:1.65; }
        .pp-list-item::before { content:'—';color:#4a6d8c;flex-shrink:0;margin-top:1px; }

        .pp-highlight { background:#0a1828;border:1px solid #1a3050;border-radius:7px;padding:16px 20px;margin-bottom:12px; }
        .pp-highlight-title { font-size:12px;font-weight:700;color:#f0f6ff;margin-bottom:6px; }
        .pp-highlight-text { font-size:12.5px;color:#8bb4d4;line-height:1.65; }

        .pp-divider { height:1px;background:#1a3050;margin:40px 0; }

        .pp-contact { background:#0a1828;border:1px solid rgba(25,194,181,0.18);border-radius:10px;padding:24px;text-align:center;margin-top:48px; }
        .pp-contact-title { font-size:15px;font-weight:700;color:#f0f6ff;margin-bottom:8px; }
        .pp-contact-text { font-size:13px;color:#8bb4d4;margin-bottom:16px; }
        .pp-contact a { color:#19c2b5; }

        .pp-footer { border-top:1px solid #1a3050;padding:24px 48px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;position:relative;z-index:1; }
        .pp-footer-brand { font-size:12px;color:#4a6d8c; }
        .pp-footer-links { display:flex;gap:16px; }
        .pp-footer-links a { font-size:11.5px;color:#4a6d8c;text-decoration:none;transition:color 0.15s; }
        .pp-footer-links a:hover { color:#8bb4d4; }

        @media (max-width:640px) {
          .pp-nav { padding:0 24px; }
          .pp-body { padding:80px 24px 64px; }
          .pp-footer { padding:20px 24px;flex-direction:column;align-items:flex-start; }
        }
      `}</style>

      <div className="pp">
        {/* Nav */}
        <nav className="pp-nav">
          <a href="/" className="pp-brand">
            <div className="pp-logo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M2 12h20"/></svg></div>
            <span className="pp-name">Orela Nigeria</span>
            <span className="pp-tag">/ Privacy</span>
          </a>
          <a href="/" className="pp-back">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Back to site
          </a>
        </nav>

        <div className="pp-body">
          <div className="pp-eyebrow">Legal</div>
          <h1 className="pp-title">Privacy Policy</h1>
          <div className="pp-updated">Last updated: {updated}</div>

          <div className="pp-intro">
            Orela Nigeria is medicine availability infrastructure for healthcare facilities. We handle sensitive operational data — medicine stock, facility details, transfer records — on behalf of the facilities that use our platform. This policy explains what we collect, how we use it, and how we protect it.
          </div>

          {/* 1 */}
          <div className="pp-section">
            <div className="pp-section-title"><span className="pp-section-num">01</span>Who we are</div>
            <p className="pp-text">Orela Nigeria operates the medicine availability network at orela.africa/ng. We are registered and operating in Nigeria. For privacy questions, contact us at <a href="mailto:hello@orela.africa">hello@orela.africa</a>.</p>
          </div>

          {/* 2 */}
          <div className="pp-section">
            <div className="pp-section-title"><span className="pp-section-num">02</span>What data we collect</div>
            <p className="pp-text">We collect two categories of data:</p>
            <div className="pp-highlight">
              <div className="pp-highlight-title">Facility data</div>
              <div className="pp-highlight-text">Facility name, type, registration number (PCN/NAFDAC/PPB), address, contact email and phone, and operational settings. This is used to verify your facility and maintain your presence on the network.</div>
            </div>
            <div className="pp-highlight">
              <div className="pp-highlight-title">Inventory and operational data</div>
              <div className="pp-highlight-text">Medicine stock records including batch numbers, quantities, expiry dates, reorder levels, cost pricing, supplier details, and stock movement history. Transfer requests between facilities including quantities, urgency, reasons, and fulfilment status.</div>
            </div>
            <div className="pp-highlight">
              <div className="pp-highlight-title">User account data</div>
              <div className="pp-highlight-text">Name, email address, role within your facility. Authentication is handled by Supabase Auth.</div>
            </div>
          </div>

          {/* 3 */}
          <div className="pp-section">
            <div className="pp-section-title"><span className="pp-section-num">03</span>What other facilities can see</div>
            <p className="pp-text">This is the most important section for facilities to understand. Orela is a network — some of your data is intentionally visible to other verified facilities. Here is exactly what is and is not shared:</p>
            <div className="pp-list">
              <div className="pp-list-item"><strong style={{color:'#22c55e'}}>Visible to other verified facilities:</strong> Your facility name, type, city, state, and verification status. For each medicine you stock: the generic name, available quantity (net of reserved stock), earliest expiry date, and number of batches. This powers the medicine network search.</div>
              <div className="pp-list-item"><strong style={{color:'#ef4444'}}>Never visible to other facilities:</strong> Cost pricing, supplier names and details, batch numbers, reserved quantities, internal notes, staff records, contact information (until a transfer is mutually agreed), and any data marked as sensitive in your inventory.</div>
            </div>
            <p className="pp-text">Contact details are only exchanged between two facilities after both have agreed to a transfer request. You are always in control of whether to approve a transfer.</p>
          </div>

          {/* 4 */}
          <div className="pp-section">
            <div className="pp-section-title"><span className="pp-section-num">04</span>How we use your data</div>
            <div className="pp-list">
              <div className="pp-list-item">To operate the medicine availability network and power search results</div>
              <div className="pp-list-item">To send shortage alerts and transfer notifications by email</div>
              <div className="pp-list-item">To verify facility identity and maintain network integrity</div>
              <div className="pp-list-item">To generate anonymised supply intelligence insights (no facility-identifiable data is exposed in aggregate reports)</div>
              <div className="pp-list-item">To resolve transfer disputes when reported</div>
            </div>
            <p className="pp-text">We do not sell your data. We do not use your data for advertising. We do not share your data with third parties except as required to operate the platform (Supabase for database and authentication, Resend for email delivery).</p>
          </div>

          {/* 5 */}
          <div className="pp-section">
            <div className="pp-section-title"><span className="pp-section-num">05</span>Data security</div>
            <p className="pp-text">Your data is protected by multiple layers of security:</p>
            <div className="pp-list">
              <div className="pp-list-item"><strong style={{color:'#f0f6ff'}}>Row Level Security (RLS)</strong> — enforced at the database level. A facility can only read and write its own data. This is not application-level access control — it is enforced by the database itself regardless of how a request is made.</div>
              <div className="pp-list-item"><strong style={{color:'#f0f6ff'}}>Facility-scoped access</strong> — staff members can only access data belonging to their own facility. Cross-facility data access is technically impossible except through the controlled medicine search and transfer workflows.</div>
              <div className="pp-list-item"><strong style={{color:'#f0f6ff'}}>Encrypted in transit</strong> — all data is transmitted over HTTPS/TLS. Data at rest is encrypted by Supabase (hosted on AWS eu-west-2, London).</div>
              <div className="pp-list-item"><strong style={{color:'#f0f6ff'}}>Verified facility network</strong> — only verified facilities appear in medicine search results. Unverified accounts have restricted access to network features.</div>
            </div>
          </div>

          {/* 6 */}
          <div className="pp-section">
            <div className="pp-section-title"><span className="pp-section-num">06</span>Data retention</div>
            <p className="pp-text">We retain your facility and inventory data for as long as your facility is active on the network. If you deactivate your facility, your data is preserved in our systems but removed from all network-facing views. Transfer records and inventory movement logs are retained for audit purposes.</p>
            <p className="pp-text">You may request deletion of your account and associated data by emailing <a href="mailto:hello@orela.africa">hello@orela.africa</a>. We will process deletion requests within 30 days.</p>
          </div>

          {/* 7 */}
          <div className="pp-section">
            <div className="pp-section-title"><span className="pp-section-num">07</span>Your rights</div>
            <p className="pp-text">As a facility administrator or staff member on the platform, you have the right to:</p>
            <div className="pp-list">
              <div className="pp-list-item">Access all data your facility has submitted to the platform</div>
              <div className="pp-list-item">Correct inaccurate facility or inventory data</div>
              <div className="pp-list-item">Request deletion of your account and facility data</div>
              <div className="pp-list-item">Export your inventory and transfer records</div>
              <div className="pp-list-item">Deactivate your facility and remove it from network search at any time</div>
            </div>
            <p className="pp-text">To exercise any of these rights, email <a href="mailto:hello@orela.africa">hello@orela.africa</a>.</p>
          </div>

          {/* 8 */}
          <div className="pp-section">
            <div className="pp-section-title"><span className="pp-section-num">08</span>Third-party services</div>
            <div className="pp-list">
              <div className="pp-list-item"><strong style={{color:'#f0f6ff'}}>Supabase</strong> — database, authentication, and file storage. Data hosted in eu-west-2 (London). <a href="https://supabase.com/privacy" target="_blank" rel="noreferrer">Supabase Privacy Policy</a></div>
              <div className="pp-list-item"><strong style={{color:'#f0f6ff'}}>Resend</strong> — transactional email delivery for notifications and alerts. Only your facility email address is shared with Resend for delivery purposes. <a href="https://resend.com/privacy" target="_blank" rel="noreferrer">Resend Privacy Policy</a></div>
              <div className="pp-list-item"><strong style={{color:'#f0f6ff'}}>Vercel</strong> — frontend hosting and deployment. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer">Vercel Privacy Policy</a></div>
            </div>
          </div>

          {/* 9 */}
          <div className="pp-section">
            <div className="pp-section-title"><span className="pp-section-num">09</span>Changes to this policy</div>
            <p className="pp-text">We may update this privacy policy as the platform evolves. Material changes will be communicated to registered facilities by email before they take effect. Continued use of the platform after a policy update constitutes acceptance of the revised terms.</p>
          </div>

          <div className="pp-divider" />

          <div className="pp-contact">
            <div className="pp-contact-title">Questions about privacy?</div>
            <div className="pp-contact-text">We take data protection seriously. If you have any questions about how we handle your data, email us directly.</div>
            <a href="mailto:hello@orela.africa" style={{color:'#19c2b5',fontWeight:600,fontSize:14}}>hello@orela.africa</a>
          </div>
        </div>

        {/* Footer */}
        <footer className="pp-footer">
          <div className="pp-footer-brand">Orela Nigeria · Medicine availability infrastructure</div>
          <div className="pp-footer-links">
            <a href="/">Home</a>
            <a href="/docs">Docs</a>
            <a href="/status">Status</a>
            <a href="mailto:hello@orela.africa">Contact</a>
          </div>
        </footer>
      </div>
    </>
  )
}
