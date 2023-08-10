import store from '@/store'
import { toUrlString } from '@/mixins/formatting'

const getImageUrl = (name, params) => {
  const paramString = toUrlString(params)

  let finalName = name || ''
  let index = finalName.lastIndexOf('\\')
  if (index !== -1) {
    finalName = finalName.substring(index + 1)
  }
  index = finalName.lastIndexOf('/')
  if (index !== -1) {
    finalName = finalName.substring(index + 1)
  }

  return `${store.getters.storeBaseUrl}image/src/${encodeURI(finalName)}?${paramString}`
}

const getImageUrlById = (id, params) => {
  const paramString = toUrlString(params)

  return `${store.getters.storeBaseUrl}image/${id}/src?${paramString}`
}

const getFeedbackImageUrl = (id, params) => {
  const paramString = toUrlString(params)

  return `${store.getters.storeBaseUrl}feedback/${id}/img?${paramString}`
}

export {
  getImageUrl,
  getFeedbackImageUrl,
  getImageUrlById
}
