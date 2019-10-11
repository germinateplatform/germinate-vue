
const MAX_JAVA_INTEGER = 2147483647

export default {
  methods: {
    // TOKEN
    /**
     * Deletes the current json token
     *
     * @param {Object} user The user object containing the username and the token as the password
     * @param {function=} onSuccess Called on success
     * @param {function=} onError Called on failure
     * @returns A Promise
     */
    apiDeleteToken: function (user, onSuccess, onError) {
      return this.authAjax({ url: 'token', method: 'DELETE', data: user, success: onSuccess, error: onError })
    },
    /**
     * Requests a token given the user details
     *
     * @param {Object} user The user object containing the username and password
     * @param {function=} onSuccess Called on success
     * @param {function=} onError Called on failure
     * @returns A Promise
     */
    apiPostToken: function (user, onSuccess, onError) {
      return this.authAjax({ url: 'token', method: 'POST', data: user, success: onSuccess, error: onError })
    },
    apiGetGermplasm: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: 'germplasm', data: queryData, success: onSuccess, error: onError })
    },
    apiGetGermplasmMcpd: function (germplasmId, onSuccess, onError) {
      return this.authAjax({ url: `germplasm/${germplasmId}/mcpd`, success: onSuccess, error: onError })
    },
    apiPostGermplasmTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: 'germplasm/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGermplasmTableIds: function (queryData, onSuccess, onError) {
      delete queryData.orderBy
      delete queryData.ascending
      return this.authAjax({ url: 'germplasm/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGroupGermplasmTable: function (groupId, queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: `group/${groupId}/germplasm`, method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGroupGermplasmTableIds: function (groupId, queryData, onSuccess, onError) {
      delete queryData.orderBy
      delete queryData.ascending
      return this.authAjax({ url: `group/${groupId}/germplasm/ids`, method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
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
    apiPostTraitTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: 'trait/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
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
    apiPostGermplasmDistanceTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: 'germplasm/distance/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGermplasmDistanceTableIds: function (queryData, onSuccess, onError) {
      delete queryData.orderBy
      delete queryData.ascending
      return this.authAjax({ url: 'germplasm/distance/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostLocationPolygonTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      if (queryData.orderBy === 'distance') {
        delete queryData.orderBy
        delete queryData.ascending
      }
      return this.authAjax({ url: 'location/polygon/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGermplasmPolygonTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      if (queryData.orderBy === 'distance') {
        delete queryData.orderBy
        delete queryData.ascending
      }
      return this.authAjax({ url: 'germplasm/polygon/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostLocationPolygonTableIds: function (queryData, onSuccess, onError) {
      delete queryData.orderBy
      delete queryData.ascending
      return this.authAjax({ url: 'location/polygon/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGermplasmPolygonTableIds: function (queryData, onSuccess, onError) {
      delete queryData.orderBy
      delete queryData.ascending
      return this.authAjax({ url: 'germplasm/polygon/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostLocationTableIds: function (queryData, onSuccess, onError) {
      delete queryData.orderBy
      delete queryData.ascending
      return this.authAjax({ url: 'location/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGroupLocationTable: function (groupId, queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: `group/${groupId}/location`, method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGroupLocationTableIds: function (groupId, queryData, onSuccess, onError) {
      delete queryData.orderBy
      delete queryData.ascending
      return this.authAjax({ url: `group/${groupId}/location/ids`, method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiGetMap: function (mapId, onSuccess, onError) {
      return this.authAjax({ url: `map/${mapId}`, success: onSuccess, error: onError })
    },
    apiGetMapExport: function (mapId, onSuccess, onError) {
      return this.authAjax({ url: `map/${mapId}/export`, dataType: 'blob', success: onSuccess, error: onError })
    },
    apiPostCollaboratorsTable: function (datasetId, queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: `dataset/${datasetId}/collaborator`, method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostDatasetExport: function (experimentType, queryData, onSuccess, onError) {
      return this.authAjax({ url: `dataset/export/${experimentType}`, dataType: 'blob', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGenotypeDatasetExport: function (queryData, onSuccess, onError) {
      return this.authAjax({ url: 'dataset/export/genotype', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostDatasetTraits: function (datasetIds, onSuccess, onError) {
      const queryData = {
        datasetIds: datasetIds
      }
      return this.authAjax({ url: 'dataset/trait', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostDatasetGroups: function (queryData, onSuccess, onError) {
      return this.authAjax({ url: 'dataset/group', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostTrialsDataTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: 'dataset/data/trial', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostTrialsDataTableIds: function (queryData, onSuccess, onError) {
      delete queryData.orderBy
      delete queryData.ascending
      return this.authAjax({ url: 'dataset/data/trial/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostMapsTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: 'map/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostDatasetMapTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: 'dataset/map', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostMapdefinitionTable: function (mapId, queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: `map/${mapId}/mapdefinition/table`, method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostDatasetTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: 'dataset/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostDatasetTableIds: function (queryData, onSuccess, onError) {
      delete queryData.orderBy
      delete queryData.ascending
      return this.authAjax({ url: 'dataset/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostTableExport: function (queryData, tableType, onSuccess, onError) {
      return this.authAjax({ url: `${tableType}/table/export`, method: 'POST', dataType: 'blob', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGermplasmAttributeTableExport: function (germplasmId, queryData, onSuccess, onError) {
      var url = germplasmId !== null ? `germplasm/${germplasmId}/attribute/export` : 'germplasm/attribute/export'
      return this.authAjax({ url: url, method: 'POST', dataType: 'blob', data: queryData, success: onSuccess, error: onError })
    },
    apiPostDatasetAttributeTableExport: function (datasetId, queryData, onSuccess, onError) {
      var url = datasetId !== null ? `dataset/${datasetId}/attribute/export` : 'dataset/attribute/export'
      return this.authAjax({ url: url, method: 'POST', dataType: 'blob', data: queryData, success: onSuccess, error: onError })
    },
    apiPostDatasetAsyncExport: function (uuids, onSuccess, onError) {
      var queryData = {
        uuids: uuids
      }
      return this.authAjax({ url: 'dataset/export/async', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiDeleteDatasetAsyncExport: function (uuid, onSuccess, onError) {
      return this.authAjax({ url: `dataset/export/async/${uuid}`, method: 'DELETE', success: onSuccess, error: onError })
    },
    apiPostLicenseTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: 'license/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiGetAcceptLicense: function (licenseId, onSuccess, onError) {
      return this.authAjax({ url: `license/${licenseId}/accept`, success: onSuccess, error: onError })
    },
    apiGetOverviewStats: function (onSuccess, onError) {
      return this.authAjax({ url: 'stats/overview', success: onSuccess, error: onError })
    },
    apiGetEntityTypeStats: function (onSuccess, onError) {
      return this.authAjax({ url: 'stats/entitytype', success: onSuccess, error: onError })
    },
    apiGetSettings: function (onSuccess, onError) {
      return this.authAjax({ url: 'settings', success: onSuccess, error: onError })
    },
    apiGetSettingsFile: function (queryData, onSuccess, onError) {
      return this.authAjax({ url: 'settings/file', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGroupTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: 'group/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostTrialsStats: function (datasetIds, onSuccess, onError) {
      var queryData = {
        datasetIds: datasetIds
      }
      return this.authAjax({ url: 'dataset/stats/trial', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGermplasmGroupTable: function (germplasmId, queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: `germplasm/${germplasmId}/group`, method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGermplasmDatasetTable: function (germplasmId, queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: `germplasm/${germplasmId}/dataset`, method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGermplasmAttributeTable: function (germplasmId, queryData, onSuccess, onError) {
      queryData.page -= 1
      var url = germplasmId !== null ? `germplasm/${germplasmId}/attribute` : 'germplasm/attribute'
      return this.authAjax({ url: url, method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostDatasetAttributeTable: function (datasetId, queryData, onSuccess, onError) {
      queryData.page -= 1
      var url = datasetId !== null ? `dataset/${datasetId}/attribute` : 'dataset/attribute'
      return this.authAjax({ url: url, method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiGetGroup: function (groupId, onSuccess, onError) {
      return this.authAjax({ url: `group/${groupId}`, success: onSuccess, error: onError })
    },
    apiPatchGroup: function (group, onSuccess, onError) {
      return this.authAjax({ url: `group/${group.id}`, data: group, method: 'PATCH', success: onSuccess, error: onError })
    },
    apiDeleteGroup: function (groupId, onSuccess, onError) {
      return this.authAjax({ url: `group/${groupId}`, method: 'DELETE', success: onSuccess, error: onError })
    },
    apiPatchGroupMembers: function (groupId, groupType, groupModification, onSuccess, onError) {
      return this.authAjax({ url: `group/${groupId}/${groupType}`, method: 'PATCH', data: groupModification, success: onSuccess, error: onError })
    },
    apiGetGroupTypes: function (onSuccess, onError) {
      return this.authAjax({ url: `grouptype?limit=${MAX_JAVA_INTEGER}`, success: onSuccess, error: onError })
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
    apiPostEntityIds: function (ids, direction, onSuccess, onError) {
      return this.authAjax({ url: `germplasm/entity?direction=${direction}`, method: 'POST', data: ids, success: onSuccess, error: onError })
    },
    apiPostPedigreeTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: 'pedigree/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostEntityTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: 'entity/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    }
  }
}
