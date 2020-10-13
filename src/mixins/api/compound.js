export default {
  methods: {
    apiPostCompoundTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAxios({ url: 'compound/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostDatasetCompounds: function (datasetIds, onSuccess, onError) {
      const queryData = {
        datasetIds: datasetIds
      }
      return this.authAxios({ url: 'dataset/compound', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostCompoundDataTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAxios({ url: 'dataset/data/compound/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostCompoundDataTableIds: function (queryData, onSuccess, onError) {
      delete queryData.orderBy
      delete queryData.ascending
      return this.authAxios({ url: 'dataset/data/compound/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostCompoundDatasetTable: function (compoundId, queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAxios({ url: `compound/${compoundId}/dataset`, method: 'POST', data: queryData, success: onSuccess, error: onError })
    }
  }
}
