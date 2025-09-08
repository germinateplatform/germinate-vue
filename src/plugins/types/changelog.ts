export interface ChangelogEntry {
  version: string
  date: string
  items: ChangelogEntryItems[]
}

export interface ChangelogEntryItems {
  type: string
  title: string
  text: string
  categories: string[]
}
