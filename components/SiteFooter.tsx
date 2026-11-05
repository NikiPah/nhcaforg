import { CurrentYear } from "@/components/CurrentYear";
import { LogoMark } from "@/components/SiteHeader";

const ORG_NAME = "North Houston Cancer Assistance Foundation";

// Shared site footer, used by every page.
export function SiteFooter() {
  return (
    <footer className="bg-teal-950 text-teal-100">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <LogoMark className="h-11 w-11 shrink-0" />
            <div>
              <p className="font-serif text-lg font-semibold text-white">{ORG_NAME}</p>
              <p className="mt-1">IRS-recognized 501(c)(3) public charity</p>
              <p>Spring, Texas</p>
            </div>
          </div>
          <ul className="flex flex-col gap-2 text-sm md:items-end" aria-label="Legal">
            <li>
              Privacy Policy <span className="text-teal-100/70">— Coming Soon</span>
            </li>
            <li>
              Terms <span className="text-teal-100/70">— Coming Soon</span>
            </li>
          </ul>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-sm text-teal-100/80">
          <p>
            © <CurrentYear /> {ORG_NAME}. All rights reserved.
          </p>
          <p className="mt-2">
            NHCAF is a charitable organization and does not provide medical treatment or healthcare
            services.
          </p>
        </div>
      </div>
    </footer>
  );
}
