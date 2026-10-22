// Sends website enquiries to the "Bizabler-S website enquiries" Google Form (owned by enablers26@gmail.com),
// which writes each one as a row in its linked Google Sheet.
// If a question is renamed in the form its ID stays the same; if one is deleted and re-added, update its ID here
// (open the form's public link, view source, and search for the question title).
(() => {
  'use strict';

  const ENDPOINT = 'https://docs.google.com/forms/d/e/1FAIpQLSdgVcUfVClB4lujiQS6Hn-g2P9DkokH21f5S9kEdGtmCtd1Mw/formResponse';

  const FIELDS = {
    name: 'entry.1200407560',        // Full name (required)
    email: 'entry.147584759',        // Email (required)
    phone: 'entry.847922021',        // Phone / WhatsApp (required)
    company: 'entry.2049157548',     // Company or business idea
    need: 'entry.483049035',         // What do you need?
    message: 'entry.1863758479',     // Message
    option: 'entry.785614274',       // Recommended option (calculator)
    activity: 'entry.782431052',     // Activity (calculator)
    visas: 'entry.2062118318',       // Visas (calculator)
    estimate: 'entry.197741254',     // Year 1 estimate (AED) (calculator)
    quoteLink: 'entry.1695339040',   // Quote link (calculator)
    source: 'entry.112055437',       // Source: which page sent it
  };

  // Google Forms does not allow cross-site reads, so the response is opaque: a resolved promise means the
  // request left the browser, a rejection means it could not (offline, blocked).
  async function send(data) {
    const body = new URLSearchParams();
    for (const [key, id] of Object.entries(FIELDS)) {
      const v = data[key];
      if (v !== undefined && v !== null && String(v).trim() !== '') body.append(id, String(v).trim());
    }
    await fetch(ENDPOINT, { method: 'POST', mode: 'no-cors', body });
  }

  const validEmail = (s) => /^\S+@\S+\.\S+$/.test(String(s || '').trim());
  const validPhone = (s) => String(s || '').replace(/\D/g, '').length >= 7;

  window.BIZ_LEAD = { send, validEmail, validPhone };

  // Phones: the floating WhatsApp button steps aside while an enquiry form is on screen,
  // so it never covers the fields or the send button (see .form-in-view in styles.css).
  const forms = document.querySelectorAll('#form, #quote-form');
  if (forms.length && 'IntersectionObserver' in window) {
    const seen = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => (en.isIntersecting ? seen.add(en.target) : seen.delete(en.target)));
      document.body.classList.toggle('form-in-view', seen.size > 0);
    });
    forms.forEach((f) => io.observe(f));
  }
})();
