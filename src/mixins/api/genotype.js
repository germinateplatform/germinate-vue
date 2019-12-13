const MAX_JAVA_INTEGER = 2147483647

export default {
  methods: {
    apiPostMarkerTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: 'marker/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostMarkerTableIds: function (queryData, onSuccess, onError) {
      delete queryData.orderBy
      delete queryData.ascending
      return this.authAjax({ url: 'marker/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGroupMarkerTable: function (groupId, queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: `group/${groupId}/marker`, method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGroupMarkerTableIds: function (groupId, queryData, onSuccess, onError) {
      delete queryData.orderBy
      delete queryData.ascending
      return this.authAjax({ url: `group/${groupId}/marker/ids`, method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGenotypeDatasetSummary: function (queryData, onSuccess, onError) {
      queryData.page = 0
      queryData.limit = MAX_JAVA_INTEGER
      return this.authAjax({ url: 'dataset/export/genotype/summary', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGenotypeDatasetExport: function (queryData, onSuccess, onError) {
      this.$ga.event('export', 'async', 'genotype', queryData.datasetIds.join('-'))
      return this.authAjax({ url: 'dataset/export/genotype', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostMapsTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: 'map/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostDatasetMapTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: 'dataset/map', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostMapdefinitionTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: 'map/mapdefinition/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostMapdefinitionTableIds: function (queryData, onSuccess, onError) {
      delete queryData.orderBy
      delete queryData.ascending
      return this.authAjax({ url: 'map/mapdefinition/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiGetMap: function (mapId, onSuccess, onError) {
      return this.authAjax({ url: `map/${mapId}`, success: onSuccess, error: onError })
    },
    apiGetMapChromosomes: function (mapId, onSuccess, onError) {
      return this.authAjax({ url: `map/${mapId}/chromosome`, success: onSuccess, error: onError })
    },
    apiPostMapExport: function (mapId, queryData, onSuccess, onError) {
      return this.authAjax({ url: `map/${mapId}/export`, method: 'POST', data: queryData, dataType: 'blob', success: onSuccess, error: onError })
    },
    apiPostAlleleFrequencyDatasetExport: function (queryData, onSuccess, onError) {
      this.$ga.event('export', 'async', 'allelefreq', queryData.datasetIds.join('-'))
      return this.authAjax({ url: 'dataset/export/allelefreq', method: 'POST', data: queryData, success: onSuccess, error: onError })
    }
  }
}
