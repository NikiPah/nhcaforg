"use client";

import Script from "next/script";
import { useState } from "react";

/*
 * Official Zeffy donation-form embed, adapted for React/Next.js.
 *
 * - Zeffy's script turns the [data-zeffy-embed] placeholder into Zeffy's own
 *   secure, auto-resizing iframe. All donor and payment data is entered inside
 *   that iframe on zeffy.com; this site never sees, proxies, stores, or logs it.
 * - next/script inserts the script at most once per browser session (it
 *   deduplicates by src), instead of relying on <script> inside innerHTML,
 *   which never executes.
 * - On its first load the script scans the page by itself. When this
 *   component mounts again later (for example after client-side navigation
 *   back to /donate), the script is already present and will not run again,
 *   so onReady calls the script's public `window.Zeffy.embed.init()`, which
 *   initializes any placeholder not yet marked [data-zeffy-initialized].
 *   Calling it after the first load is a harmless no-op.
 * - If the script fails to load, or `init` is ever missing, the official
 *   fallback iframe is shown instead (mirroring Zeffy's own onerror handler).
 */

const ZEFFY_SCRIPT_SRC = "https://www.zeffy.com/embed/v2/zeffy-embed.js";
const ZEFFY_FORM_PATH = "/embed/donation-form/support-cancer-patients-through-nhcaf";
const ZEFFY_FALLBACK_SRC = `https://www.zeffy.com${ZEFFY_FORM_PATH}`;

declare global {
  interface Window {
    Zeffy?: { embed?: { init?: () => void } };
  }
}

// Legacy iframe attributes from the official snippet that React does not type.
const legacyIframeAttrs = { allowpaymentrequest: "", allowtransparency: "true" };

export function ZeffyEmbed() {
  const [showFallback, setShowFallback] = useState(false);

  // Runs after the script first loads AND on every later mount while it is loaded.
  const initialize = () => {
    const init = window.Zeffy?.embed?.init;
    if (typeof init !== "function") {
      setShowFallback(true);
      return;
    }
    try {
      init();
    } catch {
      setShowFallback(true);
    }
  };

  return (
    <div>
      {!showFallback && <div data-zeffy-embed="" data-form-url={ZEFFY_FORM_PATH} />}

      {showFallback && (
        <div data-zeffy-embed-fallback="">
          {/* A fixed-height iframe cannot auto-resize, so it is sized to the
              viewport (scrollable inside) and kept usable on small screens. */}
          <div className="relative h-[85svh] max-h-[960px] min-h-[600px] w-full overflow-hidden">
            <iframe
              title="Donation form powered by Zeffy"
              src={ZEFFY_FALLBACK_SRC}
              data-zeffy-embed-src={ZEFFY_FALLBACK_SRC}
              className="absolute inset-0 h-full w-full border-0"
              allow="payment"
              {...legacyIframeAttrs}
            />
          </div>
        </div>
      )}

      <Script
        id="zeffy-embed"
        src={ZEFFY_SCRIPT_SRC}
        strategy="afterInteractive"
        onReady={initialize}
        onError={() => setShowFallback(true)}
      />
    </div>
  );
}
