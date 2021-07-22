export default {
  methods: {
    apiGetGermplasm: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAxios({ url: 'germplasm', data: queryData, success: onSuccess, error: onError })
    },
    apiGetGermplasmMcpd: function (germplasmId, onSuccess, onError) {
      return this.authAxios({ url: `germplasm/${germplasmId}/mcpd`, success: onSuccess, error: onError })
    },
    apiPostGermplasmTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAxios({ url: 'germplasm/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGermplasmTableCW: function (queryData, namesFromFile, onSuccess, onError) {
      queryData.page -= 1
      return this.authAxios({ url: `germplasm/table?namesFromFile=${namesFromFile}`, method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGermplasmTableCWIds: function (queryData, namesFromFile, onSuccess, onError) {
      delete queryData.orderBy
      delete queryData.ascending
      return this.authAxios({ url: `germplasm/table/ids?namesFromFile=${namesFromFile}`, method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGermplasmTableIds: function (queryData, onSuccess, onError) {
      delete queryData.orderBy
      delete queryData.ascending
      return this.authAxios({ url: 'germplasm/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGroupGermplasmTable: function (groupId, queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAxios({ url: `group/${groupId}/germplasm`, method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGroupGermplasmTableExport: function (groupId, queryData, onSuccess, onError) {
      return this.authAxios({ url: `group/${groupId}/germplasm/export`, method: 'POST', dataType: 'blob', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGroupGermplasmTableIds: function (groupId, queryData, onSuccess, onError) {
      delete queryData.orderBy
      delete queryData.ascending
      return this.authAxios({ url: `group/${groupId}/germplasm/ids`, method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGermplasmDistanceTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAxios({ url: 'germplasm/distance/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGermplasmDistanceTableIds: function (queryData, onSuccess, onError) {
      delete queryData.orderBy
      delete queryData.ascending
      return this.authAxios({ url: 'germplasm/distance/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGermplasmPolygonTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      if (queryData.orderBy === 'distance') {
        delete queryData.orderBy
        delete queryData.ascending
      }
      return this.authAxios({ url: 'germplasm/polygon/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGermplasmPolygonTableIds: function (queryData, onSuccess, onError) {
      delete queryData.orderBy
      delete queryData.ascending
      return this.authAxios({ url: 'germplasm/polygon/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGermplasmAttributeTableExport: function (queryData, onSuccess, onError) {
      return this.authAxios({ url: 'germplasm/attribute/export', method: 'POST', dataType: 'blob', data: queryData, success: onSuccess, error: onError })
    },
    apiExportPassport: function (queryData, onSuccess, onError) {
      return this.authAxios({ url: 'germplasm/export', method: 'POST', dataType: 'blob', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGermplasmGroupTable: function (germplasmId, queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAxios({ url: `germplasm/${germplasmId}/group`, method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGermplasmDatasetTable: function (germplasmId, queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAxios({ url: `germplasm/${germplasmId}/dataset`, method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGermplasmAttributeTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAxios({ url: 'germplasm/attribute', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostEntityIds: function (ids, direction, onSuccess, onError) {
      return this.authAxios({ url: `germplasm/entity?direction=${direction}`, method: 'POST', data: ids, success: onSuccess, error: onError })
    },
    apiPostPedigreeTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAxios({ url: 'pedigree/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostPedigreeExport: function (queryData, onSuccess, onError) {
      return this.authAxios({ url: 'pedigree/export', method: 'POST', dataType: 'blob', data: queryData, success: onSuccess, error: onError })
    },
    apiPostEntityTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAxios({ url: 'entity/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostExternalLinkIdentifiers: function (queryData, onSuccess, onError) {
      return this.authAxios({ url: 'germplasm/external/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiGetGermplasmStatsTraits: function (germplasmId, onSuccess, onError) {
      return this.authAxios({ url: `germplasm/${germplasmId}/stats/trait`, success: onSuccess, error: onError })
    },
    apiGetTaxonomyData: function (onSuccess, onError) {
      return this.authAxios({ url: `germplasm/taxonomy`, success: onSuccess, error: onError })
    },
    apiGetLocationData: function (onSuccess, onError) {
      return this.authAxios({ url: `germplasm/location`, success: onSuccess, error: onError })
    },
    apiGetBiologicalStatusData: function (onSuccess, onError) {
      return this.authAxios({ url: `germplasm/biologicalstatus`, success: onSuccess, error: onError })
    },
    apiGetGermplasmTableColumns: function (onSuccess, onError) {
      return this.authAxios({ url: 'germplasm/table/columns', success: onSuccess, error: onError })
    },
    apiPostGermplasmUnification: function (queryData, onSuccess, onError) {
      return this.authAxios({ url: 'germplasm/unify', data: queryData, method: 'POST', success: onSuccess, error: onError })
    }
  }
}
