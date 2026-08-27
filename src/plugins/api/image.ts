import type { ExportRequest, ImageTag, PaginatedRequest, PaginatedResult, ViewTableImages } from '@/plugins/types/germinate'
import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'
import { authAxios, authForm, type ErrorHandler } from '@/plugins/api/base'

export function apiPostImages (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableImages[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'image/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostImagesExport (queryData: ExportRequest, onSuccess?: GerminateResponseHandler<Blob>, onError?: ErrorHandler) {
  return authAxios({ url: 'image/table/export', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiGetImageTags (onSuccess?: GerminateResponseHandler<PaginatedResult<ImageTag[]>>, onError?: ErrorHandler) {
  return authAxios({ url: 'imagetag', success: onSuccess, error: onError })
}

export function apiGetImageTagsForId (referenceTable: string, foreignId: number, onSuccess?: GerminateResponseHandler<PaginatedResult<ImageTag[]>>, onError?: ErrorHandler) {
  return authAxios({ url: `imagetag/${referenceTable}/${foreignId}`, success: onSuccess, error: onError })
}

export function apiPutImageTags (imageId: number, data: string[], onSuccess?: GerminateResponseHandler<void>, onError?: ErrorHandler) {
  return authAxios({ url: `image/${imageId}/tag`, method: 'PUT', data, success: onSuccess, error: onError })
}

export function apiDeleteImage (imageId: number, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: `image/${imageId}`, method: 'DELETE', success: onSuccess, error: onError })
}

export function apiDeleteTemplateImageByName (name: string, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: `image/${name}`, method: 'DELETE', success: onSuccess, error: onError })
}

export function apiPostCarouselImage (formData: FormData, onSuccess?: GerminateResponseHandler<string>, onError?: ErrorHandler) {
  return authForm({ url: 'image/carousel', method: 'POST', formData, success: onSuccess, error: onError })
}

export function apiPatchImage (image: ViewTableImages, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: `image/${image.imageId}`, method: 'PATCH', data: image, success: onSuccess, error: onError })
}

export function apiPostTemplateImage (formData: FormData, onSuccess?: GerminateResponseHandler<string>, onError?: ErrorHandler) {
  return authForm({ url: 'image/upload/template', formData, success: onSuccess, error: onError })
}
