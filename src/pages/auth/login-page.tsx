import {
  ArrowRight,
  BadgeCheck,
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
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.22),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(34,197,94,0.18),_transparent_30%)]" />
      <div className="absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <section className="grid content-center gap-8">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-slate-200 backdrop-blur">
              <Globe className="size-3.5" />
              CarbX Climate Desk
            </div>

            <div className="grid gap-5">
              <h1 className="m-0 max-w-3xl text-5xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-6xl">
                Operate carbon credits across issuance, trading, and retirement.
              </h1>
              <p className="m-0 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Access the CarbX workspace to tokenize, distribute, and retire
                carbon assets on Solana. Privy handles the authentication layer
                and can create an embedded wallet automatically when needed.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/12 bg-white/8 p-4 backdrop-blur">
                <p className="m-0 text-xs uppercase tracking-[0.2em] text-slate-400">
                  Network
                </p>
                <p className="mt-3 m-0 text-2xl font-semibold tracking-tight text-white">
                  Solana
                </p>
                <p className="mt-2 m-0 text-sm text-slate-300">
                  Fast settlement for carbon workflows.
                </p>
              </div>

              <div className="rounded-2xl border border-white/12 bg-white/8 p-4 backdrop-blur">
                <p className="m-0 text-xs uppercase tracking-[0.2em] text-slate-400">
                  Access
                </p>
                <p className="mt-3 m-0 text-2xl font-semibold tracking-tight text-white">
                  Wallet or SSO
                </p>
                <p className="mt-2 m-0 text-sm text-slate-300">
                  Choose wallet, email, or Google.
                </p>
              </div>

              <div className="rounded-2xl border border-white/12 bg-white/8 p-4 backdrop-blur">
                <p className="m-0 text-xs uppercase tracking-[0.2em] text-slate-400">
                  Focus
                </p>
                <p className="mt-3 m-0 text-2xl font-semibold tracking-tight text-white">
                  Token operations
                </p>
                <p className="mt-2 m-0 text-sm text-slate-300">
                  Tokenize, trade, and retire from one app.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {TRUST_POINTS.map(({ title, description, icon: Icon }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/10 bg-slate-900/50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
                      <Icon className="size-4" />
                    </div>
                    <p className="m-0 text-sm font-semibold text-white">{title}</p>
                  </div>
                  <p className="mt-3 m-0 text-sm leading-6 text-slate-300">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid content-center">
            <Card className="overflow-hidden border-white/12 bg-white/95 py-0 text-slate-950 shadow-2xl shadow-slate-950/35">
              <div className="border-b border-slate-200/80 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(12,74,110,0.92)_58%,rgba(5,150,105,0.88))] p-6 text-white sm:p-8">
                
                <h2 className="mt-5 m-0 text-3xl font-semibold tracking-tight">
                  Sign in to CarbX
                </h2>
                <p className="mt-3 m-0 max-w-md text-sm leading-6 text-slate-200">
                  Pick the login method that fits your workflow. Wallet access is
                  the most direct path; email and Google can still provision a
                  Solana wallet through Privy.
                </p>
              </div>

              <CardContent className="grid gap-6 p-6 sm:p-8">
                <div className="grid gap-3">
                  <Button
                    className="h-12 justify-between rounded-xl bg-slate-950 px-5 text-sm font-medium hover:bg-slate-800"
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
                    className="h-12 rounded-xl border-slate-200 bg-white px-5 text-sm font-medium text-slate-900 hover:bg-slate-50"
                    disabled={!ready}
                    onClick={() => void login({ loginMethods: ["email"] })}
                    size="lg"
                    variant="outline"
                  >
                    <Mail className="size-4" />
                    Continue with Email
                  </Button>

                  <Button
                    className="h-12 rounded-xl border-slate-200 bg-white px-5 text-sm font-medium text-slate-900 hover:bg-slate-50"
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
