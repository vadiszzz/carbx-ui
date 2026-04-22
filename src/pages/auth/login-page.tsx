import { usePrivy } from "@privy-io/react-auth";
import { Navigate } from "react-router-dom";
import { ROUTE_PATHS } from "@/app/router/route-paths";
import { Button } from "@/shared/ui/button";

const NAV_ITEMS = [
  { label: "Suppliers", href: "#suppliers" },
  { label: "Buyers", href: "#buyers" },
  { label: "Resources", href: "#resources" },
  { label: "Trust Infrastructure", href: "#trust-infrastructure" },
] as const;

const FOOTER_COLUMNS = [
  {
    title: "Company",
    links: ["Home", "About us"],
  },
  {
    title: "Product",
    links: ["Features", "Contact"],
  },
] as const;

const FIGMA_ASSETS = {
  hero: "/figma/landing/hero.jpg",
  cta: "/figma/landing/cta.jpg",
  logo: "/figma/landing/logo.png",
  dashboard: "/figma/landing/CarbX Dashboard.jpg",
  details: "/figma/landing/CarbX details page.jpg",
} as const;

const landingButtonClassName =
  "h-[45px] rounded-full border border-[#023b3b] px-5 text-[16px] font-medium tracking-[-0.032px] text-white shadow-[0_1px_2px_rgba(23,75,75,0.48),0_0_0_1px_#0e4545] hover:brightness-95";

const landingButtonStyle = {
  backgroundImage:
    "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%), linear-gradient(90deg, rgb(2,59,59) 0%, rgb(2,59,59) 100%)",
} as const;

export function LoginPage() {
  const { authenticated, ready, login } = usePrivy();

  if (ready && authenticated) {
    return <Navigate replace to={ROUTE_PATHS.tokenize} />;
  }

  function openPrivyAuth() {
    void login({
      loginMethods: ["wallet", "email", "google"],
      walletChainType: "solana-only",
    });
  }

  return (
    <div className="min-h-screen bg-white text-[#1f2c2e]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#e8ecec] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 py-[12px] lg:px-[90px]">
          <div className="flex items-center gap-1 select-none">
          <img
            alt="CarbX logo"
            className="h-[50px] w-[60px] object-contain mix-blend-multiply"
            src={FIGMA_ASSETS.logo}
          />
            <span className="text-[36px] font-medium leading-[36px] tracking-[0.12px] text-[#1e1e1e]">
              CarbX
            </span>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                className="text-[18px] font-normal leading-[1.5] tracking-[0.06px] text-[#525866] no-underline transition-colors hover:text-[#173237]"
                href={item.href}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <Button
            className={`${landingButtonClassName} w-[170px]`}
            style={landingButtonStyle}
            disabled={!ready}
            onClick={openPrivyAuth}
          >
            Get Started
          </Button>
        </div>
      </header>

      <main className="pb-0 pt-[88px]">
        <section
          className="mx-auto flex w-full max-w-[1260px] flex-col items-center px-6 pt-4 text-center lg:px-[90px]"
          id="hero"
        >
          <div className="max-w-[862px]">
            <h1 className="m-0 text-[44px] font-semibold leading-[1.15] tracking-[-0.06em] text-[#023b3b] sm:text-[64px] lg:text-[72px]">
              Buy Carbon Removal
              <br />
              You Can Trust
            </h1>
            <p className="mx-auto mt-4 max-w-[520px] text-[13px] leading-6 text-[#525866] sm:text-[16px]">
              Tailored portfolios, backed by Audited-Ready Data
            </p>
          </div>

          <HeroLandscape className="mt-8 w-full max-w-[1100px]" />
        </section>

        <section
          className="mx-auto mt-[88px] w-full max-w-[1200px] scroll-mt-[120px] px-6"
          id="suppliers"
        >
          <SectionIntro
            description="We help you curate a carbon removal portfolio that aligns with your sustainability priorities whether you focus on technology type, geography, or co-benefits for local communities."
            title="Portfolio Tailored To Your Needs"
          />
          <MarketplacePreview />
        </section>

        <section
          className="mx-auto mt-[88px] w-full max-w-[1200px] scroll-mt-[120px] px-6"
          id="buyers"
        >
          <SectionIntro
            description="We ensure that every credit is fully traceable, backed by independent third-party verification and certification, ensuring real climate impact and compliance readiness."
            title="Carbon Removal Credits You Can Trust"
          />
          <DetailPreview />

          <div className="mt-8 flex justify-center">
            <Button
              className={`${landingButtonClassName} w-[193px]`}
              disabled={!ready}
              onClick={openPrivyAuth}
              style={landingButtonStyle}
            >
              Talk to our team
            </Button>
          </div>
        </section>

        <section
          className="mx-auto mt-[84px] w-full max-w-[1440px] scroll-mt-[120px] px-0 "
          id="resources"
        >
          <div className="relative overflow-hidden px-6 py-[120px] text-center text-white">
            <CtaLandscape />
            <div className="relative z-10 mx-auto max-w-[1018px]">
              <h2 className="m-0 text-[46px] font-semibold leading-[1.12] tracking-[-0.05em] sm:text-[64px] lg:text-[72px]">
                Carbon Removal You
                <br />
                Can Trust
              </h2>
              <p className="mx-auto mt-4 max-w-[658px] text-[18px] leading-8 text-[#e5e5e5] sm:text-[20px]">
                Talk to our carbon removal experts to design a portfolio that
                meets your needs.
              </p>
              <Button
                className={`${landingButtonClassName} mt-6 w-[193px] border-white/70`}
                disabled={!ready}
                onClick={openPrivyAuth}
                style={landingButtonStyle}
              >
                Get Started Today
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#eeeeee] pb-10" id="trust-infrastructure">
        <div className="mx-auto grid w-full max-w-[1440px] items-start gap-6 px-6 py-4 md:grid-cols-[410px_203px_203px_384px] lg:px-[120px]">
          <div className="px-4 py-4">
            <div className="flex items-center gap-[2.222px]">
              <img
                alt="CarbX logo"
                className="h-[30.044px] w-[33.333px] object-contain mix-blend-multiply"
                src={FIGMA_ASSETS.logo}
              />
              <span className="text-[20px] font-medium leading-5 tracking-[0.06px] text-[#1e1e1e]">
                CarbX
              </span>
            </div>
            <p className="mt-3 max-w-[378px] text-[14px] leading-[1.7] tracking-[0.042px] text-[#525866]">
              At CarbX, we build trust throughout the carbon removal journey
              with our rigorous, data-driven approach, ensuring unmatched
              quality and reliability of carbon removal.
            </p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className="px-4 py-4">
              <h3 className="m-0 text-[20px] font-medium leading-[30px] tracking-[0.06px] text-[#292828]">
                {column.title}
              </h3>
              <div className="mt-3 grid gap-3">
                {column.links.map((link) => (
                  <a
                    key={link}
                    className="text-[16px] leading-[30px] tracking-[0.048px] text-[#525866] no-underline hover:text-[#173237]"
                    href="#"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}

          <div className="px-4 py-4">
            <h3 className="m-0 text-[20px] font-medium leading-[30px] tracking-[0.06px] text-[#292828]">
              Newsletter
            </h3>
            <div className="mt-3 flex items-center justify-between rounded-full border border-[#e2e4e9] bg-white py-[10px] pl-6 pr-3">
              <input
                className="h-[45px] flex-1 border-0 bg-transparent pr-3 text-[14px] tracking-[0.042px] text-[#314044] outline-none placeholder:text-[#525866]"
                placeholder="Email Address"
                type="email"
              />
              <Button
                className={`${landingButtonClassName} w-[117px] text-[14px]`}
                disabled={!ready}
                onClick={openPrivyAuth}
                style={landingButtonStyle}
              >
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionIntro({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-[934px] text-center">
      <h2 className="m-0 text-[36px] font-semibold leading-[1.18] tracking-[-0.05em] text-[#2f3233] sm:text-[48px] lg:text-[56px]">
        {title}
      </h2>
      <p className="mx-auto mt-4 max-w-[844px] text-[13px] leading-6 text-[#525866] sm:text-[16px] sm:leading-8">
        {description}
      </p>
    </div>
  );
}

function HeroLandscape({ className }: { className?: string }) {
  return (
    <img
      alt="Tropical island landscape"
      className={[
        "aspect-[2.053] w-full rounded-[20px] object-cover",
        className ?? "",
      ].join(" ")}
      src={FIGMA_ASSETS.hero}
    />
  );
}

function MarketplacePreview() {
  return (
    <img
      alt="CarbX dashboard preview"
      className="block w-full rounded-[12px] object-cover mt-6"
      src={FIGMA_ASSETS.dashboard}
    />
  );
}

function DetailPreview() {
  return (
    <img
      alt="CarbX details preview"
      className="block w-full rounded-[12px] object-cover mt-6"
      src={FIGMA_ASSETS.details}
    />
  );
}

function CtaLandscape() {
  return (
    <>
      <img
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        src={FIGMA_ASSETS.cta}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.35)_100%)]" />
    </>
  );
}
