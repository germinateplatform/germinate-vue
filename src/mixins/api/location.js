export default {
  methods: {
    apiPostLocationTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: 'location/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostLocationDistanceTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: 'location/distance/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostLocationDistanceTableIds: function (queryData, onSuccess, onError) {
      delete queryData.orderBy
      delete queryData.ascending
      return this.authAjax({ url: 'location/distance/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostLocationPolygonTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      if (queryData.orderBy === 'distance') {
        delete queryData.orderBy
        delete queryData.ascending
      }
      return this.authAjax({ url: 'location/polygon/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostLocationPolygonTableIds: function (queryData, onSuccess, onError) {
      delete queryData.orderBy
      delete queryData.ascending
      return this.authAjax({ url: 'location/polygon/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostLocationTableIds: function (queryData, onSuccess, onError) {
      delete queryData.orderBy
      delete queryData.ascending
      return this.authAjax({ url: 'location/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGroupLocationTableExport: function (groupId, queryData, onSuccess, onError) {
      return this.authAjax({ url: `group/${groupId}/location/export`, method: 'POST', dataType: 'blob', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGroupLocationTable: function (groupId, queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: `group/${groupId}/location`, method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGroupLocationTableIds: function (groupId, queryData, onSuccess, onError) {
      delete queryData.orderBy
      delete queryData.ascending
      return this.authAjax({ url: `group/${groupId}/location/ids`, method: 'POST', data: queryData, success: onSuccess, error: onError })
    }
  }
}
