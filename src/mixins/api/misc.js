export default {
  methods: {
    apiGetSettings: function (onSuccess, onError) {
      return this.authAjax({ url: 'settings', success: onSuccess, error: onError })
    },
    apiGetSettingsFile: function (queryData, onSuccess, onError) {
      return this.authAjax({ url: 'settings/file', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGatekeeperExisting: function (queryData, onSuccess, onError) {
      return this.authAjax({ url: 'gatekeeper/user/existing', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGatekeeperNew: function (queryData, onSuccess, onError) {
      return this.authAjax({ url: 'gatekeeper/user/new', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiGetLocales: function (onSuccess, onError) {
      return this.authAjax({ url: `clientlocale?random=${this.uuidv4()}`, success: onSuccess, error: onError })
    },
    apiPostTableExport: function (queryData, tableType, onSuccess, onError) {
      return this.authAjax({ url: `${tableType}/table/export`, method: 'POST', dataType: 'blob', data: queryData, success: onSuccess, error: onError })
    },
    apiPostInstitutionTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: 'institution/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiGetGatekeeperInstitutions: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: 'gatekeeper/institution', method: 'GET', data: queryData, success: onSuccess, error: onError })
    },
    apiPostDataUpload: function (formData, onSuccess, onError) {
      return this.authForm({ url: 'import/template/mcpd', formData: formData, success: onSuccess, error: onError })
    },
    apiGetDataUploadStatus: function (uuid, onSuccess, onError) {
      return this.authAjax({ url: `import/template/${uuid}/status`, success: onSuccess, error: onError })
    },
    apiPostImages: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: 'image/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostNewsTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: 'news/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    }
  }
}
