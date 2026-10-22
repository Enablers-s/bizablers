// Bizabler-S setup cost calculator: every price lives here. All amounts in AED.
// Researched October 2026 from authority sites (marked "pub") and consultancy / third-party quotes ("est").
// Before publishing, confirm the "est" figures with each zone's partner desk, then switch them to "pub".
// Each zone:
//   licence      first-year licence package with no visas (flexi-desk / co-working where the zone includes one)
//   visaUplift   one-off step up when the company takes its first visa (establishment / immigration card,
//                visa-eligible package); charged again at renewal as `visaUpliftRenewal`
//   investorVisa / employeeVisa   zone fee per visa (allocation + entry permit + stamping)
//   medEidIncluded  true when the zone's visa fee already includes medical test and Emirates ID
//   renewal      licence renewal from year 2
//   maxVisas     most visas the base package / flexi-desk allows (null = depends on office size)
//   fit          activities the zone suits: "strong" ranks it higher, "no" rules it out
// the calculator.js script uses this data to build the UI and calculater
// mainland is priced as one package per license type,the same in every emirate (market package rates,oct 2026).The package covers licence,initial approval,trade name,MOA,flexible and also create an set of data for the calculator to use
// renewal=package minus the one-off setup items (`oneOff`). Override a price per emirate with `package` on that entry.
// bizabler-s own fee,shown as a line in every qoute (no hidden fees).set before publishing.
// optional add-ons the visitoe can tick
//private office instead of the zone flexi deso
(() => {
  'use strict';

  const CHECKED = 'October 2026';

  // Licence type sets the mainland package price; `from` is shown on the choice card
  const LICENCE_TYPES = [
    { id: 'professional', label: 'Professional', desc: 'Services, consultancy, IT, marketing' },
    { id: 'commercial', label: 'Commercial', desc: 'Trading in one family of goods' },
    { id: 'general', label: 'General trading', desc: 'Any goods, import & export' },
  ];

  // Each activity belongs to a licence type; `fit` is the zone-fit category used in ZONES[].fit
  const ACTIVITIES = [
    { id: 'management', type: 'professional', fit: 'consulting', label: 'Management consultancy' },
    { id: 'it', type: 'professional', fit: 'tech', label: 'IT consultancy & software' },
    { id: 'marketing', type: 'professional', fit: 'media', label: 'Marketing, media & creative' },
    { id: 'accounting', type: 'professional', fit: 'consulting', label: 'Accounting & bookkeeping' },
    { id: 'hr', type: 'professional', fit: 'consulting', label: 'Human resource consultancy' },
    { id: 'csp', type: 'professional', fit: 'consulting', label: 'Corporate service provider' },
    { id: 'technical', type: 'professional', fit: 'consulting', label: 'Technical services' },
    { id: 'ecommerce', type: 'professional', fit: 'ecommerce', label: 'E-commerce & online business' },
    { id: 'cleaning', type: 'professional', fit: 'retail', label: 'Building cleaning services' },
    { id: 'restaurant', type: 'professional', fit: 'retail', label: 'Restaurant management' },
    { id: 'holding', type: 'professional', fit: 'holding', label: 'Holding company (owning shares or assets)' },
    { id: 'foodstuff', type: 'commercial', fit: 'trading', label: 'Foodstuff trading' },
    { id: 'building', type: 'commercial', fit: 'trading', label: 'Building material trading' },
    { id: 'garments', type: 'commercial', fit: 'trading', label: 'Garments & footwear trading' },
    { id: 'perfumes', type: 'commercial', fit: 'trading', label: 'Perfumes & cosmetics trading' },
    { id: 'toys', type: 'commercial', fit: 'trading', label: 'Toys & games trading' },
    { id: 'jewellery', type: 'commercial', fit: 'trading', label: 'Artificial jewellery trading' },
    { id: 'stationery', type: 'commercial', fit: 'trading', label: 'Stationery trading' },
    { id: 'medical', type: 'commercial', fit: 'trading', label: 'Medical equipment trading' },
    { id: 'machinery', type: 'commercial', fit: 'industrial', label: 'Heavy machinery trading' },
    { id: 'cars', type: 'commercial', fit: 'industrial', label: 'Used car trading' },
    { id: 'logistics', type: 'commercial', fit: 'industrial', label: 'Logistics & light manufacturing' },
    { id: 'shop', type: 'commercial', fit: 'retail', label: 'Retail shop (walk-in customers)' },
    { id: 'general', type: 'general', fit: 'trading', label: 'General trading (any goods, import & export)' },
  ];

  // Mainland is priced as one package per licence type, the same in every emirate (market package rates, Oct 2026).
  // The package covers licence, initial approval, trade name, MOA, flexi-desk Ejari and establishment card.
  // Renewal = package minus the one-off setup items (`oneOff`). Override a price per emirate with `package` on that entry.
  const MAINLAND = {
    package: { professional: 25000, commercial: 35000, general: 45000 },
    oneOff: 7000,
    officeUpgrade: 30000,
  };
  const EMIRATES = [
    { id: 'dubai', name: 'Dubai', authority: 'DET' },
    { id: 'abudhabi', name: 'Abu Dhabi', authority: 'ADDED' },
    { id: 'sharjah', name: 'Sharjah', authority: 'SEDD' },
    { id: 'ajman', name: 'Ajman', authority: 'Ajman DED' },
    { id: 'uaq', name: 'Umm Al Quwain', authority: 'UAQ DED' },
    { id: 'rak', name: 'Ras Al Khaimah', authority: 'RAK DED' },
    { id: 'fujairah', name: 'Fujairah', authority: 'Fujairah DED' },
  ];

  const CUSTOMERS = [
    { id: 'intl', label: 'Mostly outside the UAE or online' },
    { id: 'b2b', label: 'UAE businesses (B2B)' },
    { id: 'local', label: 'UAE public, walk-in or government' },
  ];

  // Applied per person on top of the zone's visa fee
  const VISA_COMMON = {
    medical: { label: 'Medical fitness test', amount: 320, src: 'DHA standard service', conf: 'pub' },
    eid: { label: 'Emirates ID (2 years)', amount: 370, src: 'ICP fee + typing', conf: 'est' },
    insurance: { label: 'Health insurance, basic plan (per year)', amount: 650, src: 'DHA Essential Benefits Plan, AED 550–750', conf: 'pub' },
    changeOfStatus: { label: 'Change of status (applying from inside the UAE)', amount: 700, src: 'GDRFA AED 535 + typing', conf: 'est' },
    dependant: { label: 'Dependant residence visa', amount: 4000, src: 'Zone quotes AED 3,000–6,000', conf: 'est' },
    dependantDeposit: { label: 'Dependant visa deposit (refundable)', amount: 3000, src: 'Meydan FZ published deposit', conf: 'pub' },
  };

  const ZONES = [
    {
      id: 'meydan', name: 'Meydan Free Zone', emirate: 'Dubai', type: 'freezone',
      licence: 12500, visaUplift: 2000, visaUpliftRenewal: 2000, investorVisa: 5350, employeeVisa: 5350,
      medEidIncluded: false, renewal: 12500, maxVisas: 6, office: 'Flexi-desk included', extraShareholder: { included: 6, fee: 2000 },
      conf: { licence: 'pub', visaUplift: 'est', visa: 'pub', renewal: 'est' },
      src: 'meydanfz.ae cost calculator and cost breakdown (Jun 2026)',
      fit: { tech: 'strong', consulting: 'strong', ecommerce: 'strong', industrial: 'no', retail: 'no', holding: 'ok' },
      note: 'Dubai address with a fast digital process; visa allocation AED 1,850 + visa AED 3,500.',
    },
    {
      id: 'ifza', name: 'IFZA', emirate: 'Dubai', type: 'freezone',
      licence: 12900, visaUplift: 2000, visaUpliftRenewal: 2000, investorVisa: 5750, employeeVisa: 5750,
      medEidIncluded: false, renewal: 12900, maxVisas: 6, office: 'Flexi-desk included', extraShareholder: { included: 6, fee: 1500 },
      conf: { licence: 'est', visaUplift: 'est', visa: 'est', renewal: 'est' },
      src: 'Partner quotes (IFZA publishes no prices)',
      fit: { consulting: 'strong', trading: 'strong', ecommerce: 'ok', industrial: 'no', retail: 'no' },
      note: 'Popular Dubai zone for consultancies and trading; sold through partners only.',
    },
    {
      id: 'dmcc', name: 'DMCC', emirate: 'Dubai', type: 'freezone',
      licence: 35484, visaUplift: 0, visaUpliftRenewal: 0, investorVisa: 4500, employeeVisa: 4500,
      medEidIncluded: false, renewal: 22110, maxVisas: 3, office: 'Flexi-desk included', extraShareholder: { included: 1, fee: 2000 },
      shareCapital: 50000,
      conf: { licence: 'pub', visaUplift: 'pub', visa: 'est', renewal: 'pub' },
      src: 'dmcc.ae Basic Biz package (Feb 2026); establishment card included',
      fit: { trading: 'strong', holding: 'strong', consulting: 'ok', industrial: 'no', retail: 'no' },
      note: 'Premium JLT address; strongest for commodities, trading and holding. Paid-up share capital is expected.',
    },
    {
      id: 'dubaisouth', name: 'Dubai South Free Zone', emirate: 'Dubai', type: 'freezone',
      licence: 12500, visaUplift: 0, visaUpliftRenewal: 0, investorVisa: 3850, employeeVisa: 3850,
      medEidIncluded: false, renewal: 12500, maxVisas: 6, office: 'Flexi-desk included', extraShareholder: { included: 6, fee: 1500 },
      conf: { licence: 'est', visaUplift: 'est', visa: 'est', renewal: 'est' },
      src: 'Business centre quotes (no official price list found)',
      fit: { industrial: 'strong', trading: 'strong', ecommerce: 'ok', retail: 'no' },
      note: 'Next to Al Maktoum airport; good for logistics, aviation and e-commerce fulfilment.',
    },
    {
      id: 'spc', name: 'SPC Free Zone', emirate: 'Sharjah', type: 'freezone',
      licence: 5750, visaUplift: 2280, visaUpliftRenewal: 2280, investorVisa: 4495, employeeVisa: 5665,
      medEidIncluded: true, renewal: 5750, maxVisas: 6, office: 'Flexi-desk included', extraShareholder: { included: 7, fee: 1000 },
      conf: { licence: 'pub', visaUplift: 'pub', visa: 'pub', renewal: 'est' },
      src: 'spcfz.ae cost calculator (Oct 2026); visa fees include medical and Emirates ID',
      fit: { media: 'strong', ecommerce: 'strong', consulting: 'ok', industrial: 'no', retail: 'no' },
      note: 'One of the lowest licence prices in the UAE, with multi-year discounts up to 20%.',
    },
    {
      id: 'shams', name: 'Shams (Sharjah Media City)', emirate: 'Sharjah', type: 'freezone',
      licence: 6875, visaUplift: 1900, visaUpliftRenewal: 1900, investorVisa: 5480, employeeVisa: 5480,
      medEidIncluded: false, renewal: 6875, maxVisas: 6, office: 'Flexi-desk included', extraShareholder: { included: 10, fee: 1000 },
      conf: { licence: 'est', visaUplift: 'est', visa: 'est', renewal: 'est' },
      src: 'Partner quotes; Shams calculator is behind a form',
      fit: { media: 'strong', ecommerce: 'ok', consulting: 'ok', industrial: 'no', retail: 'no' },
      note: 'Media and creative specialists; allows many visas on one licence.',
    },
    {
      id: 'afz', name: 'Ajman Free Zone', emirate: 'Ajman', type: 'freezone',
      licence: 5565, visaUplift: 2000, visaUpliftRenewal: 2000, investorVisa: 5566, employeeVisa: 5566,
      medEidIncluded: false, renewal: 5565, maxVisas: 6, office: 'Flexi-desk; warehouses available', extraShareholder: { included: 5, fee: 1000 },
      conf: { licence: 'est', visaUplift: 'est', visa: 'est', renewal: 'est' },
      src: 'Partner quotes; AFZ emails prices only after a form',
      fit: { industrial: 'strong', trading: 'strong', retail: 'no' },
      note: 'Low-cost zone with warehouses and light industrial units.',
    },
    {
      id: 'rakez', name: 'RAKEZ', emirate: 'Ras Al Khaimah', type: 'freezone',
      licence: 6000, visaUplift: 4000, visaUpliftRenewal: 4000, investorVisa: 4000, employeeVisa: 4000,
      medEidIncluded: true, renewal: 6000, maxVisas: 4, office: 'Shared workstation included', extraShareholder: { included: 6, fee: 1000 },
      conf: { licence: 'pub', visaUplift: 'pub', visa: 'pub', renewal: 'pub' },
      src: 'rakez.com Biz Starter (AED 6,000) and SME package (AED 14,000 with 1 visa, +4,000 per visa)',
      fit: { industrial: 'strong', trading: 'ok', consulting: 'ok', retail: 'no' },
      note: 'Fixed renewal price; land and factory units for industrial setups.',
    },
    {
      id: 'uaq', name: 'UAQ Free Trade Zone', emirate: 'Umm Al Quwain', type: 'freezone',
      licence: 5500, visaUplift: 2000, visaUpliftRenewal: 2000, investorVisa: 5000, employeeVisa: 5000,
      medEidIncluded: false, renewal: 5500, maxVisas: 6, office: 'Co-working included', extraShareholder: { included: 5, fee: 1000 },
      conf: { licence: 'pub', visaUplift: 'pub', visa: 'est', renewal: 'est' },
      src: 'uaqftz.gov.ae LYTE AED 5,500 and START AED 12,500 (Oct 2026)',
      fit: { ecommerce: 'ok', consulting: 'ok', retail: 'no', industrial: 'no' },
      note: 'Lowest-cost licence with one visa; monthly instalment plans available.',
    },
    {
      // One row for all 7 emirates; calculator.js fills name, emirate, licence and renewal from EMIRATES and MAINLAND
      id: 'mainland', name: 'Mainland', emirate: '', type: 'mainland',
      licence: 0, visaUplift: 0, visaUpliftRenewal: 1000, investorVisa: 3400, employeeVisa: 5500,
      medEidIncluded: false, renewal: 0, maxVisas: 2, office: 'Flexi-desk Ejari included', extraShareholder: { included: 99, fee: 0 },
      conf: { licence: 'est', visaUplift: 'est', visa: 'est', renewal: 'est' },
      src: 'UAE mainland consultancy package rates (Oct 2026), the same across all 7 emirates',
      fit: { retail: 'strong', trading: 'strong', consulting: 'ok', industrial: 'ok', holding: 'ok' },
      note: 'Trade anywhere in the UAE, open a shop and bid for government work. Flexi-desk Ejari carries up to 2 visas.',
    },
    {
      id: 'rakicc', name: 'RAK ICC Offshore', emirate: 'Ras Al Khaimah', type: 'offshore',
      licence: 6750, visaUplift: 0, visaUpliftRenewal: 0, investorVisa: 0, employeeVisa: 0,
      medEidIncluded: false, renewal: 7450, maxVisas: 0, office: 'Registered agent address only', extraShareholder: { included: 99, fee: 0 },
      conf: { licence: 'pub', visaUplift: 'pub', visa: 'pub', renewal: 'pub' },
      src: 'RAK ICC 2026 schedule: AED 3,250 incorporation + registered agent ~AED 3,500',
      fit: { holding: 'strong', trading: 'no', consulting: 'no', ecommerce: 'no', tech: 'no', media: 'no', industrial: 'no', retail: 'no' },
      note: 'For holding assets, shares and property. No UAE visas, no office, cannot trade in the UAE.',
    },
  ];

  // Bizabler-S' own fee, shown as a line in every quote (no hidden fees). Set before publishing.
  const SERVICE_FEE = { label: 'Bizabler-S setup service (all filing, PRO and follow-up)', amount: 3500 };

  // Optional add-ons the visitor can tick
  const ADDONS = [
    { id: 'bank', label: 'Corporate bank account opening', amount: 2000, by: 'finablers' },
    { id: 'vat', label: 'VAT registration', amount: 1500, by: 'finablers' },
    { id: 'ct', label: 'Corporate tax registration', amount: 1200, by: 'finablers' },
    { id: 'books', label: 'Bookkeeping, first year (from AED 750/month)', amount: 9000, yearly: true, by: 'finablers' },
  ];

  // Private office instead of the zone's flexi-desk (rough first-year rent)
  const FZ_OFFICE_UPGRADE = 30000;

  const CURRENCIES = {
    AED: { rate: 1, label: 'AED' },
    USD: { rate: 1 / 3.6725, label: 'USD' },
    EUR: { rate: 1 / 4.0, label: 'EUR' },
    GBP: { rate: 1 / 4.75, label: 'GBP' },
    INR: { rate: 23.5, label: 'INR' },
  };

  window.BIZ_CALC_DATA = { CHECKED, LICENCE_TYPES, ACTIVITIES, MAINLAND, EMIRATES, CUSTOMERS, VISA_COMMON, ZONES, SERVICE_FEE, ADDONS, FZ_OFFICE_UPGRADE, CURRENCIES };
})();
