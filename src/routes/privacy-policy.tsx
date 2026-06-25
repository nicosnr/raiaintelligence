import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy-policy")({
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background px-4 pb-32 pt-6">
      {/* Back button */}
      <Link to="/settings" className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" /> Back to Settings
      </Link>

      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Legal</p>
      <h1 className="font-serif text-3xl italic mt-1 mb-1">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Effective date: June 2025 · Governed by Kenyan law</p>

      <div className="space-y-8 text-sm leading-relaxed text-foreground">

        <section>
          <h2 className="font-semibold text-base mb-2">1. Who We Are</h2>
          <p>CivicIntel is a civic education platform providing news summaries, explainers, and AI-assisted civic guidance to Kenyan citizens. We are not a law firm, financial institution, or political organisation. Our content is educational only.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">2. Data We Collect</h2>
          <ul className="space-y-2 list-disc pl-4">
            <li><strong>Account data:</strong> Your display name and email address when you register.</li>
            <li><strong>Usage data:</strong> Pages visited, explainers read, polls answered — used to personalise your learning progress.</li>
            <li><strong>Device data:</strong> Browser type, operating system, and screen size for compatibility purposes.</li>
            <li><strong>AI chat content:</strong> Messages you send to CivicIntel AI are processed in real time but are not stored on our servers after your session ends.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">3. How We Use Your Data</h2>
          <ul className="space-y-2 list-disc pl-4">
            <li>To personalise your civic learning progress and track topics you have completed.</li>
            <li>To show you relevant news summaries and explainers.</li>
            <li>To run non-partisan community polls.</li>
            <li>To improve the quality and performance of the app.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">4. Data We Do NOT Collect</h2>
          <p>We do <strong>not</strong> sell your personal data. We do <strong>not</strong> use your data for political targeting. We do <strong>not</strong> share your data with political parties, election campaigns, or government agencies unless compelled by a valid Kenyan court order.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">5. AI Chat Privacy</h2>
          <p>Conversations with CivicIntel AI are sent to Anthropic's API for processing. We do not store chat logs after your session ends. Please do not share personal identifying information, specific case details, or sensitive legal matters in the chat. The AI is an educational tool, not a confidential legal service.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">6. Third-Party Services</h2>
          <ul className="space-y-2 list-disc pl-4">
            <li><strong>Supabase</strong> — database and authentication, hosted on EU servers (eu-west-1).</li>
            <li><strong>Anthropic</strong> — AI processing for the Ask CivicIntel feature.</li>
            <li><strong>Google</strong> — optional OAuth sign-in only.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">7. Your Rights Under Kenyan Law</h2>
          <p>Under the <strong>Data Protection Act, 2019 (Kenya)</strong> and the Data Protection (General) Regulations, 2021, you have the right to:</p>
          <ul className="space-y-2 list-disc pl-4 mt-2">
            <li>Access the personal data we hold about you.</li>
            <li>Correct inaccurate personal data.</li>
            <li>Request deletion of your personal data.</li>
            <li>Object to processing of your data.</li>
          </ul>
          <p className="mt-2">To exercise these rights, contact us at <strong>civicintel.ke@gmail.com</strong>. We respond within 21 days as required by law.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">8. Cookies</h2>
          <p>We use only essential cookies required for authentication and keeping you logged in. We do not use advertising cookies, tracking pixels, or third-party analytics cookies.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">9. Children</h2>
          <p>CivicIntel is not directed at children under 13 years of age. We do not knowingly collect personal data from minors. If you believe a child has registered, contact us and we will delete the account promptly.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">10. Data Security</h2>
          <p>All data in transit is encrypted using TLS. Passwords are never stored in plain text — authentication is managed by Supabase Auth using secure hashing. Database access requires valid authentication tokens.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">11. Data Retention</h2>
          <p>Account and progress data is retained until you delete your account. Upon deletion, your data is removed within 30 days. AI chat logs are not retained beyond your active session.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">12. Breach Notification</h2>
          <p>In the event of a data breach affecting your personal data, we will notify you and the Office of the Data Protection Commissioner (ODPC) within 72 hours as required by the Kenya Data Protection Act.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">13. Changes to This Policy</h2>
          <p>We will notify users of material changes to this policy via an in-app notice at least 7 days before changes take effect.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">14. Contact</h2>
          <p>Email: <strong>civicintel.ke@gmail.com</strong></p>
          <p className="mt-1">Nairobi, Kenya</p>
        </section>

      </div>
    </div>
  );
}
