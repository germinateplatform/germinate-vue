import type { UserType } from '@/plugins/types/germinate'

export interface Page {
  name: string
  path: string
  required?: UserType
}
