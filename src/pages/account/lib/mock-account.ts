export type KybStatus = 'VERIFIED' | 'PENDING' | 'ACTION_REQUIRED'

export type MockProfile = {
  fullName: string
  email: string
  phone: string
  jobTitle: string
  initials: string
}

export type MockCompany = {
  legalName: string
  tradingName: string
  registrationCountry: string
  registrationNumber: string
  taxId: string
  industry: string
  address: {
    line1: string
    line2?: string
    city: string
    postalCode: string
    country: string
  }
  kybStatus: KybStatus
  kybCompletedOn?: string
  beneficialOwners: number
}

export const MOCK_PROFILE: MockProfile = {
  fullName: 'Alex Morgan',
  email: 'alex@acmecarbon.example',
  phone: '+1 (415) 555-0142',
  jobTitle: 'Head of Sustainability',
  initials: 'AM',
}

export const MOCK_COMPANY: MockCompany = {
  legalName: 'Acme Carbon Solutions Ltd',
  tradingName: 'Acme Carbon',
  registrationCountry: 'United Kingdom',
  registrationNumber: '12894571',
  taxId: 'GB392847561',
  industry: 'Carbon project development',
  address: {
    line1: '14 Curtain Road',
    line2: 'Suite 4B',
    city: 'London',
    postalCode: 'EC2A 3LT',
    country: 'United Kingdom',
  },
  kybStatus: 'VERIFIED',
  kybCompletedOn: '2026-02-18',
  beneficialOwners: 2,
}

export const KYB_STATUS_LABEL: Record<KybStatus, string> = {
  VERIFIED: 'Verified',
  PENDING: 'In review',
  ACTION_REQUIRED: 'Action required',
}

export function getKybStatusClass(status: KybStatus) {
  switch (status) {
    case 'VERIFIED':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    case 'PENDING':
      return 'border-amber-200 bg-amber-50 text-amber-700'
    case 'ACTION_REQUIRED':
      return 'border-rose-200 bg-rose-50 text-rose-700'
  }
}
