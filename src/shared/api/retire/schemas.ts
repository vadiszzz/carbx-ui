import { z } from 'zod'
import {
  RetireBeneficiaryTypeSchema,
  RetireUsageTypeSchema,
} from './types'

export const CreateRetirePayloadSchema = z.object({
  beneficiaryName: z.string().min(1),
  beneficiaryLocation: z.string().min(1),
  beneficiaryType: RetireBeneficiaryTypeSchema,
  beneficiaryContactPersonEmail: z.string().email(),
  countryOfConsumption: z.string().min(1),
  usageType: RetireUsageTypeSchema,
  consumptionPeriodStartDate: z.string().min(1),
  consumptionPeriodEndDate: z.string().min(1),
  beneficiaryHiddenUntil: z.string().nullable(),
  retirementPurpose: z.string().min(1),
  offtakeAgreementId: z.string().nullable(),
  solanaUserWallet: z.string().min(1),
})

export const CreateRetireResponseSchema = z
  .object({
    carbxRetireUuid: z.string().min(1).optional(),
    retireId: z.string().min(1).optional(),
  })
  .passthrough()
  .transform((value, ctx) => {
    const carbxRetireUuid = value.carbxRetireUuid ?? value.retireId

    if (!carbxRetireUuid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'carbxRetireUuid or retireId is required in response',
      })
      return z.NEVER
    }

    return { carbxRetireUuid }
  })
