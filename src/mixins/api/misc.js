import { authForm, authAxios } from '@/mixins/api/base'
import { uuidv4 } from '@/mixins/util'

const apiGetSettings = (onSuccess, onError) => authAxios({ url: 'settings', success: onSuccess, error: onError })

const apiGetAdminSettings = (onSuccess, onError) => authAxios({ url: 'settings/admin', success: onSuccess, error: onError })

const apiPostAdminSettings = (queryData, onSuccess, onError) => authAxios({ url: 'settings/admin', method: 'POST', data: queryData, success: onSuccess, error: onError })

const apiPostGatekeeperExisting = (queryData, onSuccess, onError) => authAxios({ url: 'gatekeeper/user/existing', method: 'POST', data: queryData, success: onSuccess, error: onError })

const apiPostGatekeeperNew = (queryData, onSuccess, onError) => authAxios({ url: 'gatekeeper/user/new', method: 'POST', data: queryData, success: onSuccess, error: onError })

const apiGetLocales = (onSuccess, onError) => authAxios({ url: `clientlocale?random=${uuidv4()}`, success: onSuccess, error: onError })

const apiPostTableExport = (queryData, tableType, onSuccess, onError) => authAxios({ url: `${tableType}/table/export`, method: 'POST', dataType: 'blob', data: queryData, success: onSuccess, error: onError })

const apiPostInstitutionTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: 'institution/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostInstitutionDatasetTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: 'institution/dataset/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostGermplasmInstitutionTable = (germplasmId, queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: `germplasm/${germplasmId}/institution/table`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiGetGatekeeperInstitutions = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: 'gatekeeper/institution', method: 'GET', data: queryData, success: onSuccess, error: onError })
}

const apiPostFeedbackUpload = (formData, uuid, onSuccess, onError) => authForm({ url: `feedback/${uuid}`, formData: formData, success: onSuccess, error: onError })

const apiPostDataUpload = (formData, templateType, isUpdate, dataOrientation, datasetId, datasetStateId, onSuccess, onError) => {
  return authForm({ url: `import/template/file?type=${templateType}&update=${isUpdate}&dataOrientation=${dataOrientation}&datasetStateId=${datasetStateId}&datasetId=${datasetId || ''}`, formData: formData, success: onSuccess, error: onError })
}

const apiPostImages = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: 'image/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostImagesExport = (queryData, onSuccess, onError) => authAxios({ url: 'image/table/export', method: 'POST', data: queryData, success: onSuccess, error: onError })

const apiGetImageTags = (onSuccess, onError) => authAxios({ url: 'imagetag', success: onSuccess, error: onError })

const apiGetImageTagsForId = (referenceTable, foreignId, onSuccess, onError) => authAxios({ url: `imagetag/${referenceTable}/${foreignId}`, success: onSuccess, error: onError })

const apiPutImageTags = (imageId, data, onSuccess, onError) => authAxios({ url: `image/${imageId}/tag`, method: 'PUT', data: data, success: onSuccess, error: onError })

const apiDeleteImage = (imageId, onSuccess, onError) => authAxios({ url: `image/${imageId}`, method: 'DELETE', success: onSuccess, error: onError })

const apiDeleteTemplateImageByName = (name, onSuccess, onError) => authAxios({ url: `image/${name}`, method: 'DELETE', success: onSuccess, error: onError })

const apiPostCarouselImage = (formData, onSuccess, onError) => authForm({ url: 'image/carousel', method: 'POST', formData: formData, success: onSuccess, error: onError })

const apiPostAboutPartner = (formData, onSuccess, onError) => authForm({ url: 'settings/about', method: 'POST', formData: formData, success: onSuccess, error: onError })

const apiGetTemplateCarouselConfig = (onSuccess, onError) => authAxios({ url: 'settings/carousel', success: onSuccess, error: onError })

const apiGetTemplateAboutConfig = (onSuccess, onError) => authAxios({ url: 'settings/about', success: onSuccess, error: onError })

const apiPostTemplateCarouselConfig = (data, onSuccess, onError) => authAxios({ url: 'settings/carousel', method: 'POST', data: data, success: onSuccess, error: onError })

const apiPatchTemplateAboutConfig = (data, onSuccess, onError) => authAxios({ url: 'settings/about', method: 'PATCH', data: data, success: onSuccess, error: onError })

const apiPatchTemplateI18n = (data, locale, onSuccess, onError) => authAxios({ url: `settings/template/i18n/${locale}`, method: 'PATCH', data: data, success: onSuccess, error: onError })

const apiPatchImage = (image, onSuccess, onError) => authAxios({ url: `image/${image.imageId}`, method: 'PATCH', data: image, success: onSuccess, error: onError })

const apiPostNewsTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: 'news/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostMapOverlayTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: 'mapoverlay/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostNews = (newsItem, onSuccess, onError) => authAxios({ url: 'news', method: 'POST', data: newsItem, success: onSuccess, error: onError })

const apiDeleteNews = (newsId, onSuccess, onError) => authAxios({ url: `news/${newsId}`, method: 'DELETE', success: onSuccess, error: onError })

const apiPostCommentsTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: 'comment/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPutComment = (comment, onSuccess, onError) => authAxios({ url: 'comment', data: comment, method: 'PUT', success: onSuccess, error: onError })

const apiDeleteComment = (commentId, onSuccess, onError) => authAxios({ url: `comment/${commentId}`, method: 'DELETE', success: onSuccess, error: onError })

const apiPostLinks = (queryData, onSuccess, onError) => authAxios({ url: 'link/table', method: 'POST', data: queryData, success: onSuccess, error: onError })

const apiPostDataImportStats = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: 'import/stats', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostDataAsyncImport = (uuids, onSuccess, onError) => {
  const queryData = {
    uuids: uuids
  }
  return authAxios({ url: 'import/template', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiDeleteDataAsyncImport = (uuid, onSuccess, onError) => authAxios({ url: `import/template/${uuid}`, method: 'DELETE', success: onSuccess, error: onError })

const apiGetDataAsyncImportStart = (uuid, onSuccess, onError) => authAxios({ url: `import/template/${uuid}/import`, success: onSuccess, error: onError })

const apiGetDataAsyncImportLog = (uuid, onSuccess, onError) => authAxios({ url: `import/template/${uuid}/log`, dataType: 'blob', success: onSuccess, error: onError })

const apiGetPublicationById = (publicationId, onSuccess, onError) => authAxios({ url: `publication/${publicationId}`, success: onSuccess, error: onError })

const apiPostPublicationsTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: 'publication/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiGetPublications = (type, id, onSuccess, onError) => authAxios({ url: `publicationtype/${type}/${id || ''}`, method: 'GET', success: onSuccess, error: onError })

const apiPutPublication = (data, onSuccess, onError) => authAxios({ url: 'publication', method: 'PUT', data: data, success: onSuccess, error: onError })

const apiPutPublicationReference = (publicationId, data, onSuccess, onError) => authAxios({ url: `publication/${publicationId}/reference`, method: 'PUT', data: data, success: onSuccess, error: onError })

const apiDeletePublicationReference = (publicationId, referenceType, referenceId, onSuccess, onError) => authAxios({ url: `publication/${publicationId}/reference/${referenceType}/${referenceId || ''}`, method: 'DELETE', success: onSuccess, error: onError })

const apiGetBackups = (onSuccess, onError) => authAxios({ url: 'backup', method: 'GET', success: onSuccess, error: onError })

const apiDeleteBackup = (backup, onSuccess, onError) => authAxios({ url: 'backup', method: 'DELETE', data: backup, success: onSuccess, error: onError })

const apiPutBackup = (onSuccess, onError) => authAxios({ url: 'backup', method: 'PUT', success: onSuccess, error: onError })

const apiPostUserFeedbackTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: 'feedback/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiGetUserFeedbackMarkAsRead = (id, onSuccess, onError) => authAxios({ url: `feedback/${id}/mark`, success: onSuccess, error: onError })

const apiDeleteUserFeedback = (id, onSuccess, onError) => authAxios({ url: `feedback/${id}`, method: 'DELETE', success: onSuccess, error: onError })

const apiPostStoryTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: 'story/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiDeleteStoryById = (storyId, onSuccess, onError) => authAxios({ url: `story/${storyId}`, method: 'DELETE', success: onSuccess, error: onError })

const apiPatchStory = (storyId, data, onSuccess, onError) => authAxios({ url: `story/${storyId}`, method: 'PATCH', data: data, success: onSuccess, error: onError })

const apiPostStoryUpload = (formData, onSuccess, onError) => authForm({ url: 'story', formData: formData, success: onSuccess, error: onError })

const apiPostStoryStepUpload = (storyId, formData, onSuccess, onError) => authForm({ url: `story/${storyId}/step`, formData: formData, success: onSuccess, error: onError })

const apiPostTemplateImage = (formData, onSuccess, onError) => authForm({ url: 'image/upload/template', formData: formData, success: onSuccess, error: onError })

const apiDeleteStoryStep = (storyId, storyStepId, onSuccess, onError) => authAxios({ url: `story/${storyId}/step/${storyStepId}`, method: 'DELETE', success: onSuccess, error: onError })

const apiGetGenesysAvailable = (onSuccess, onError) => authAxios({ url: 'genesys/germplasm/status', success: onSuccess, error: onError })

const apiPostGenesysRequest = (data, onSuccess, onError) => authAxios({ url: 'genesys/germplasm', method: 'POST', data: data, success: onSuccess, error: onError })

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
  apiDeleteBackup
}
