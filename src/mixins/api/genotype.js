const MAX_JAVA_INTEGER = 2147483647

export default {
  methods: {
    apiPostMarkerTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAxios({ url: 'marker/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostMarkerTableIds: function (queryData, onSuccess, onError) {
      delete queryData.orderBy
      delete queryData.ascending
      return this.authAxios({ url: 'marker/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGroupMarkerTable: function (groupId, queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAxios({ url: `group/${groupId}/marker`, method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGroupMarkerTableIds: function (groupId, queryData, onSuccess, onError) {
      delete queryData.orderBy
      delete queryData.ascending
      return this.authAxios({ url: `group/${groupId}/marker/ids`, method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGenotypeDatasetSummary: function (queryData, onSuccess, onError) {
      queryData.page = 0
      queryData.limit = MAX_JAVA_INTEGER
      return this.authAxios({ url: 'dataset/export/genotype/summary', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGenotypeDatasetExport: function (queryData, onSuccess, onError) {
      return this.authAxios({ url: 'dataset/export/genotype', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGroupMarkerTableExport: function (groupId, queryData, onSuccess, onError) {
      return this.authAxios({ url: `group/${groupId}/marker/export`, method: 'POST', dataType: 'blob', data: queryData, success: onSuccess, error: onError })
    },
    apiPostMarkerGroupTable: function (markerId, queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAxios({ url: `marker/${markerId}/group`, method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostMapsTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAxios({ url: 'map/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostDatasetMapTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAxios({ url: 'dataset/map', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostMapdefinitionTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAxios({ url: 'map/mapdefinition/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostMapdefinitionTableIds: function (queryData, onSuccess, onError) {
      delete queryData.orderBy
      delete queryData.ascending
      return this.authAxios({ url: 'map/mapdefinition/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiGetMap: function (mapId, onSuccess, onError) {
      return this.authAxios({ url: `map/${mapId}`, success: onSuccess, error: onError })
    },
    apiGetMapChromosomes: function (mapId, onSuccess, onError) {
      return this.authAxios({ url: `map/${mapId}/chromosome`, success: onSuccess, error: onError })
    },
    apiPostMapExport: function (mapId, queryData, onSuccess, onError) {
      return this.authAxios({ url: `map/${mapId}/export`, method: 'POST', data: queryData, dataType: 'blob', success: onSuccess, error: onError })
    },
    apiPostAlleleFrequencyDatasetExport: function (queryData, onSuccess, onError) {
      return this.authAxios({ url: 'dataset/export/allelefreq', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostMarkerDatasetTable: function (markerId, queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAxios({ url: `marker/${markerId}/dataset`, method: 'POST', data: queryData, success: onSuccess, error: onError })
    }
  }
}
