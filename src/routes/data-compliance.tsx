import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/data-compliance")({
  component: DataCompliance,
});

function DataCompliance() {
  return (
    <div className="min-h-screen bg-background px-4 pb-32 pt-6">
      <Link to="/settings" className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" /> Back to Settings
      </Link>

      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Legal</p>
      <h1 className="font-serif text-3xl italic mt-1 mb-1">Data & Compliance</h1>
      <p className="text-sm text-muted-foreground mb-8">Effective date: June 2025 · Kenya Data Protection Act 2019</p>

      <div className="space-y-8 text-sm leading-relaxed text-foreground">

        <section>
          <h2 className="font-semibold text-base mb-2">1. Kenya Data Protection Act 2019</h2>
          <p>CivicIntel is committed to complying with the <strong>Data Protection Act, 2019 (Kenya)</strong> and the Data Protection (General) Regulations, 2021. We are in the process of notifying the Office of the Data Protection Commissioner (ODPC) as required for data processors handling personal data of Kenyan residents.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">2. Data Residency</h2>
          <p>User account data and app content are stored on <strong>Supabase</strong> servers located in the EU (eu-west-1 region). Supabase complies with GDPR, which meets or exceeds the standards required by the Kenya Data Protection Act for cross-border data transfers.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">3. AI Data Processing</h2>
          <p>Civic chat queries entered by users are processed by <strong>Google Gemini</strong> under Google's commercial API terms. CivicIntel does not retain or log chat content after a session ends. Google Gemini's data processing practices are governed by Google's published privacy policy.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">4. No Government Data Sharing</h2>
          <p>We do not share user data with government agencies, law enforcement bodies, or political entities except where compelled by a valid order of a Kenyan court of competent jurisdiction. In such cases, we will notify the affected user unless prohibited from doing so by the court order or applicable law.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">5. Security Measures</h2>
          <ul className="space-y-2 list-disc pl-4">
            <li>Passwords are never stored in plain text. Authentication is managed by Supabase Auth using industry-standard secure hashing (bcrypt).</li>
            <li>All data in transit between your device and our servers is encrypted using TLS 1.2 or higher.</li>
            <li>Database access requires valid authentication tokens — no direct public access to raw data.</li>
            <li>Row-level security (RLS) policies are enforced at the database level to ensure users can only access their own data.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">6. Data Retention Policy</h2>
          <ul className="space-y-2 list-disc pl-4">
            <li><strong>Account data</strong> (name, email): retained until you delete your account.</li>
            <li><strong>Progress data</strong> (topics learned, poll votes): retained until account deletion, then removed within 30 days.</li>
            <li><strong>AI chat logs</strong>: not retained. Sessions are stateless and no conversation history is stored server-side.</li>
            <li><strong>Usage analytics</strong>: retained in aggregated, anonymised form for up to 12 months.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">7. Your Rights</h2>
          <p>Under the Kenya Data Protection Act 2019, you have the right to:</p>
          <ul className="space-y-2 list-disc pl-4 mt-2">
            <li><strong>Access</strong> — request a copy of your personal data.</li>
            <li><strong>Rectification</strong> — correct inaccurate or incomplete data.</li>
            <li><strong>Erasure</strong> — request deletion of your personal data.</li>
            <li><strong>Portability</strong> — receive your data in a structured, machine-readable format.</li>
            <li><strong>Objection</strong> — object to processing of your data.</li>
          </ul>
          <p className="mt-2">To exercise any of these rights, email <strong>civicintel.ke@gmail.com</strong>. We will respond within 21 days as required by law.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">8. Breach Notification</h2>
          <p>In the event of a personal data breach that is likely to result in risk to your rights and freedoms, we will:</p>
          <ul className="space-y-2 list-disc pl-4 mt-2">
            <li>Notify the Office of the Data Protection Commissioner (ODPC) within <strong>72 hours</strong> of becoming aware of the breach.</li>
            <li>Notify affected users without undue delay, describing the nature of the breach, likely consequences, and measures taken.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">9. Complaints</h2>
          <p>If you believe we have handled your data unlawfully, you have the right to lodge a complaint with the <strong>Office of the Data Protection Commissioner (ODPC)</strong> of Kenya at <strong>www.odpc.go.ke</strong>.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">10. Contact for Data Requests</h2>
          <p>Email: <strong>civicintel.ke@gmail.com</strong></p>
          <p className="mt-1">Nairobi, Kenya</p>
        </section>

      </div>
    </div>
  );
}
