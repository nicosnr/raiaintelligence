import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/terms-of-service")({
  component: TermsOfService,
});

function TermsOfService() {
  return (
    <div className="min-h-screen bg-background px-4 pb-32 pt-6">
      <Link to="/settings" className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" /> Back to Settings
      </Link>

      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Legal</p>
      <h1 className="font-serif text-3xl italic mt-1 mb-1">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-8">Effective date: June 2025 · Governed by the laws of Kenya</p>

      <div className="space-y-8 text-sm leading-relaxed text-foreground">

        <section>
          <h2 className="font-semibold text-base mb-2">1. Acceptance</h2>
          <p>By downloading, accessing, or using CivicIntel, you agree to be bound by these Terms of Service. If you do not agree, please do not use the app.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">2. Description of Service</h2>
          <p>CivicIntel provides civic education content including news summaries, explainers, AI-assisted civic guidance, public service information, and community polls. It is an educational tool only and does not constitute professional advice of any kind.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">3. Not Legal Advice</h2>
          <p>Nothing on CivicIntel constitutes legal advice. CivicIntel AI is an educational chatbot, not a licensed advocate. For advice on your specific legal situation, please consult a qualified advocate licensed in Kenya. Do not make legal decisions based solely on content from this app.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">4. Not Financial Advice</h2>
          <p>The Economy and Civic Wallet features show illustrative public finance data only. Nothing in the app constitutes financial planning, investment, tax, or accounting advice. All figures are indicative and sourced from public data.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">5. Not Political Commentary</h2>
          <p>CivicIntel is strictly non-partisan. We do not endorse any political party, candidate, ideology, or position. News summaries are factual, attributed to original sources, and written to be neutral. If you believe any content is politically biased, please report it to us.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">6. User Accounts</h2>
          <ul className="space-y-2 list-disc pl-4">
            <li>You must provide accurate registration information.</li>
            <li>You are responsible for maintaining the security of your account and password.</li>
            <li>You must be 13 years or older to create an account.</li>
            <li>You may not create accounts on behalf of other people without their permission.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">7. Acceptable Use</h2>
          <p>You agree not to use CivicIntel to:</p>
          <ul className="space-y-2 list-disc pl-4 mt-2">
            <li>Spread misinformation or disinformation about civic or political matters.</li>
            <li>Harass, intimidate, or abuse other users.</li>
            <li>Attempt to manipulate poll results through fake accounts or automated voting.</li>
            <li>Scrape, copy, or republish our original content for commercial purposes.</li>
            <li>Reverse-engineer, decompile, or attempt to extract the source code of the app.</li>
            <li>Use the app in any way that violates Kenyan law or applicable international law.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">8. Content Ownership</h2>
          <p>News summaries are our original editorial work based on publicly available sources and are always attributed. Explainer content is original educational material created by the CivicIntel team. AI chat responses are generated dynamically — we do not warrant their complete accuracy and they do not constitute legal or professional opinions.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">9. Intellectual Property</h2>
          <p>The CivicIntel name, logo, visual design, and all original content are our intellectual property protected under the Copyright Act (Kenya), Cap 130. You may not reproduce, redistribute, or commercialise them without prior written permission from us.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">10. Third-Party Links</h2>
          <p>We link to original news sources and external websites for attribution. We are not responsible for the content, accuracy, or privacy practices of third-party websites. Links do not imply endorsement.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">11. Limitation of Liability</h2>
          <p>CivicIntel is provided "as is" without warranties of any kind. To the fullest extent permitted by Kenyan law, we are not liable for:</p>
          <ul className="space-y-2 list-disc pl-4 mt-2">
            <li>Decisions made based on content in the app.</li>
            <li>Inaccuracies in AI-generated responses.</li>
            <li>Temporary unavailability of the service.</li>
            <li>Loss of data due to technical failures.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">12. Governing Law</h2>
          <p>These Terms are governed by and construed in accordance with the laws of the Republic of Kenya. Any disputes arising from these Terms or your use of CivicIntel shall be subject to the exclusive jurisdiction of the courts of Nairobi, Kenya.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">13. Termination</h2>
          <p>We reserve the right to suspend or terminate accounts that violate these Terms, without notice. You may delete your account at any time from the Profile screen.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">14. Changes to These Terms</h2>
          <p>We may update these Terms from time to time. We will notify you of material changes via in-app notice. Continued use of CivicIntel after changes constitutes acceptance of the new Terms.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">15. Contact</h2>
          <p>Email: <strong>civicintel.ke@gmail.com</strong></p>
          <p className="mt-1">Nairobi, Kenya</p>
        </section>

      </div>
    </div>
  );
}
