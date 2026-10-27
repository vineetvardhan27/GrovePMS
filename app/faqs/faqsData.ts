export interface FAQItem {
  q: string;
  a: string;
}

export const faqsData: FAQItem[] = [
  {
    q: 'What is a hotel PMS?',
    a: 'A Property Management System (PMS) is the core operational software that hotels use to coordinate daily workflows — including room inventory, front desk check-ins, reservations, guest ledgers, billing, housekeeping status, and financial reporting.',
  },
  {
    q: 'What can Grove manage?',
    a: 'Grove manages front desk operations, reservations, room matrix, guest profiles, consolidated billing & folios, GST invoices, multi-mode payments (Cash, UPI, Card), restaurant & bar KOTs, banquet/event packages, housekeeping turnaround tracking, inventory consumption, and owner management reports.',
  },
  {
    q: 'Can multiple hotels use the platform?',
    a: 'Yes. Grove is a multi-tenant platform where multiple independent hotel properties operate concurrently. Each hotel has its own dedicated workspace, staff team, and configuration.',
  },
  {
    q: 'How does hotel data isolation work?',
    a: 'Data isolation is enforced at the database level using PostgreSQL Row-Level Security (RLS). Every query automatically scopes data to the authenticated staff member’s hotel_id, ensuring zero data crossover between different properties.',
  },
  {
    q: 'Can hotel owners create staff accounts?',
    a: 'Yes. The hotel owner provisions operational staff accounts directly from Settings → Staff / Users. Public registration for staff is disabled to maintain strict property access control.',
  },
  {
    q: 'What staff roles are supported?',
    a: 'Grove supports four distinct roles: Owner (full property configuration & reports), Manager (operational oversight & daily reporting), Reception (check-ins, check-outs, room matrix & folios), and Housekeeping (room turnaround & cleaning statuses).',
  },
  {
    q: 'Does the PMS support hotel billing and GST invoices?',
    a: 'Yes. Grove automatically calculates room tariffs, food charges, extra amenities, and applicable GST slabs (e.g. 12%, 18%). It produces sequential GST-compliant invoices with CGST/SGST/IGST breakdowns and provides monthly summaries for tax filing.',
  },
  {
    q: 'Does the PMS support F&B billing?',
    a: 'Yes. The Food & Beverage module handles table orders, Kitchen Order Tickets (KOT), room charge postings directly to guest folios, and standalone restaurant walk-in bills.',
  },
  {
    q: 'Does it include housekeeping turnaround management?',
    a: 'Yes. Housekeeping staff can view and update room statuses in real-time — transitioning rooms between Dirty, In-Progress, Inspected, and Clean & Available.',
  },
  {
    q: 'Does it support banquet and event management?',
    a: 'Yes. The Banquet module handles hall bookings, catering packages, event decor, stage/audio charges, advance deposits, and dedicated event invoicing.',
  },
  {
    q: 'Can I register a new hotel on Grove PMS?',
    a: 'Yes. New property owners can sign up via the Register Hotel flow to initialize their hotel property, configure room categories, and begin managing operations immediately.',
  },
  {
    q: 'How do I access my PMS account?',
    a: 'Staff and owners access their property via the Sign In portal using their verified email and password. The system automatically verifies your staff role and opens your hotel workspace.',
  },
];
