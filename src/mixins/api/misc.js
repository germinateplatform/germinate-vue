export default {
  methods: {
    apiGetSettings: function (onSuccess, onError) {
      return this.authAxios({ url: 'settings', success: onSuccess, error: onError })
    },
    apiGetSettingsFile: function (queryData, onSuccess, onError) {
      return this.authAxios({ url: 'settings/file', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGatekeeperExisting: function (queryData, onSuccess, onError) {
      return this.authAxios({ url: 'gatekeeper/user/existing', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGatekeeperNew: function (queryData, onSuccess, onError) {
      return this.authAxios({ url: 'gatekeeper/user/new', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiGetLocales: function (onSuccess, onError) {
      return this.authAxios({ url: `clientlocale?random=${this.uuidv4()}`, success: onSuccess, error: onError })
    },
    apiPostTableExport: function (queryData, tableType, onSuccess, onError) {
      return this.authAxios({ url: `${tableType}/table/export`, method: 'POST', dataType: 'blob', data: queryData, success: onSuccess, error: onError })
    },
    apiPostInstitutionTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAxios({ url: 'institution/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiGetGatekeeperInstitutions: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAxios({ url: 'gatekeeper/institution', method: 'GET', data: queryData, success: onSuccess, error: onError })
    },
    apiPostDataUpload: function (formData, templateType, isUpdate, onSuccess, onError) {
      return this.authForm({ url: `import/template/file?type=${templateType}&update=${isUpdate}`, formData: formData, success: onSuccess, error: onError })
    },
    apiPostImages: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAxios({ url: 'image/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostImageForm: function (foreignId, referenceTable, form, onSuccess, onError) {
      return this.authForm({ url: `image/${referenceTable}/${foreignId}`, formData: form, success: onSuccess, error: onError })
    },
    apiPostImagesExport: function (queryData, onSuccess, onError) {
      return this.authAxios({ url: 'image/table/export', method: 'POST', dataType: 'blob', data: queryData, success: onSuccess, error: onError })
    },
    apiGetImageTags: function (onSuccess, onError) {
      return this.authAxios({ url: 'imagetag', success: onSuccess, error: onError })
    },
    apiGetImageTagsForId: function (referenceTable, foreignId, onSuccess, onError) {
      return this.authAxios({ url: `imagetag/${referenceTable}/${foreignId}`, success: onSuccess, error: onError })
    },
    apiPutImageTags: function (imageId, data, onSuccess, onError) {
      return this.authAxios({ url: `image/${imageId}/tag`, method: 'PUT', data: data, success: onSuccess, error: onError })
    },
    apiDeleteImage: function (imageId, onSuccess, onError) {
      return this.authAxios({ url: `image/${imageId}`, method: 'DELETE', success: onSuccess, error: onError })
    },
    apiPatchImage: function (image, onSuccess, onError) {
      return this.authAxios({ url: `image/${image.imageId}`, method: 'PATCH', data: image, success: onSuccess, error: onError })
    },
    apiPostNewsTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAxios({ url: 'news/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostNews: function (newsItem, onSuccess, onError) {
      return this.authAxios({ url: 'news', method: 'POST', data: newsItem, success: onSuccess, error: onError })
    },
    apiDeleteNews: function (newsId, onSuccess, onError) {
      return this.authAxios({ url: `news/${newsId}`, method: 'DELETE', success: onSuccess, error: onError })
    },
    apiPostCommentsTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAxios({ url: 'comment/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPutComment: function (comment, onSuccess, onError) {
      return this.authAxios({ url: 'comment', data: comment, method: 'PUT', success: onSuccess, error: onError })
    },
    apiDeleteComment: function (commentId, onSuccess, onError) {
      return this.authAxios({ url: `comment/${commentId}`, method: 'DELETE', success: onSuccess, error: onError })
    },
    apiPostLinks: function (queryData, onSuccess, onError) {
      return this.authAxios({ url: 'link/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostDataAsyncImport: function (uuids, onSuccess, onError) {
      const queryData = {
        uuids: uuids
      }
      return this.authAxios({ url: 'import/template', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiDeleteDataAsyncImport: function (uuid, onSuccess, onError) {
      return this.authAxios({ url: `import/template/${uuid}`, method: 'DELETE', success: onSuccess, error: onError })
    },
    apiGetDataAsyncImportStart: function (uuid, onSuccess, onError) {
      return this.authAxios({ url: `import/template/${uuid}/import`, success: onSuccess, error: onError })
    },
    apiGetDataResource: function (id, onSuccess, onError) {
      return this.authAxios({ url: `fileresource/${id}`, dataType: 'blob', success: onSuccess, error: onError })
    }
  }
}
