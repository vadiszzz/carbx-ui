import {
  ArrowRight,
  Globe,
  Leaf,
  Mail,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { Navigate } from "react-router-dom";
import { usePrivy } from "@privy-io/react-auth";
import { ROUTE_PATHS } from "@/app/router/route-paths";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

const TRUST_POINTS = [
  {
    title: "Solana-native access",
    description: "Wallet-first onboarding with embedded wallet fallback.",
    icon: Wallet,
  },
  {
    title: "Auditable flows",
    description: "Tokenize, trade, and retire credits in one controlled workspace.",
    icon: ShieldCheck,
  },
  {
    title: "Built for climate assets",
    description: "A product surface shaped around carbon market operations.",
    icon: Leaf,
  },
] as const;

export function LoginPage() {
  const { authenticated, ready, login } = usePrivy();

  if (ready && authenticated) {
    return <Navigate replace to={ROUTE_PATHS.tokenize} />;
  }

  return (
    <div className="app-canvas">
      <div className="app-shell-frame flex min-h-screen items-center py-10">
        <div className="grid w-full gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <section className="grid content-center gap-6">
            <div className="app-hero grid gap-6 text-white">
              <div className="relative z-10 grid gap-4">
                <div className="page-kicker-dark">
                  <Globe className="size-3.5" />
                  CarbX Climate Desk
                </div>

                <div className="grid gap-4">
                  <h1 className="m-0 max-w-3xl text-5xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-6xl">
                    Operate carbon credits across issuance, trading, and retirement.
                  </h1>
                  <p className="m-0 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
                    Access the CarbX workspace to tokenize, distribute, and retire
                    carbon assets on Solana. Privy handles the authentication layer
                    and can create an embedded wallet automatically when needed.
                  </p>
                </div>
              </div>

              <div className="relative z-10 info-grid">
                <div className="rounded-2xl border border-white/14 bg-white/8 p-4 backdrop-blur">
                  <p className="m-0 text-xs uppercase tracking-[0.2em] text-slate-300">
                    Network
                  </p>
                  <p className="mt-3 m-0 text-2xl font-semibold tracking-tight text-white">
                    Solana
                  </p>
                  <p className="mt-2 m-0 text-sm text-slate-200">
                    Fast settlement for carbon workflows.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/14 bg-white/8 p-4 backdrop-blur">
                  <p className="m-0 text-xs uppercase tracking-[0.2em] text-slate-300">
                    Access
                  </p>
                  <p className="mt-3 m-0 text-2xl font-semibold tracking-tight text-white">
                    Wallet or SSO
                  </p>
                  <p className="mt-2 m-0 text-sm text-slate-200">
                    Choose wallet, email, or Google.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/14 bg-white/8 p-4 backdrop-blur">
                  <p className="m-0 text-xs uppercase tracking-[0.2em] text-slate-300">
                    Focus
                  </p>
                  <p className="mt-3 m-0 text-2xl font-semibold tracking-tight text-white">
                    Token operations
                  </p>
                  <p className="mt-2 m-0 text-sm text-slate-200">
                    Tokenize, trade, and retire from one app.
                  </p>
                </div>
              </div>
            </div>

            <div className="info-grid">
              {TRUST_POINTS.map(({ title, description, icon: Icon }) => (
                <div
                  key={title}
                  className="app-panel p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-teal-600/10 text-teal-700">
                      <Icon className="size-4" />
                    </div>
                    <p className="m-0 text-sm font-semibold text-slate-950">{title}</p>
                  </div>
                  <p className="mt-3 m-0 text-sm leading-6 text-slate-600">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid content-center">
            <Card className="app-panel-strong overflow-hidden py-0 text-slate-950">
              <div className="border-b border-slate-200/80 p-6 sm:p-8">
                <div className="page-kicker">
                  <Leaf className="size-3.5" />
                  Secure access
                </div>
                <h2 className="mt-4 m-0 text-3xl font-semibold tracking-tight text-slate-950">
                  Sign in to CarbX
                </h2>
              </div>

              <CardContent className="grid gap-6 px-6 pb-8 sm:px-8">
                <div className="grid gap-3">
                  <Button
                    className="h-12 justify-between rounded-xl bg-teal-700 px-5 text-sm font-medium text-white hover:bg-teal-800"
                    disabled={!ready}
                    onClick={() =>
                      void login({
                        loginMethods: ["wallet"],
                        walletChainType: "solana-only",
                      })
                    }
                    size="lg"
                  >
                    <span className="flex items-center gap-3">
                      <Wallet className="size-4" />
                      Continue with Wallet
                    </span>
                    <ArrowRight className="size-4" />
                  </Button>

                  <Button
                    className="h-12 rounded-xl border-slate-200/90 bg-white/90 px-5 text-sm font-medium text-slate-900 hover:bg-white"
                    disabled={!ready}
                    onClick={() => void login({ loginMethods: ["email"] })}
                    size="lg"
                    variant="outline"
                  >
                    <Mail className="size-4" />
                    Continue with Email
                  </Button>

                  <Button
                    className="h-12 rounded-xl border-slate-200/90 bg-white/90 px-5 text-sm font-medium text-slate-900 hover:bg-white"
                    disabled={!ready}
                    onClick={() => void login({ loginMethods: ["google"] })}
                    size="lg"
                    variant="outline"
                  >
                    <Globe className="size-4" />
                    Continue with Google
                  </Button>
                </div>

              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
