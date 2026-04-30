import {
  LogOut,
  Mail,
  Pencil,
  Phone,
  ShieldCheck,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePrivy } from '@privy-io/react-auth'
import { ROUTE_PATHS } from '@/app/router/route-paths'
import { getPrimaryAuthMethodLabel } from '@/shared/auth/lib/privy-user'
import {
  KYB_STATUS_LABEL,
  MOCK_COMPANY,
  MOCK_PROFILE,
  getKybStatusClass,
} from './lib/mock-account'

export function AccountPage() {
  const navigate = useNavigate()
  const { authenticated, user, logout } = usePrivy()

  const authMethod = getPrimaryAuthMethodLabel(user)

  async function handleLogout() {
    await logout()
    navigate(ROUTE_PATHS.login, { replace: true })
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Account</h1>
        <p className="max-w-xl text-muted-foreground">
          Your profile, company verification, and security settings.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        <ProfileSection authenticated={authenticated} />
        <CompanySection />
        <SecuritySection
          authMethod={authMethod}
          identity={MOCK_PROFILE.email}
          onSignOut={() => void handleLogout()}
        />
      </div>
    </div>
  )
}

function SectionCard({
  title,
  description,
  badge,
  action,
  children,
}: {
  title: string
  description?: string
  badge?: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-6 py-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            {badge}
          </div>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="px-6 py-5">{children}</div>
    </section>
  )
}

function ProfileSection({ authenticated }: { authenticated: boolean }) {
  return (
    <SectionCard
      title="Your profile"
      description="The person logged in to this CarbX account."
      action={<EditButton label="Edit profile" />}
    >
      <div className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground">
          {MOCK_PROFILE.initials}
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <div className="text-lg font-semibold text-foreground">
            {MOCK_PROFILE.fullName}
          </div>
          <div className="text-sm text-muted-foreground">{MOCK_PROFILE.jobTitle}</div>
          {!authenticated && (
            <div className="mt-1 text-xs text-amber-700">
              Not signed in — these are placeholder details.
            </div>
          )}
        </div>
      </div>

      <dl className="mt-6 grid gap-px rounded-lg bg-border sm:grid-cols-2">
        <DetailRow icon={<Mail className="size-3.5" />} label="Email" value={MOCK_PROFILE.email} />
        <DetailRow icon={<Phone className="size-3.5" />} label="Phone" value={MOCK_PROFILE.phone} />
      </dl>
    </SectionCard>
  )
}

function CompanySection() {
  const company = MOCK_COMPANY
  const addressLines = [
    company.address.line1,
    company.address.line2,
    `${company.address.city} ${company.address.postalCode}`,
    company.address.country,
  ].filter(Boolean)

  return (
    <SectionCard
      title="Company"
      description="Verified business details on file with CarbX."
      badge={
        <span
          className={[
            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium',
            getKybStatusClass(company.kybStatus),
          ].join(' ')}
        >
          <ShieldCheck className="size-3" />
          {KYB_STATUS_LABEL[company.kybStatus]}
        </span>
      }
      action={<EditButton label="Update details" />}
    >
      <dl className="grid gap-px rounded-lg bg-border sm:grid-cols-2">
        <DetailRow label="Legal name" value={company.legalName} />
        <DetailRow label="Trading name" value={company.tradingName} />
        <DetailRow label="Country of registration" value={company.registrationCountry} />
        <DetailRow label="Registration number" value={<Mono>{company.registrationNumber}</Mono>} />
        <DetailRow label="Tax ID / VAT" value={<Mono>{company.taxId}</Mono>} />
        <DetailRow label="Industry" value={company.industry} />
        <DetailRow
          label="Registered address"
          className="sm:col-span-2"
          value={
            <div className="flex flex-col text-sm">
              {addressLines.map((line, idx) => (
                <span key={idx}>{line}</span>
              ))}
            </div>
          }
        />
        <DetailRow
          label="Beneficial owners"
          value={`${company.beneficialOwners} on file`}
        />
        {company.kybCompletedOn && (
          <DetailRow
            label="Verification completed"
            value={formatLongDate(company.kybCompletedOn)}
          />
        )}
      </dl>
    </SectionCard>
  )
}

function SecuritySection({
  authMethod,
  identity,
  onSignOut,
}: {
  authMethod: string
  identity: string
  onSignOut: () => void
}) {
  return (
    <SectionCard title="Security" description="Sign-in method and session.">
      <dl className="grid gap-px rounded-lg bg-border sm:grid-cols-2">
        <DetailRow label="Sign-in method" value={authMethod} />
        <DetailRow label="Identity" value={identity} />
      </dl>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={onSignOut}
          className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </SectionCard>
  )
}

function DetailRow({
  label,
  value,
  icon,
  className,
}: {
  label: string
  value: React.ReactNode
  icon?: React.ReactNode
  className?: string
}) {
  return (
    <div className={['flex flex-col gap-1 bg-card px-4 py-3', className ?? ''].join(' ')}>
      <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  )
}

function EditButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
    >
      <Pencil className="size-3" />
      {label}
    </button>
  )
}

function Mono({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-xs">{children}</span>
}

function formatLongDate(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}
