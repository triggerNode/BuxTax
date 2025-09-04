import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
const buxtaxLogoPath = "/brand/buxtax-logo.svg";

export default function Terms() {
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
            <img
              src={buxtaxLogoPath}
              alt="BuxTax Logo"
              className="h-16 w-auto"
            />
          </div>
        </div>

        {/* Terms Content */}
        <div className="bg-card rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
          <p className="text-muted-foreground mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-6 text-sm leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold mb-3">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing and using BuxTax ("the Service"), you accept and
                agree to be bound by the terms and provision of this agreement.
                If you do not agree to abide by the above, please do not use
                this service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                2. Description of Service
              </h2>
              <p>
                BuxTax is a Roblox creator earnings calculator that helps game
                developers and UGC creators estimate their USD payouts after
                Roblox's fees and taxes. The service provides:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>
                  Profit calculation tools for Game Developers and UGC Creators
                </li>
                <li>Goal seeking functionality for earnings targets</li>
                <li>Payout analysis and CSV data processing</li>
                <li>Real-time calculation of effective take rates</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Use License</h2>
              <p>
                Permission is granted to temporarily use BuxTax for personal,
                non-commercial transitory viewing only. This is the grant of a
                license, not a transfer of title, and under this license you may
                not:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Modify or copy the materials</li>
                <li>
                  Use the materials for any commercial purpose or for any public
                  display
                </li>
                <li>
                  Attempt to reverse engineer any software contained on BuxTax
                </li>
                <li>
                  Remove any copyright or other proprietary notations from the
                  materials
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Disclaimer</h2>
              <p>
                The materials on BuxTax are provided on an 'as is' basis. BuxTax
                makes no warranties, expressed or implied, and hereby disclaims
                and negates all other warranties including without limitation,
                implied warranties or conditions of merchantability, fitness for
                a particular purpose, or non-infringement of intellectual
                property or other violation of rights.
              </p>
              <p className="mt-2">
                <strong>Important:</strong> All calculations are estimates based
                on current Roblox policies and exchange rates. Actual payouts
                may vary. BuxTax is not affiliated with Roblox Corporation and
                does not guarantee the accuracy of calculations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Limitations</h2>
              <p>
                In no event shall BuxTax or its suppliers be liable for any
                damages (including, without limitation, damages for loss of data
                or profit, or due to business interruption) arising out of the
                use or inability to use the materials on BuxTax, even if BuxTax
                or a BuxTax authorized representative has been notified orally
                or in writing of the possibility of such damage.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                6. Accuracy of Materials
              </h2>
              <p>
                The materials appearing on BuxTax could include technical,
                typographical, or photographic errors. BuxTax does not warrant
                that any of the materials on its website are accurate, complete
                or current. BuxTax may make changes to the materials contained
                on its website at any time without notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Links</h2>
              <p>
                BuxTax has not reviewed all of the sites linked to its website
                and is not responsible for the contents of any such linked site.
                The inclusion of any link does not imply endorsement by BuxTax
                of the site. Use of any such linked website is at the user's own
                risk.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Modifications</h2>
              <p>
                BuxTax may revise these terms of service for its website at any
                time without notice. By using this website you are agreeing to
                be bound by the then current version of these Terms of Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Governing Law</h2>
              <p>
                These terms and conditions are governed by and construed in
                accordance with the laws and you irrevocably submit to the
                exclusive jurisdiction of the courts in that location.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                10. Contact Information
              </h2>
              <p>
                If you have any questions about these Terms of Service, please
                contact us at{" "}
                <a
                  href="mailto:support@bux.tax"
                  className="text-primary hover:underline"
                >
                  support@bux.tax
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
