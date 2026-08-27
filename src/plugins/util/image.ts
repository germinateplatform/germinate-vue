import { toUrlString } from '@/plugins/util/formatting'
import { coreStore } from '@/stores/app'

export function getImageUrl (name: string, params: { [key: string]: string | undefined }) {
  const store = coreStore()
  const paramString = toUrlString(params)

  let finalName = name || ''
  let index = finalName.lastIndexOf('\\')
  if (index !== -1) {
    finalName = finalName.slice(index + 1)
  }
  index = finalName.lastIndexOf('/')
  if (index !== -1) {
    finalName = finalName.slice(index + 1)
  }

  return `${store.storeBaseUrl}image/src/${encodeURI(finalName)}?${paramString}`
}

export function getImageUrlById (id: number, params: { [key: string]: string | undefined }) {
  const store = coreStore()
  const paramString = toUrlString(params)

  return `${store.storeBaseUrl}image/${id}/src?${paramString}`
}

export function getFeedbackImageUrl (id: number, params: { [key: string]: string | undefined }) {
  const store = coreStore()
  const paramString = toUrlString(params)

  return `${store.storeBaseUrl}feedback/${id}/img?${paramString}`
}
