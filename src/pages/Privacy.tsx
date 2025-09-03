import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import buxtaxLogo from "@/assets/buxtax-logo.svg";

export default function Privacy() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => {
              if (!user) {
                navigate("/signin");
                return;
              }
              const hasActivePayment = profile?.payment_status === "active";
              navigate(hasActivePayment ? "/app" : "/#pricing");
            }}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Calculator
          </Button>
          <div className="flex justify-center mb-6">
            <img src={buxtaxLogo} alt="BuxTax Logo" className="h-16 w-auto" />
          </div>
        </div>

        {/* Privacy Content */}
        <div className="bg-card rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-muted-foreground mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-6 text-sm leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold mb-3">
                1. Information We Collect
              </h2>
              <p>
                BuxTax collects minimal information to provide and improve our
                service:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>
                  <strong>Usage Data:</strong> Anonymous analytics to understand
                  how users interact with our calculator
                </li>
                <li>
                  <strong>Local Storage:</strong> Your preferences (user type,
                  calculations) are stored locally in your browser
                </li>
                <li>
                  <strong>CSV Data:</strong> When you upload payout data, it's
                  processed locally and not stored on our servers
                </li>
                <li>
                  <strong>Technical Information:</strong> Browser type, device
                  information, and IP address for service optimization
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                2. How We Use Your Information
              </h2>
              <p>We use the collected information for:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Providing and maintaining the BuxTax calculator service</li>
                <li>
                  Improving our calculation algorithms and user experience
                </li>
                <li>Analyzing usage patterns to enhance functionality</li>
                <li>Responding to user support requests</li>
                <li>Ensuring the security and integrity of our service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                3. Data Storage and Security
              </h2>
              <p>
                <strong>Local Storage:</strong> Your calculation data and
                preferences are stored locally in your browser using
                localStorage. This data never leaves your device and is not
                transmitted to our servers.
              </p>
              <p className="mt-2">
                <strong>CSV Processing:</strong> When you upload CSV files for
                payout analysis, all processing happens locally in your browser.
                The files are not uploaded to our servers.
              </p>
              <p className="mt-2">
                <strong>Analytics:</strong> We use anonymous analytics to
                understand usage patterns. No personal or financial data is
                collected through analytics.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                4. Information Sharing
              </h2>
              <p>
                We do not sell, trade, or otherwise transfer your information to
                third parties. We may share information only in the following
                circumstances:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and safety</li>
                <li>
                  With service providers who assist in operating our website
                  (analytics only)
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                5. Cookies and Tracking
              </h2>
              <p>BuxTax uses minimal cookies and tracking technologies:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>
                  <strong>Essential Cookies:</strong> Required for basic website
                  functionality
                </li>
                <li>
                  <strong>Analytics Cookies:</strong> Anonymous usage statistics
                  to improve our service
                </li>
                <li>
                  <strong>No Third-Party Tracking:</strong> We do not use
                  advertising or third-party tracking cookies
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
              <p>You have the following rights regarding your data:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>
                  <strong>Access:</strong> Request information about what data
                  we have about you
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your data
                  (note: local storage data is controlled by you)
                </li>
                <li>
                  <strong>Correction:</strong> Request correction of inaccurate
                  data
                </li>
                <li>
                  <strong>Portability:</strong> Request a copy of your data in a
                  portable format
                </li>
                <li>
                  <strong>Opt-out:</strong> Disable analytics tracking at any
                  time
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Data Retention</h2>
              <p>
                <strong>Analytics Data:</strong> Anonymous usage data is
                retained for up to 2 years for service improvement purposes.
              </p>
              <p className="mt-2">
                <strong>Local Storage:</strong> Data stored in your browser
                remains until you clear your browser data or we update our
                storage structure.
              </p>
              <p className="mt-2">
                <strong>Support Communications:</strong> Email communications
                are retained for up to 3 years for customer service purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                8. Children's Privacy
              </h2>
              <p>
                BuxTax is not intended for children under 13. We do not
                knowingly collect personal information from children under 13.
                If you are a parent or guardian and believe your child has
                provided us with personal information, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                9. International Data Transfers
              </h2>
              <p>
                BuxTax is hosted and operated in the United States. If you are
                accessing our service from outside the United States, please be
                aware that your information may be transferred to, stored, and
                processed in the United States where our servers are located.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                10. Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. We will
                notify you of any changes by posting the new Privacy Policy on
                this page and updating the "Last updated" date. You are advised
                to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please
                contact us at{" "}
                <a
                  href="mailto:support@bux.tax"
                  className="text-primary hover:underline"
                >
                  support@bux.tax
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                12. California Privacy Rights
              </h2>
              <p>
                If you are a California resident, you have additional rights
                under the California Consumer Privacy Act (CCPA). You may
                request information about our data collection practices and
                request deletion of your personal information. Contact us at
                support@bux.tax to exercise these rights.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
