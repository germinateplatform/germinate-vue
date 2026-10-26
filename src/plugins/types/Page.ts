export interface Page {
  name: string
  path: string
  identifiers?: string[]
  i18n?: string
  icon?: string
  iconRotate?: 90 | 180 | 270
  parent?: string
  navigable?: boolean
}
