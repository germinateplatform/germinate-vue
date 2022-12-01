import store from '@/store'
import { toUrlString } from '@/mixins/formatting'

const getImageUrl = (name, params) => {
  const paramString = toUrlString(params)

  let index = name.lastIndexOf('\\')
  if (index !== -1) {
    name = name.substring(index + 1)
  }
  index = name.lastIndexOf('/')
  if (index !== -1) {
    name = name.substring(index + 1)
  }

  return `${store.getters.storeBaseUrl}image/src/${encodeURI(name)}?${paramString}`
}

const getFeedbackImageUrl = (id, params) => {
  const paramString = toUrlString(params)

  return `${store.getters.storeBaseUrl}feedback/${id}/img?${paramString}`
}

export {
  getImageUrl,
  getFeedbackImageUrl
}
