import { authForm, authAxios, type ErrorHandler } from '@/plugins/api/base'
import { uuidv4 } from '@/plugins/util'
import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'
import type { AboutConfig, BackupResult, CarouselConfig, ClientAdminConfiguration, Comments, DataOrientation, ExportRequest, GenesysRequestDetails, LinkRequest, News, NewUnapprovedUserRequest, NewUserAccessRequest, PaginatedRequest, Publicationdata, Publications, TemplateI18n, ViewTableImages, ViewTableStories } from '@/plugins/types/germinate'

const apiGetSettings = <T>(onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'settings', success: onSuccess, error: onError })

const apiGetAdminSettings = <T>(onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'settings/admin', success: onSuccess, error: onError })

const apiPostAdminSettings = <T>(queryData: ClientAdminConfiguration, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'settings/admin', method: 'POST', data: queryData, success: onSuccess, error: onError })

const apiPostGatekeeperExisting = <T>(queryData: NewUserAccessRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'gatekeeper/user/existing', method: 'POST', data: queryData, success: onSuccess, error: onError })

const apiPostGatekeeperNew = <T>(queryData: NewUnapprovedUserRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'gatekeeper/user/new', method: 'POST', data: queryData, success: onSuccess, error: onError })

const apiGetLocales = <T>(onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `clientlocale?random=${uuidv4()}`, success: onSuccess, error: onError })

const apiPostTableExport = <T>(queryData: ExportRequest, tableType: string, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `${tableType}/table/export`, method: 'POST', dataType: 'blob', data: queryData, success: onSuccess, error: onError })

const apiPostInstitutionTable = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: 'institution/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostInstitutionDatasetTable = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: 'institution/dataset/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostGermplasmInstitutionTable = <T>(germplasmId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: `germplasm/${germplasmId}/institution/table`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiGetGatekeeperInstitutions = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: 'gatekeeper/institution', method: 'GET', data: queryData, success: onSuccess, error: onError })
}

const apiPostFeedbackUpload = <T>(formData: FormData, uuid: string, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authForm({ url: `feedback/${uuid}`, formData, success: onSuccess, error: onError })

const apiPostDataUpload = <T>(formData: FormData, templateType: string, isUpdate: boolean, dataOrientation: DataOrientation, datasetId: number, datasetStateId: number, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  return authForm({ url: `import/template/file?type=${templateType}&update=${isUpdate}&dataOrientation=${dataOrientation}&datasetStateId=${datasetStateId}&datasetId=${datasetId || ''}`, formData, success: onSuccess, error: onError })
}

const apiPostImages = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: 'image/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostImagesExport = <T>(queryData: ExportRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'image/table/export', method: 'POST', data: queryData, success: onSuccess, error: onError })

const apiGetImageTags = <T>(onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'imagetag', success: onSuccess, error: onError })

const apiGetImageTagsForId = <T>(referenceTable: string, foreignId: number, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `imagetag/${referenceTable}/${foreignId}`, success: onSuccess, error: onError })

const apiPutImageTags = <T>(imageId: number, data: string[], onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `image/${imageId}/tag`, method: 'PUT', data, success: onSuccess, error: onError })

const apiDeleteImage = <T>(imageId: number, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `image/${imageId}`, method: 'DELETE', success: onSuccess, error: onError })

const apiDeleteTemplateImageByName = <T>(name: string, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `image/${name}`, method: 'DELETE', success: onSuccess, error: onError })

const apiPostCarouselImage = <T>(formData: FormData, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authForm({ url: 'image/carousel', method: 'POST', formData, success: onSuccess, error: onError })

const apiPostAboutPartner = <T>(formData: FormData, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authForm({ url: 'settings/about', method: 'POST', formData, success: onSuccess, error: onError })

const apiGetTemplateCarouselConfig = <T>(onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'settings/carousel', success: onSuccess, error: onError })

const apiGetTemplateAboutConfig = <T>(onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'settings/about', success: onSuccess, error: onError })

const apiPostTemplateCarouselConfig = <T>(data: CarouselConfig, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'settings/carousel', method: 'POST', data, success: onSuccess, error: onError })

const apiPatchTemplateAboutConfig = <T>(data: AboutConfig, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'settings/about', method: 'PATCH', data, success: onSuccess, error: onError })

const apiPatchTemplateI18n = <T>(data: TemplateI18n, locale: string, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `settings/template/i18n/${locale}`, method: 'PATCH', data, success: onSuccess, error: onError })

const apiPatchImage = <T>(image: ViewTableImages, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `image/${image.imageId}`, method: 'PATCH', data: image, success: onSuccess, error: onError })

const apiPostNewsTable = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: 'news/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostMapOverlayTable = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: 'mapoverlay/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostNews = <T>(newsItem: News, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'news', method: 'POST', data: newsItem, success: onSuccess, error: onError })

const apiDeleteNews = <T>(newsId: number, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `news/${newsId}`, method: 'DELETE', success: onSuccess, error: onError })

const apiPostCommentsTable = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: 'comment/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPutComment = <T>(comment: Comments, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'comment', data: comment, method: 'PUT', success: onSuccess, error: onError })

const apiDeleteComment = <T>(commentId: number, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `comment/${commentId}`, method: 'DELETE', success: onSuccess, error: onError })

const apiPostLinks = <T>(queryData: LinkRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'link/table', method: 'POST', data: queryData, success: onSuccess, error: onError })

const apiPostDataImportStats = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: 'import/stats', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostDataAsyncImport = <T>(uuids: string[], onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  const queryData = {
    uuids,
  }
  return authAxios({ url: 'import/template', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiDeleteDataAsyncImport = <T>(uuid: string, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `import/template/${uuid}`, method: 'DELETE', success: onSuccess, error: onError })

const apiGetDataAsyncImportStart = <T>(uuid: string, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `import/template/${uuid}/import`, success: onSuccess, error: onError })

const apiGetDataAsyncImportLog = <T>(uuid: string, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `import/template/${uuid}/log`, dataType: 'blob', success: onSuccess, error: onError })

const apiGetPublicationById = <T>(publicationId: number, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `publication/${publicationId}`, success: onSuccess, error: onError })

const apiPostPublicationsTable = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: 'publication/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiGetPublications = <T>(type: string, id?: number, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `publicationtype/${type}/${id || ''}`, method: 'GET', success: onSuccess, error: onError })

const apiPutPublication = <T>(data: Publications, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'publication', method: 'PUT', data, success: onSuccess, error: onError })

const apiPutPublicationReference = <T>(publicationId: number, data: Publicationdata, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `publication/${publicationId}/reference`, method: 'PUT', data, success: onSuccess, error: onError })

const apiDeletePublicationReference = <T>(publicationId: number, referenceType: string, referenceId?: number, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `publication/${publicationId}/reference/${referenceType}/${referenceId || ''}`, method: 'DELETE', success: onSuccess, error: onError })

const apiGetBackups = <T>(onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'backup', method: 'GET', success: onSuccess, error: onError })

const apiDeleteBackup = <T>(backup: BackupResult, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'backup', method: 'DELETE', data: backup, success: onSuccess, error: onError })

const apiPutBackup = <T>(onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'backup', method: 'PUT', success: onSuccess, error: onError })

const apiPostUserFeedbackTable = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: 'feedback/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiGetUserFeedbackMarkAsRead = <T>(id: number, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `feedback/${id}/mark`, success: onSuccess, error: onError })

const apiDeleteUserFeedback = <T>(id: number, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `feedback/${id}`, method: 'DELETE', success: onSuccess, error: onError })

const apiPostStoryTable = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: 'story/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiDeleteStoryById = <T>(storyId: number, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `story/${storyId}`, method: 'DELETE', success: onSuccess, error: onError })

const apiPatchStory = <T>(storyId: number, data: ViewTableStories, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `story/${storyId}`, method: 'PATCH', data, success: onSuccess, error: onError })

const apiPostStoryUpload = <T>(formData: FormData, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authForm({ url: 'story', formData, success: onSuccess, error: onError })

const apiPostStoryStepUpload = <T>(storyId: number, formData: FormData, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authForm({ url: `story/${storyId}/step`, formData, success: onSuccess, error: onError })

const apiPostTemplateImage = <T>(formData: FormData, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authForm({ url: 'image/upload/template', formData, success: onSuccess, error: onError })

const apiDeleteStoryStep = <T>(storyId: number, storyStepId: number, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `story/${storyId}/step/${storyStepId}`, method: 'DELETE', success: onSuccess, error: onError })

const apiGetGenesysAvailable = <T>(onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'genesys/germplasm/status', success: onSuccess, error: onError })

const apiPostGenesysRequest = <T>(data: GenesysRequestDetails, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'genesys/germplasm', method: 'POST', data, success: onSuccess, error: onError })

export {
  apiGetSettings,
  apiGetAdminSettings,
  apiPostAdminSettings,
  apiPostGatekeeperExisting,
  apiPostGatekeeperNew,
  apiGetLocales,
  apiPostTableExport,
  apiPostInstitutionTable,
  apiPostInstitutionDatasetTable,
  apiPostGermplasmInstitutionTable,
  apiGetGatekeeperInstitutions,
  apiPostDataUpload,
  apiPostImages,
  apiPostImagesExport,
  apiGetImageTags,
  apiGetImageTagsForId,
  apiPutImageTags,
  apiDeleteImage,
  apiDeleteTemplateImageByName,
  apiPostCarouselImage,
  apiPostTemplateCarouselConfig,
  apiGetTemplateCarouselConfig,
  apiPatchTemplateAboutConfig,
  apiPostAboutPartner,
  apiGetTemplateAboutConfig,
  apiPatchImage,
  apiPostNewsTable,
  apiPostNews,
  apiDeleteNews,
  apiPostCommentsTable,
  apiPutComment,
  apiDeleteComment,
  apiPostLinks,
  apiPostDataAsyncImport,
  apiDeleteDataAsyncImport,
  apiGetDataAsyncImportStart,
  apiGetDataAsyncImportLog,
  apiGetPublicationById,
  apiPostPublicationsTable,
  apiGetPublications,
  apiPutPublication,
  apiPutPublicationReference,
  apiDeletePublicationReference,
  apiPostMapOverlayTable,
  apiPostUserFeedbackTable,
  apiPostFeedbackUpload,
  apiGetUserFeedbackMarkAsRead,
  apiPostDataImportStats,
  apiDeleteUserFeedback,
  apiPostStoryTable,
  apiDeleteStoryById,
  apiPostStoryUpload,
  apiPostStoryStepUpload,
  apiPatchStory,
  apiDeleteStoryStep,
  apiPatchTemplateI18n,
  apiPostTemplateImage,
  apiGetGenesysAvailable,
  apiPostGenesysRequest,
  apiGetBackups,
  apiPutBackup,
  apiDeleteBackup,
}
