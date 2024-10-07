import { authAxios } from '@/mixins/api/base'

const apiGetGermplasmMcpd = (germplasmId, onSuccess, onError) => authAxios({ url: `germplasm/${germplasmId}/mcpd`, success: onSuccess, error: onError })

const apiPostGermplasmTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: 'germplasm/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostGermplasmTableCW = (queryData, namesFromFile, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: `germplasm/table?namesFromFile=${namesFromFile}`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostGermplasmTableCWIds = (queryData, namesFromFile, onSuccess, onError) => {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: `germplasm/table/ids?namesFromFile=${namesFromFile}`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostGermplasmTableIds = (queryData, onSuccess, onError) => {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'germplasm/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostPublicationGermplasmTable = (publicationId, queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: `publication/${publicationId}/germplasm`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostGroupGermplasmTable = (groupId, queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: `group/${groupId}/germplasm`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostGroupGermplasmTableExport = (groupId, queryData, onSuccess, onError) => authAxios({ url: `group/${groupId}/germplasm/export`, method: 'POST', dataType: 'blob', data: queryData, success: onSuccess, error: onError })

const apiPostGroupGermplasmTableIds = (groupId, queryData, onSuccess, onError) => {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: `group/${groupId}/germplasm/ids`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostGermplasmDistanceTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: 'germplasm/distance/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostGermplasmDistanceTableIds = (queryData, onSuccess, onError) => {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'germplasm/distance/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostGermplasmPolygonTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  if (queryData.orderBy === 'distance') {
    delete queryData.orderBy
    delete queryData.ascending
  }
  return authAxios({ url: 'germplasm/polygon/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostGermplasmPolygonTableIds = (queryData, onSuccess, onError) => {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'germplasm/polygon/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostGermplasmAttributeTableExport = (queryData, onSuccess, onError) => authAxios({ url: 'germplasm/attribute/export', method: 'POST', dataType: 'blob', data: queryData, success: onSuccess, error: onError })

const apiExportPassport = (queryData, onSuccess, onError) => authAxios({ url: 'germplasm/export', method: 'POST', dataType: 'blob', data: queryData, success: onSuccess, error: onError })

const apiPostGermplasmGroupTable = (germplasmId, queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: `germplasm/${germplasmId}/group`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostGermplasmDatasetTable = (germplasmId, queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: `germplasm/${germplasmId}/dataset`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostGermplasmAttributeTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: 'germplasm/attribute', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostEntityIds = (ids, direction, onSuccess, onError) => authAxios({ url: `germplasm/entity?direction=${direction}`, method: 'POST', data: ids, success: onSuccess, error: onError })

const apiPostPedigreeTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: 'pedigree/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostEntityTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: 'entity/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostExternalLinkIdentifiers = (queryData, onSuccess, onError) => authAxios({ url: 'germplasm/external/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })

const apiGetGermplasmStatsTraits = (germplasmId, onSuccess, onError) => authAxios({ url: `germplasm/${germplasmId}/stats/trait`, success: onSuccess, error: onError })

const apiGetGermplasmDataWarnings = (germplasmId, onSuccess, onError) => authAxios({ url: `datawarning/germplasm/${germplasmId}`, success: onSuccess, error: onError })

const apiGetTaxonomyData = (onSuccess, onError) => authAxios({ url: 'germplasm/taxonomy', success: onSuccess, error: onError })

const apiGetLocationData = (onSuccess, onError) => authAxios({ url: 'germplasm/location', success: onSuccess, error: onError })

const apiGetBiologicalStatusData = (onSuccess, onError) => authAxios({ url: 'germplasm/biologicalstatus', success: onSuccess, error: onError })

const apiGetGermplasmTableColumns = (onSuccess, onError) => authAxios({ url: 'germplasm/table/columns', success: onSuccess, error: onError })

const apiPostGermplasmUnification = (queryData, onSuccess, onError) => authAxios({ url: 'germplasm/unify', data: queryData, method: 'POST', success: onSuccess, error: onError })

const apiPostGermplasmUnificationSgone = (queryData, onSuccess, onError) => authAxios({ url: 'germplasm/unify/sgone', data: queryData, method: 'POST', success: onSuccess, error: onError })

const apiPatchGermplasmLocation = (germplasmId, location, onSuccess, onError) => authAxios({ url: `germplasm/${germplasmId}/location`, data: location, method: 'PATCH', success: onSuccess, error: onError })

const apiPostPedigreedefinitionTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: 'pedigreedefinition/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostPedigreeDatasetExport = (queryData, onSuccess, onError) => authAxios({ url: 'dataset/export/pedigree-async', method: 'POST', data: queryData, success: onSuccess, error: onError })

export {
  apiGetGermplasmMcpd,
  apiPostGermplasmTable,
  apiPostGermplasmTableCW,
  apiPostGermplasmTableCWIds,
  apiPostGermplasmTableIds,
  apiPostPublicationGermplasmTable,
  apiPostGroupGermplasmTable,
  apiPostGroupGermplasmTableExport,
  apiPostGroupGermplasmTableIds,
  apiPostGermplasmDistanceTable,
  apiPostGermplasmDistanceTableIds,
  apiPostGermplasmPolygonTable,
  apiPostGermplasmPolygonTableIds,
  apiPostGermplasmAttributeTableExport,
  apiExportPassport,
  apiPostGermplasmGroupTable,
  apiPostGermplasmDatasetTable,
  apiPostGermplasmAttributeTable,
  apiPostEntityIds,
  apiPostPedigreeTable,
  apiPostEntityTable,
  apiPostExternalLinkIdentifiers,
  apiGetGermplasmStatsTraits,
  apiGetTaxonomyData,
  apiGetLocationData,
  apiGetBiologicalStatusData,
  apiGetGermplasmTableColumns,
  apiPostGermplasmUnification,
  apiPostGermplasmUnificationSgone,
  apiPatchGermplasmLocation,
  apiPostPedigreedefinitionTable,
  apiPostPedigreeDatasetExport,
  apiGetGermplasmDataWarnings
}
