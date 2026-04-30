import { usePrivy } from '@privy-io/react-auth'
import { Navigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@/app/router/route-paths'

const NAV_ITEMS = [
  { label: 'Suppliers', href: '#suppliers' },
  { label: 'Buyers', href: '#buyers' },
  { label: 'Resources', href: '#resources' },
  { label: 'Trust Infrastructure', href: '#trust-infrastructure' },
] as const

const FOOTER_COLUMNS = [
  {
    title: 'Company',
    links: ['Home', 'About us'],
  },
  {
    title: 'Product',
    links: ['Features', 'Contact'],
  },
] as const

const FIGMA_ASSETS = {
  hero: '/figma/landing/hero.jpg',
  cta: '/figma/landing/cta.jpg',
  logo: '/figma/landing/logo.png',
  dashboard: '/figma/landing/CarbX Dashboard.jpg',
  details: '/figma/landing/CarbX details page.jpg',
} as const

export function LoginPage() {
  const { authenticated, ready, login } = usePrivy()

  if (ready && authenticated) {
    return <Navigate replace to={ROUTE_PATHS.marketplace} />
  }

  function openPrivyAuth() {
    void login({
      loginMethods: ['wallet', 'email', 'google'],
      walletChainType: 'solana-only',
    })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 py-3 lg:px-10">
          <div className="flex items-center gap-2 select-none">
            <img
              alt="CarbX logo"
              className="h-9 w-9 object-contain mix-blend-multiply"
              src={FIGMA_ASSETS.logo}
            />
            <span className="text-2xl font-bold tracking-tight text-foreground">
              CarbX
            </span>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                className="text-sm font-medium text-muted-foreground no-underline transition-colors hover:text-foreground"
                href={item.href}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <PrimaryCta disabled={!ready} onClick={openPrivyAuth}>
            Get started
          </PrimaryCta>
        </div>
      </header>

      <main className="pb-0 pt-20">
        <section
          className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 pt-12 text-center lg:px-10"
          id="hero"
        >
          <div className="max-w-3xl">
            <h1 className="m-0 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Buy carbon removal
              <br />
              you can trust
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Tailored portfolios, backed by audit-ready data.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <PrimaryCta disabled={!ready} onClick={openPrivyAuth}>
                Get started
              </PrimaryCta>
              <SecondaryCta href="#buyers">Learn more</SecondaryCta>
            </div>
          </div>

          <HeroLandscape className="mt-12 w-full max-w-5xl" />
        </section>

        <section
          className="mx-auto mt-24 w-full max-w-6xl scroll-mt-24 px-6"
          id="suppliers"
        >
          <SectionIntro
            description="We help you curate a carbon removal portfolio that aligns with your sustainability priorities — whether you focus on technology type, geography, or co-benefits for local communities."
            title="Portfolio tailored to your needs"
          />
          <MarketplacePreview />
        </section>

        <section
          className="mx-auto mt-24 w-full max-w-6xl scroll-mt-24 px-6"
          id="buyers"
        >
          <SectionIntro
            description="Every credit is fully traceable, backed by independent third-party verification and certification — ensuring real climate impact and compliance readiness."
            title="Carbon removal credits you can trust"
          />
          <DetailPreview />

          <div className="mt-10 flex justify-center">
            <PrimaryCta disabled={!ready} onClick={openPrivyAuth}>
              Talk to our team
            </PrimaryCta>
          </div>
        </section>

        <section
          className="mx-auto mt-24 w-full max-w-7xl scroll-mt-24 px-0"
          id="resources"
        >
          <div className="relative overflow-hidden px-6 py-24 text-center text-white sm:rounded-2xl sm:mx-6">
            <CtaLandscape />
            <div className="relative z-10 mx-auto max-w-3xl">
              <h2 className="m-0 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Carbon removal you
                <br />
                can trust
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
                Talk to our carbon removal experts to design a portfolio that
                meets your needs.
              </p>
              <div className="mt-7 flex justify-center">
                <button
                  type="button"
                  disabled={!ready}
                  onClick={openPrivyAuth}
                  className="inline-flex items-center justify-center rounded-md border border-white/30 bg-white px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-white/90 disabled:opacity-50"
                >
                  Get started today
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer
        className="mt-24 border-t border-border bg-card pb-10"
        id="trust-infrastructure"
      >
        <div className="mx-auto grid w-full max-w-7xl items-start gap-6 px-6 py-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,2fr)] lg:px-10">
          <div className="px-2">
            <div className="flex items-center gap-2">
              <img
                alt="CarbX logo"
                className="h-8 w-8 object-contain mix-blend-multiply"
                src={FIGMA_ASSETS.logo}
              />
              <span className="text-xl font-bold tracking-tight text-foreground">
                CarbX
              </span>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              At CarbX, we build trust throughout the carbon removal journey
              with a rigorous, data-driven approach — ensuring unmatched
              quality and reliability of every credit.
            </p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className="px-2">
              <h3 className="m-0 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {column.title}
              </h3>
              <div className="mt-3 grid gap-2">
                {column.links.map((link) => (
                  <a
                    key={link}
                    className="text-sm text-foreground no-underline transition-colors hover:text-primary"
                    href="#"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}

          <div className="px-2">
            <h3 className="m-0 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Newsletter
            </h3>
            <form
              onSubmit={(event) => event.preventDefault()}
              className="mt-3 flex items-center gap-2 rounded-md border border-border-strong bg-background p-1 pl-3"
            >
              <input
                className="h-9 flex-1 border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                placeholder="you@company.com"
                type="email"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="mx-auto mt-4 max-w-7xl px-6 text-xs text-muted-foreground lg:px-10">
          © {new Date().getFullYear()} CarbX. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

function PrimaryCta({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
    >
      {children}
    </button>
  )
}

function SecondaryCta({
  children,
  href,
}: {
  children: React.ReactNode
  href: string
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center justify-center rounded-md border border-border-strong bg-card px-5 py-2.5 text-sm font-semibold text-foreground no-underline transition-colors hover:bg-muted"
    >
      {children}
    </a>
  )
}

function SectionIntro({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <h2 className="m-0 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
        {description}
      </p>
    </div>
  )
}

function HeroLandscape({ className }: { className?: string }) {
  return (
    <img
      alt="Tropical island landscape"
      className={[
        'aspect-[2.053] w-full rounded-2xl object-cover shadow-card',
        className ?? '',
      ].join(' ')}
      src={FIGMA_ASSETS.hero}
    />
  )
}

function MarketplacePreview() {
  return (
    <img
      alt="CarbX dashboard preview"
      className="mt-8 block w-full rounded-xl object-cover shadow-card"
      src={FIGMA_ASSETS.dashboard}
    />
  )
}

function DetailPreview() {
  return (
    <img
      alt="CarbX details preview"
      className="mt-8 block w-full rounded-xl object-cover shadow-card"
      src={FIGMA_ASSETS.details}
    />
  )
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
  )
}
