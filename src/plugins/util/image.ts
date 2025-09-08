import { toUrlString } from '@/plugins/util/formatting'
import { coreStore } from '@/stores/app'

const getImageUrl = (name: string, params: { [key: string]: string | undefined }) => {
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

const getImageUrlById = (id: number, params: { [key: string]: string | undefined }) => {
  const store = coreStore()
  const paramString = toUrlString(params)

  return `${store.storeBaseUrl}image/${id}/src?${paramString}`
}

const getFeedbackImageUrl = (id: number, params: { [key: string]: string | undefined }) => {
  const store = coreStore()
  const paramString = toUrlString(params)

  return `${store.storeBaseUrl}feedback/${id}/img?${paramString}`
}

export {
  getImageUrl,
  getFeedbackImageUrl,
  getImageUrlById,
}
