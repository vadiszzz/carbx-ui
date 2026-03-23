import {
  RETIRE_BENEFICIARY_TYPES,
  RETIRE_USAGE_TYPES,
  type RetireBeneficiaryType,
  type RetireUsageType,
} from '@/shared/api/retire/types'

export type VintageRegistryMeta = {
  tokenMint: string
  companyId16: string
  year: number
}

export type RetireFormState = {
  beneficiaryName: string
  beneficiaryLocation: string
  beneficiaryType: RetireBeneficiaryType
  beneficiaryContactPersonEmail: string
  countryOfConsumption: string
  usageType: RetireUsageType
  consumptionPeriodStartDate: string
  consumptionPeriodEndDate: string
  beneficiaryHiddenUntil: string
  retirementPurpose: string
  offtakeAgreementId: string
}

export const DEFAULT_RETIRE_FORM: RetireFormState = {
  beneficiaryName: '',
  beneficiaryLocation: '',
  beneficiaryType: RETIRE_BENEFICIARY_TYPES.END_CONSUMER,
  beneficiaryContactPersonEmail: '',
  countryOfConsumption: '',
  usageType: RETIRE_USAGE_TYPES.DISCLOSURE,
  consumptionPeriodStartDate: '',
  consumptionPeriodEndDate: '',
  beneficiaryHiddenUntil: '',
  retirementPurpose: '',
  offtakeAgreementId: '',
}

export const RETIRE_BENEFICIARY_OPTIONS: Array<{
  value: RetireBeneficiaryType
  label: string
}> = [
  { value: RETIRE_BENEFICIARY_TYPES.END_CONSUMER, label: 'End consumer' },
  { value: RETIRE_BENEFICIARY_TYPES.SUPPLIER, label: 'Supplier' },
]

export const RETIRE_USAGE_OPTIONS: Array<{ value: RetireUsageType; label: string }> = [
  { value: RETIRE_USAGE_TYPES.BUNDLED_WITH_PRODUCT_OR_SERVICE, label: 'Bundled product/service' },
  { value: RETIRE_USAGE_TYPES.DISCLOSURE, label: 'Disclosure' },
  { value: RETIRE_USAGE_TYPES.GENERIC_COMPENSATION, label: 'Generic compensation' },
  { value: RETIRE_USAGE_TYPES.OTHER, label: 'Other' },
  { value: RETIRE_USAGE_TYPES.SPECIFIC_ACTIVITY_LIKE_FLIGHTS, label: 'Specific activity (flights)' },
  { value: RETIRE_USAGE_TYPES.SUPPORT, label: 'Support' },
]
