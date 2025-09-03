import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { CalculatorLite } from "@/components/CalculatorLite";
import { Button } from "@/components/ui/button";
import { robuxToUsd } from "@/utils/devex";
import { handleUpgrade } from "@/components/Paywall";

export default function CalculatorPage() {
  const [robux, setRobux] = useState<number>(0);
  const usd = useMemo(() => robuxToUsd(robux), [robux]);

  useEffect(() => {
    document.title = "BuxTax Calculator — Robux to USD (DevEx)";
    const canonicalHref = "https://bux.tax/calculator";

    function setMeta(name: string, content: string) {
      let tag = document.querySelector(
        `meta[name='${name}']`
      ) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    }

    function setProperty(property: string, content: string) {
      let tag = document.querySelector(
        `meta[property='${property}']`
      ) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    }

    let link = document.querySelector(
      "link[rel='canonical']"
    ) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", canonicalHref);

    setMeta(
      "description",
      "Enter Robux to see instant USD after DevEx — no sign-in."
    );
    setProperty("og:title", "BuxTax Calculator — Robux to USD (DevEx)");
    setProperty(
      "og:description",
      "Enter Robux to see instant USD after DevEx — no sign-in."
    );
    setProperty("og:url", canonicalHref);
    setProperty("twitter:title", "BuxTax Calculator — Robux to USD (DevEx)");
    setProperty(
      "twitter:description",
      "Enter Robux to see instant USD after DevEx — no sign-in."
    );
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <main className="container mx-auto px-4 py-14">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-10 border border-royal/10 space-y-5">
          <h1 className="font-rounded font-black text-3xl text-royal">
            BuxTax Calculator
          </h1>

          <CalculatorLite
            source="calculator"
            autoFocusInput
            onValueChange={(r) => setRobux(r)}
          />
        </div>

        <div className="max-w-2xl mx-auto mt-6 text-center text-sm text-muted-foreground">
          Unlock the full dashboard: add expenses & group splits, set goals,
          export CSV, and track payouts — no recurring fees.
        </div>

        <div className="max-w-2xl mx-auto mt-6 flex flex-col sm:flex-row gap-3 items-center">
          <Button
            className="w-full bg-royal hover:bg-royal/90"
            onClick={() => handleUpgrade("lifetime")}
          >
            Get BuxTax — Lifetime $39
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              navigator.clipboard
                .writeText(`https://bux.tax/calculator?r=${robux || 0}`)
                .then(() =>
                  console.debug(
                    "Link copied",
                    `https://bux.tax/calculator?r=${robux || 0}`
                  )
                )
            }
          >
            Copy link to this result
          </Button>
        </div>
      </main>
    </div>
  );
}
