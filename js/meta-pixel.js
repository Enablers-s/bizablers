// Meta Pixel for Bizabler-S business setup ads. It lives in its own file because the site's
// Content-Security-Policy (vercel.json) blocks inline scripts.
// Events: PageView on every page, Lead when an enquiry is sent (lead-form.js), Contact on WhatsApp/phone/email clicks.
// Only event names and categories go to Meta: never add names, emails or phone numbers here.
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '2629869787427184');
fbq('track', 'PageView');

document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href*="wa.me/"], a[href^="tel:"], a[href^="mailto:"]');
  if (!link) return;
  const href = link.getAttribute('href');
  const method = href.startsWith('tel:') ? 'Phone' : href.startsWith('mailto:') ? 'Email' : 'WhatsApp';
  fbq('track', 'Contact', { content_category: 'Business Setup', content_name: method });
});
