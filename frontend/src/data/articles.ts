export interface Article {
  tag: string; tagColor: string; emoji: string; author: string; authorRole: string;
  city: string; date: string; readTime: string; title: string; summary: string;
  source: string; sourceUrl: string;
  content: { heading?: string; text: string }[];
  related: string[];
}

export const articles: Record<string, Article> = {
  'new-rent-rules-2026': {
    tag: 'Rental Guide', tagColor: '#f59e0b', emoji: '🔑',
    author: 'News18 Editorial', authorRole: 'Real Estate News',
    city: 'Delhi', date: 'Mar 2026', readTime: '6 min read',
    title: 'New Rent Rules 2026: Deposit Caps, Privacy & Digital Agreements Explained',
    summary: 'Digital registration mandatory within 60 days, deposits capped at 2 months for residential, 24-hour notice for inspections.',
    source: 'News18.com', sourceUrl: 'https://www.news18.com/business/real-estate/new-rent-rules-2026-deposit-caps-privacy-digital-agreements-what-tenants-and-landlords-must-know-ws-l-9950472.html',
    content: [
      { text: "India's rental housing market is moving toward a formal and technology-driven framework under the New Rent Rules 2026. The updated rules aim to strengthen digital compliance, tighten enforcement of deposit caps, accelerate dispute resolution and standardise rental practices across states." },
      { heading: 'Mandatory Digital Registration', text: 'All rent agreements must be digitally stamped and registered online within 60 days of signing. Failure to register can attract penalties starting from ₹5,000, with higher fines for repeat violations. Several states have integrated rent registration with property-registration portals.' },
      { heading: 'Security Deposit Caps', text: 'For residential properties, landlords cannot demand more than two months\' rent as security deposit. For commercial properties, the cap remains six months\' rent. This reduces the financial burden on tenants, particularly in large cities where landlords often demanded deposits of six to ten months\' rent.' },
      { heading: 'Rent Increase Rules', text: 'Landlords can revise rent only after 12 months and must provide a 90-day written notice before implementing the increase. The rent revision terms must be clearly mentioned in the tenancy agreement. If landlords attempt sudden or excessive hikes without notice, tenants can challenge the increase before the Rent Tribunal.' },
      { heading: 'Tenant Protection Against Eviction', text: 'Eviction can take place only through an order of the Rent Tribunal. Landlords cannot force tenants to vacate through intimidation, threats or by disconnecting water or electricity. Landlords must give at least 24 hours\' written notice before entering or inspecting the property.' },
      { heading: 'Essential Repairs Timeline', text: 'Landlords are required to complete essential repairs within 30 days after being notified by the tenant. If repairs are not carried out within that period, tenants can undertake the work themselves and deduct the cost from rent, provided they maintain proper bills and documentation.' },
    ],
    related: ['tenant-landlord-balance', 'home-loan-rules-2026', 'rera-buyer-rights'],
  },
  'tenant-landlord-balance': {
    tag: 'Legal Guide', tagColor: '#06b6d4', emoji: '⚖️',
    author: 'India Today Editorial', authorRole: 'Business News',
    city: 'Mumbai', date: 'Mar 2026', readTime: '5 min read',
    title: "Tenant vs Landlord: How India's New Rental Rules Change the Balance",
    summary: 'Model Tenancy Act brings formal contracts, deposit caps, faster dispute resolution. Here\'s how it affects both sides.',
    source: 'IndiaToday.in', sourceUrl: 'https://www.indiatoday.in/business/story/new-rental-rules-tenant-vs-landlord-india-model-tenancy-act-explained-deposit-rent-increase-eviction-2883005-2026-03-17',
    content: [
      { text: "Renting a home in India has often been a tug of war. Tenants complained about high deposits and sudden rent hikes, while landlords struggled with delayed payments and long eviction battles. A new rental framework based on the Model Tenancy Act, 2021 is trying to formalise how homes are rented in India." },
      { heading: 'What Has Changed', text: "The biggest change is the move towards a formal system. Written tenancy agreements and their registration with a Rent Authority become central to the system. Earlier, many rental arrangements worked without proper documentation — many agreements were oral or based on standard 11-month contracts that were rarely registered." },
      { heading: 'Security Deposits and Repairs', text: "Security deposits are capped at two months' rent for residential properties and six months for commercial ones. There is also a clear division of responsibilities for repairs between landlords and tenants. The law makes it mandatory to register rental agreements with the Rent Authority within two months." },
      { heading: 'Tenant Rights', text: "From the tenant's perspective, the law provides greater predictability and protection against arbitrary practices. Security deposits are capped, tenancy agreements must clearly specify rent, tenure, and responsibilities, and landlords cannot revise rent during the tenancy unless the agreement permits it and proper notice is given." },
      { heading: 'Landlord Benefits', text: "Landlords now have clearer rights to recover possession of their property, to take action against tenants who default in rent payment, and to enforce contractual terms. If a tenant fails to vacate after the agreement ends, the landlord can charge enhanced rent up to four times the monthly rent." },
      { heading: 'Faster Dispute Resolution', text: "The new framework creates a specialised institutional structure to deal with rental disputes. At the first level is the Rent Authority, which registers tenancy agreements and handles routine disputes. Appeals or more serious disputes can be taken to a Rent Court, and a further appeal lies before a Rent Tribunal — designed specifically for tenancy matters rather than ordinary civil courts." },
    ],
    related: ['new-rent-rules-2026', 'rera-buyer-rights', 'home-loan-rules-2026'],
  },
  'rera-buyer-rights': {
    tag: 'Legal Guide', tagColor: '#8b5cf6', emoji: '🏛️',
    author: 'Housiey Editorial', authorRole: 'Property Legal Expert',
    city: 'Mumbai', date: 'Apr 2026', readTime: '7 min read',
    title: 'What Rights Do Buyers Have Under RERA in 2026?',
    summary: 'Timely possession, refund with interest, structural defect liability for 5 years, and digital portal access — your complete RERA rights guide.',
    source: 'Housiey.com', sourceUrl: 'https://housiey.com/blogs/what-rights-do-buyers-have-under-rera-in-2025',
    content: [
      { text: "The Real Estate (Regulation and Development) Act, 2016, commonly known as RERA, remains one of the most transformative reforms in India's property sector. As of 2026, RERA continues to evolve — strengthening transparency, accountability, and buyer protection in the real estate market." },
      { heading: 'Key Rights of Homebuyers Under RERA', text: "1. Timely Possession: Buyers are entitled to receive possession within the timeline promised in the agreement for sale.\n\n2. Right to Information: Every buyer can access complete project details, including sanctioned plans, approvals, and construction status, on the RERA portal.\n\n3. Right to Refund and Interest: If a developer fails to deliver on time, buyers can seek refund with interest under Section 18.\n\n4. Structural Safety: Developers are liable for structural defects for 5 years post-possession.\n\n5. Right to File a Complaint: Any grievance can be raised through the RERA portal with time-bound redressal." },
      { heading: 'Developer Obligations', text: "Developers must register projects before advertising or selling. They must deposit 70% of buyer funds in an escrow account, ensuring funds are used only for that project. Quarterly updates on construction status must be provided on the RERA portal. Failure to comply may lead to penalties including imprisonment or hefty fines under Section 59 of the RERA Act." },
      { heading: 'Protection Against Project Delays', text: "Under RERA Section 18, buyers can either withdraw and claim a full refund with interest, or continue with the project and claim compensation for delay. The compensation provision ensures developers pay an interest rate comparable to what they charge buyers for delayed payments." },
      { heading: 'Structural Defects After Possession', text: "Under RERA, the developer remains liable for structural defects for five years from the date of possession. Buyers can report any structural, workmanship, or quality defect during this period. The promoter must rectify the defect within 30 days. If not, the buyer is entitled to compensation under Section 18." },
      { heading: 'How to Check RERA Status', text: "Visit the official state RERA website. Search using the builder's name or project registration number. View approvals, sanctioned plans, completion percentage, and complaint history. Always verify RERA registration before booking any property." },
    ],
    related: ['india-housing-market-2026', 'home-loan-rules-2026', 'new-rent-rules-2026'],
  },
  'india-housing-market-2026': {
    tag: 'Market Analysis', tagColor: '#10b981', emoji: '📊',
    author: 'EasiLoan Research', authorRole: 'Housing Market Analyst',
    city: 'Bangalore', date: 'Apr 2026', readTime: '6 min read',
    title: "India's Housing Market Reality in 2026: What Every Young Buyer Must Know",
    summary: 'Home prices up 7% in major cities, affordable housing share drops to 18%, EMI-to-income at 40%. City-by-city breakdown for buyers.',
    source: 'EasiLoan.com', sourceUrl: 'https://www.easiloan.com/blog/india-housing-market-reality-2026',
    content: [
      { text: "India's residential market has entered a transformative but challenging phase. Property prices are rising, premium supply is increasing, and affordability pressure has intensified for first-time buyers. Forecasts indicate average home-price growth around 7.0% for 2026 in major cities, with NCR expected near 8.3% and Bengaluru/Chennai around 7%." },
      { heading: 'Affordability Crisis', text: "The share of affordable housing below ₹45 lakh has dropped from 38% in 2019 to just 18% in 2025, pushing many middle-income buyers out of practical purchase range. Prime micro-markets in Mumbai now command ₹15,000–25,000 per sqft. Bengaluru tech corridors have seen strong appreciation." },
      { heading: 'The Generational Split', text: "Millennials and Gen Z together account for roughly 90–95% of home purchases in recent market studies. Gen Z is entering ownership earlier, with strong preference for affordability, technology-ready homes, and flexibility. Millennials remain the largest buyer cohort, though affordability anxiety is high." },
      { heading: 'EMI vs Rent: The Financial Reality', text: "With repo-linked rates easing, home loan rates in 2026 generally range around 7.10% to 8.75% depending on lender and profile. Many middle-income households now face EMI-to-income near 40%, and in premium markets this can cross 50%. A safer benchmark is typically 30–35% of monthly take-home. Example: a ₹90 lakh loan at 8% for 20 years gives roughly ₹75,300 EMI per month." },
      { heading: 'City-by-City Breakdown', text: "Mumbai: ₹15K–25K/sqft, 2BHK rent ₹45K–70K/mo — lean towards renting.\n\nBengaluru: 2BHK ₹85L–120L, rents up post-pandemic — lean towards buying in suburbs.\n\nDelhi NCR: 8.3% expected growth — context-dependent.\n\nPune: Better value than Mumbai, IT corridor — lean towards buying.\n\nHyderabad: Rental yield around 3.9% — lean towards buying long term.\n\nChennai: 7% expected growth, yield around 4.16% — lean towards buying." },
      { heading: 'Home Loan Rates in 2026', text: "SBI: 7.25% (salaried). Bajaj Finserv: 7.15% (salaried). ICICI Bank: 7.45% (salaried). HDFC Bank: 8.15%+. Public sector banks average: 7.35%. Rental yields are still relatively low in most metros (commonly below 4%), so total return expectations often rely more on capital appreciation than rental cash flow." },
    ],
    related: ['home-loan-rules-2026', 'rera-buyer-rights', 'real-estate-trends-2026'],
  },
  'home-loan-rules-2026': {
    tag: 'Home Loans', tagColor: '#f97316', emoji: '🏦',
    author: 'Business Standard', authorRole: 'Financial News',
    city: 'Mumbai', date: 'Feb 2026', readTime: '5 min read',
    title: 'Home Loan Rates, EMIs and What Borrowers Should Watch for in 2026',
    summary: 'RBI holds repo rate at 5.25%, zero prepayment penalties, higher LTV ratios. What every home loan borrower must know in 2026.',
    source: 'Business-Standard.com', sourceUrl: 'https://www.business-standard.com/content/specials/home-loan-rates-emis-and-what-borrowers-should-watch-for-in-2026-126022300533_1.html',
    content: [
      { text: "The Reserve Bank of India (RBI) is likely to hold its repo rate at 5.25% through 2026, following cumulative reductions in 2025. This means home loan rates are expected to remain stable at current levels, offering predictability for borrowers." },
      { heading: 'Current Home Loan Rates', text: "As of early 2026, the lowest home loan rates start from 7.10% p.a. for borrowers with 750+ CIBIL scores, stable salaried income, and lower loan-to-value ratios. The typical range is 7.10%–13.00%+ depending on lender type and borrower profile. Women applicants typically get a 0.05% concession from SBI and several other lenders." },
      { heading: 'Zero Prepayment Penalties', text: "Effective from January 1, 2026: the RBI has banned prepayment penalties on all floating-rate home loans. You can now partially or fully prepay your loan at any time, using any source of funds, with no lock-in period. For a ₹50 lakh loan over 20 years, even a 0.25% rate reduction can save ₹3–4 lakh in total interest costs." },
      { heading: 'Higher LTV Ratios for Affordable Homes', text: "If the residence costs ₹30 lakh or less, you can now acquire a loan for up to 90% of its worth. Lenders can no longer include stamp duty or registration charges in the LTV ratio unless the property is worth less than ₹10 lakh. This makes it easier for first-time buyers to enter the market with a smaller down payment." },
      { heading: 'PMAY Urban 2.0 Subsidy', text: "The Interest Subsidy Scheme under PMAY-U 2.0 provides a 4% interest subsidy on the first ₹8 lakh of a home loan for up to 12 years. Maximum benefit: ₹1.80 lakh paid in five annual instalments of ₹36,000 each. Eligible for EWS (income up to ₹3L), LIG (₹3L–₹6L), and MIG (₹6L–₹9L) categories." },
      { heading: 'Tax Benefits', text: "Section 80C: up to ₹1.5 lakh deduction per year on principal repayment. Section 24(b): up to ₹2 lakh deduction on interest paid for self-occupied property. Section 80EEA: additional deductions for first-time buyers. Combined, these can meaningfully reduce your tax liability during the years when your EMI burden is heaviest." },
    ],
    related: ['india-housing-market-2026', 'rera-buyer-rights', 'real-estate-trends-2026'],
  },
  'real-estate-trends-2026': {
    tag: 'Market Trends', tagColor: '#6366f1', emoji: '📈',
    author: 'BusinessWorld Editorial', authorRole: 'Real Estate Analyst',
    city: 'Delhi', date: 'Apr 2026', readTime: '5 min read',
    title: 'Indian Real Estate 2026: From Momentum to Meaningful Growth',
    summary: 'Policy-aligned expansion, Tier-2 city surge, premium housing dominance, and disciplined execution define India\'s real estate in 2026.',
    source: 'BusinessWorld.in', sourceUrl: 'https://www.businessworld.in/article/indian-real-estate-2026-from-momentum-to-meaningful-growth-as-policy-capital-consumers-to-define-the-market-585319',
    content: [
      { text: "India's real estate market is transitioning from cyclical recovery to predictable, policy-aligned expansion. Stakeholders increasingly believe that disciplined execution and governance will matter more than aggressive land banking or speculative launches in 2026." },
      { heading: 'Premium Housing Dominates', text: "The residential sector experienced an increasing proportion of mid and premium segments, with prices in this category going up by 6–10%. Sales of homes priced above ₹10 million recorded 14% growth and accounted for 50% of total annual sales, underscoring the continued premiumisation of housing demand." },
      { heading: 'Tier-2 Cities Surge', text: "Growth is no longer confined to traditional markets like Mumbai, Delhi-NCR, and Bengaluru. Tier-II cities such as Lucknow, Indore, Coimbatore, and Jaipur are seeing 20–25% demand growth, supported by expressways, metro connectivity, and infrastructure-led development." },
      { heading: 'Commercial Real Estate Resilient', text: "The commercial real estate segment remained resilient, with office leasing touching 65–70 million square feet, driven primarily by IT firms, Global Capability Centres (GCCs), and flexible workspace operators. Institutional investments in 2026 are estimated at $6–7 billion, largely directed toward office assets, warehousing, and data centres." },
      { heading: 'Developers Focus on Delivery', text: "Developers appear more cautious than in the past. New launches are largely controlled, with an increased focus on completing under-construction projects and ensuring timely delivery — a critical factor in rebuilding buyer confidence. Rising land, construction material, and labour costs mean some cost burden will inevitably be passed on to buyers." },
      { heading: 'Where to Invest in 2026', text: "Office spaces backed by GCC demand, warehousing linked to infrastructure corridors, and data centres driven by AI and cloud computing are expected to be key growth drivers. Long-term residential returns of 8–10% remain achievable in locations benefiting from sustained infrastructure development." },
    ],
    related: ['india-housing-market-2026', 'home-loan-rules-2026', 'best-cities-investment'],
  },
  'best-cities-investment': {
    tag: 'Investment Guide', tagColor: '#ec4899', emoji: '🌆',
    author: 'Sobha Editorial', authorRole: 'Real Estate Research',
    city: 'Bangalore', date: 'Apr 2026', readTime: '6 min read',
    title: '12 Best Cities for Real Estate Investment in India 2025-26',
    summary: 'Bangalore (6% yield), Hyderabad (8.5% appreciation), Pune (8% yield), Gurgaon (17.2% YOY) — data-driven city guide for investors.',
    source: 'Sobha.com', sourceUrl: 'https://www.sobha.com/blog/best-cities-for-real-estate-investment-in-india/',
    content: [
      { text: "India's real estate market is witnessing unprecedented growth, driven by rapid urbanisation, a growing economy, and rising demand across sectors. Choosing the right location for investment has never been more important." },
      { heading: 'Bangalore — Silicon Valley of India', text: "Bangalore contributes significantly to India's GDP with an annual growth rate of about 8.5%. It has excellent rental yields up to 6%. Continuous infrastructure development such as Namma Metro expansion enhances connectivity. Popular areas: ORR, Sarjapur Road, Electronic City, and Hebbal." },
      { heading: 'Hyderabad — High Appreciation Potential', text: "The city's real estate market benefits from strong demand in IT hubs like Gachibowli, HITEC City, and Kondapur. Ongoing infrastructure projects like Hyderabad Metro expansion and Airport Metro Corridor are enhancing connectivity. Offers 8.5% year-on-year appreciation and rental yields of up to 5%." },
      { heading: 'Pune — IT and Education Hub', text: "Pune has witnessed significant real estate growth driven by high demand in Hinjawadi, Baner, Kothrud, and Kharadi. With an average annual growth rate of 5.5%, Pune offers excellent rental yields up to 8% — among the highest in India." },
      { heading: 'Gurgaon and Noida — NCR Powerhouses', text: "Gurgaon offers 17.2% YOY price appreciation with areas like Golf Course Road and Dwarka Expressway seeing significant development. Noida is experiencing strong growth due to the upcoming Noida International Airport. Areas like Sector 108 have seen property price increases of 19.6% annually." },
      { heading: 'Emerging Cities Worth Watching', text: "Coimbatore: 16.7% year-on-year price appreciation, rental yields up to 5%. Indore: Super Corridor properties up 16.7% YOY. Kochi: Rental yields 3–5%, boosted by Kochi Metro and Water Metro expansion. Trivandrum: Up to 4% rental yields, driven by Technopark and Digital Science Park expansion." },
    ],
    related: ['real-estate-trends-2026', 'india-housing-market-2026', 'home-loan-rules-2026'],
  },
};

export const articleList = [
  { slug: 'new-rent-rules-2026', tag: 'Rental Guide', tagColor: '#f59e0b', emoji: '🔑', bg: 'linear-gradient(135deg,#fef3c722,#fde68a22)' },
  { slug: 'tenant-landlord-balance', tag: 'Legal Guide', tagColor: '#06b6d4', emoji: '⚖️', bg: 'linear-gradient(135deg,#cffafe22,#a5f3fc22)' },
  { slug: 'rera-buyer-rights', tag: 'Legal Guide', tagColor: '#8b5cf6', emoji: '🏛️', bg: 'linear-gradient(135deg,#ede9fe22,#ddd6fe22)' },
  { slug: 'india-housing-market-2026', tag: 'Market Analysis', tagColor: '#10b981', emoji: '📊', bg: 'linear-gradient(135deg,#d1fae522,#a7f3d022)' },
  { slug: 'home-loan-rules-2026', tag: 'Home Loans', tagColor: '#f97316', emoji: '🏦', bg: 'linear-gradient(135deg,#ffedd522,#fed7aa22)' },
  { slug: 'real-estate-trends-2026', tag: 'Market Trends', tagColor: '#6366f1', emoji: '📈', bg: 'linear-gradient(135deg,#e0e7ff22,#c7d2fe22)' },
  { slug: 'best-cities-investment', tag: 'Investment Guide', tagColor: '#ec4899', emoji: '🌆', bg: 'linear-gradient(135deg,#fce7f322,#fbcfe822)' },
];

export const relatedTitles: Record<string, string> = {
  'new-rent-rules-2026': 'New Rent Rules 2026',
  'tenant-landlord-balance': 'Tenant vs Landlord: New Rental Rules',
  'rera-buyer-rights': 'Buyer Rights Under RERA 2026',
  'india-housing-market-2026': 'India Housing Market Reality 2026',
  'home-loan-rules-2026': 'Home Loan Rates & Rules 2026',
  'real-estate-trends-2026': 'Indian Real Estate Trends 2026',
  'best-cities-investment': '12 Best Cities for Investment',
};

