import type { ViewTableLocations } from '@/plugins/types/germinate'

export interface ExtendedViewTableLocations extends ViewTableLocations {
  additionalInfo?: { [key: string]: string }
}
