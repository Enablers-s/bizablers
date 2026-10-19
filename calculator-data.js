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
(() => {
  'use strict';

  const CHECKED = 'October 2026';

  const ACTIVITIES = [
    { id: 'trading', label: 'General trading / import & export' },
    { id: 'consulting', label: 'Consultancy & professional services' },
    { id: 'ecommerce', label: 'E-commerce & online business' },
    { id: 'tech', label: 'Technology, IT & software' },
    { id: 'media', label: 'Media, marketing & creative' },
    { id: 'industrial', label: 'Industrial, manufacturing & logistics' },
    { id: 'retail', label: 'Shop, restaurant or walk-in customers' },
    { id: 'holding', label: 'Holding / owning assets only' },
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
      id: 'dubai-mainland', name: 'Dubai Mainland (DET)', emirate: 'Dubai', type: 'mainland',
      licence: 13900, visaUplift: 2000, visaUpliftRenewal: 1000, investorVisa: 3400, employeeVisa: 5500,
      medEidIncluded: false, renewal: 10000, maxVisas: null, extraShareholder: { included: 99, fee: 0 },
      rent: { flexi: 15000, office: 45000 }, rentLinkedFee: 0.05,
      conf: { licence: 'est', visaUplift: 'est', visa: 'est', renewal: 'est', rent: 'est' },
      src: 'DET government fees AED 13,900–16,200 (2026); licence includes 5% of annual rent',
      fit: { retail: 'strong', trading: 'strong', consulting: 'ok', industrial: 'ok', holding: 'ok' },
      note: 'Trade anywhere in the UAE, open a shop and bid for government work. Needs an Ejari office lease.',
    },
    {
      id: 'ad-mainland', name: 'Abu Dhabi Mainland (ADDED)', emirate: 'Abu Dhabi', type: 'mainland',
      licence: 1000, visaUplift: 2000, visaUpliftRenewal: 1000, investorVisa: 3400, employeeVisa: 5500,
      medEidIncluded: false, renewal: 1000, maxVisas: null, extraShareholder: { included: 99, fee: 0 },
      rent: { flexi: 12000, office: 40000 }, rentLinkedFee: 0,
      conf: { licence: 'pub', visaUplift: 'est', visa: 'est', renewal: 'pub', rent: 'est' },
      src: 'Abu Dhabi Media Office: setup and renewal AED 1,000 (still in force 2026)',
      fit: { retail: 'strong', trading: 'ok', consulting: 'ok', industrial: 'ok' },
      note: 'AED 1,000 licence and renewal; the main cost is the office lease.',
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

  window.BIZ_CALC_DATA = { CHECKED, ACTIVITIES, CUSTOMERS, VISA_COMMON, ZONES, SERVICE_FEE, ADDONS, FZ_OFFICE_UPGRADE, CURRENCIES };
})();
