import type { HiddenColumns } from '@/plugins/types/germinate'

export interface ServerSettings {
  authMode: string
  colorsTemplate?: string[]
  colorsCharts?: string[]
  colorsGradient?: string[]
  colorPrimary?: string
  commentsEnabled: boolean
  dashboardCategories?: string[]
  dashboardSections?: string[]
  dataImportMode: string
  externalLinkIdentifier?: string
  externalLinkTemplate?: string
  googleAnalyticsKey?: string
  genesysAvailable?: boolean
  plausibleDomain?: string
  plausibleHashMode?: boolean
  plausibleApiHost?: string
  gatekeeperUrl?: string
  hiddenPages?: string[]
  registrationEnabled: boolean
  showGdprNotification: boolean
  gridscoreUrl?: string
  heliumUrl?: string
  fieldhubUrl?: string
  hiddenColumns?: HiddenColumns
  supportsFeedback?: boolean
  genesysUrl?: string
}
