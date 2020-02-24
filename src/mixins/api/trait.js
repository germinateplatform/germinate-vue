export default {
  methods: {
    apiPostTrialsDataTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: 'dataset/data/trial/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostTrialsDataTableIds: function (queryData, onSuccess, onError) {
      delete queryData.orderBy
      delete queryData.ascending
      return this.authAjax({ url: 'dataset/data/trial/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostTraitTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: 'trait/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostDatasetTraits: function (datasetIds, onSuccess, onError) {
      const queryData = {
        datasetIds: datasetIds
      }
      return this.authAjax({ url: 'dataset/trait', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostTraitDatasetTable: function (traitId, queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: `trait/${traitId}/dataset`, method: 'POST', data: queryData, success: onSuccess, error: onError })
    }
  }
}
