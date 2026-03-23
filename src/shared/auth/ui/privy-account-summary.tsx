import { useMemo } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  getAuthIdentityLabel,
  getLinkedSolanaWallet,
  getPrimaryAuthMethodLabel,
} from "@/shared/auth/lib/privy-user";

export function PrivyAccountSummary() {
  const { authenticated, ready, user } = usePrivy();

  const linkedWallet = getLinkedSolanaWallet(user);
  const authMethod = getPrimaryAuthMethodLabel(user);
  const authIdentity = getAuthIdentityLabel(user);

  const linkedWalletLabel = useMemo(() => {
    if (!linkedWallet) return "No linked Solana wallet";
    return `${linkedWallet.address}`;
  }, [linkedWallet]);

  return (
    <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-700">Status</span>
        <span
          className={[
            "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
            authenticated
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-200 text-slate-700",
          ].join(" ")}
        >
          {ready
            ? authenticated
              ? "Authorized"
              : "Not authorized"
            : "Loading"}
        </span>
      </div>

      <div className="grid gap-1 text-sm text-slate-600">
        <p className="m-0">
          <span className="font-medium text-slate-800">Authorize Method:</span>{" "}
          {authMethod}
        </p>
        <p className="m-0">
          <span className="font-medium text-slate-800">Identity:</span>{" "}
          {authIdentity ?? "Not linked yet"}
        </p>
        <p className="m-0">
          <span className="font-medium text-slate-800"> Solana wallet:</span>{" "}
          {linkedWalletLabel}
        </p>
      </div>
    </div>
  );
}

function shortenAddress(address: string) {
  if (address.length <= 18) return address;
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}
