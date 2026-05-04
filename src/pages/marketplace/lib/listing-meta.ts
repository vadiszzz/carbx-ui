import type { VintageToken } from '@/shared/lib/vintage-tokens'

export type ProjectType = 'Biochar' | 'Forestry' | 'DAC' | 'Soil' | 'BECCS' | 'Ocean' | 'Removal'

export function detectProjectType(name?: string | null): ProjectType {
  const upper = (name ?? '').toUpperCase()
  if (upper.includes('BIOCHAR')) return 'Biochar'
  if (upper.includes('REFOREST') || upper.includes('FOREST')) return 'Forestry'
  if (upper.includes('DIRECT AIR') || upper.includes('DAC')) return 'DAC'
  if (upper.includes('SOIL')) return 'Soil'
  if (upper.includes('BECCS')) return 'BECCS'
  if (upper.includes('OCEAN') || upper.includes('KELP')) return 'Ocean'
  return 'Removal'
}

export function extractVintage(name?: string | null): string | null {
  const matches = (name ?? '').match(/\b(20\d{2})\b/g)
  if (!matches) return null
  return matches[matches.length - 1]
}

export function formatProjectName(token: VintageToken | null, fallback: string): string {
  const raw = token?.name?.trim()
  if (!raw) return fallback

  return raw
    .replace(/\s+/g, ' ')
    .replace(/^(API\s+FACILITY\s+DEMO)\s*/i, 'Demo Facility ')
    .trim()
}

export function gradientForType(type: ProjectType): string {
  switch (type) {
    case 'Biochar':
      return 'linear-gradient(135deg, #3D2F23 0%, #5A4938 40%, #7A6750 70%, #9A8772 100%)'
    case 'Forestry':
      return 'linear-gradient(135deg, #4A6741 0%, #6E8E5C 40%, #8FA678 70%, #A8B98A 100%)'
    case 'DAC':
      return 'linear-gradient(135deg, #6B7B8C 0%, #8A98A6 40%, #A8B3BD 70%, #C2CAD2 100%)'
    case 'Soil':
      return 'linear-gradient(135deg, #4A3823 0%, #6B5236 40%, #8A6E4D 70%, #A88965 100%)'
    case 'BECCS':
      return 'linear-gradient(135deg, #3D4A35 0%, #5A6849 40%, #7C8A65 70%, #A0AC85 100%)'
    case 'Ocean':
      return 'linear-gradient(135deg, #1F4E5F 0%, #3D7A8E 40%, #6BA0B0 70%, #9BC0C9 100%)'
    default:
      return 'linear-gradient(135deg, #4A4A4A 0%, #6B6B6B 40%, #8C8C8C 70%, #ADADAD 100%)'
  }
}
