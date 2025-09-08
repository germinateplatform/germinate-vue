import type { HiddenColumns } from '@/plugins/types/germinate'

export interface ServerSettings {
  authMode: string
  colorsTemplate?: string[] | undefined
  colorsCharts?: string[] | undefined
  colorsGradient?: string[] | undefined
  colorPrimary?: string | undefined
  commentsEnabled: boolean
  dashboardCategories?: string[] | undefined
  dashboardSections?: string[] | undefined
  dataImportMode: string | undefined
  externalLinkIdentifier?: string | undefined
  externalLinkTemplate?: string | undefined
  googleAnalyticsKey?: string | undefined
  plausibleDomain?: string | undefined
  plausibleHashMode?: boolean | undefined
  plausibleApiHost?: string | undefined
  gatekeeperUrl?: string | undefined
  hiddenPages?: string[] | undefined
  registrationEnabled: boolean | undefined
  showGdprNotification: boolean | undefined
  gridscoreUrl?: string | undefined
  heliumUrl?: string | undefined
  fieldhubUrl?: string | undefined
  hiddenColumns?: HiddenColumns | undefined
  supportsFeedback?: boolean | undefined
  genesysUrl?: string | undefined
}
