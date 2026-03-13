import { z } from 'zod'

export const RETIRE_BENEFICIARY_TYPES = {
  END_CONSUMER: 'END_CONSUMER',
  SUPPLIER: 'SUPPLIER',
} as const

export type RetireBeneficiaryType =
  (typeof RETIRE_BENEFICIARY_TYPES)[keyof typeof RETIRE_BENEFICIARY_TYPES]

export const RETIRE_USAGE_TYPES = {
  BUNDLED_WITH_PRODUCT_OR_SERVICE: 'BUNDLED_WITH_PRODUCT_OR_SERVICE',
  DISCLOSURE: 'DISCLOSURE',
  GENERIC_COMPENSATION: 'GENERIC_COMPENSATION',
  OTHER: 'OTHER',
  SPECIFIC_ACTIVITY_LIKE_FLIGHTS: 'SPECIFIC_ACTIVITY_LIKE_FLIGHTS',
  SUPPORT: 'SUPPORT',
} as const

export type RetireUsageType =
  (typeof RETIRE_USAGE_TYPES)[keyof typeof RETIRE_USAGE_TYPES]

export const RetireBeneficiaryTypeSchema = z.enum([
  RETIRE_BENEFICIARY_TYPES.END_CONSUMER,
  RETIRE_BENEFICIARY_TYPES.SUPPLIER,
])

export const RetireUsageTypeSchema = z.enum([
  RETIRE_USAGE_TYPES.BUNDLED_WITH_PRODUCT_OR_SERVICE,
  RETIRE_USAGE_TYPES.DISCLOSURE,
  RETIRE_USAGE_TYPES.GENERIC_COMPENSATION,
  RETIRE_USAGE_TYPES.OTHER,
  RETIRE_USAGE_TYPES.SPECIFIC_ACTIVITY_LIKE_FLIGHTS,
  RETIRE_USAGE_TYPES.SUPPORT,
])

export type CreateRetirePayload = {
  beneficiaryName: string
  beneficiaryLocation: string
  beneficiaryType: RetireBeneficiaryType
  beneficiaryContactPersonEmail: string
  countryOfConsumption: string
  usageType: RetireUsageType
  consumptionPeriodStartDate: string
  consumptionPeriodEndDate: string
  beneficiaryHiddenUntil: string | null
  retirementPurpose: string
  offtakeAgreementId: string | null
  solanaUserWallet: string
}

export type CreateRetireResponse = {
  carbxRetireUuid: string
}
