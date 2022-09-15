import { MAX_JAVA_INTEGER, authAxios } from '@/mixins/api/base'

const apiPostMarkerTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: 'marker/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostMarkerTableIds = (queryData, onSuccess, onError) => {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'marker/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostGroupMarkerTable = (groupId, queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: `group/${groupId}/marker`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostGroupMarkerTableIds = (groupId, queryData, onSuccess, onError) => {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: `group/${groupId}/marker/ids`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostGenotypeDatasetSummary = (queryData, onSuccess, onError) => {
  queryData.page = 0
  queryData.limit = MAX_JAVA_INTEGER
  return authAxios({ url: 'dataset/export/genotype/summary', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostGenotypeDatasetExport = (queryData, onSuccess, onError) => authAxios({ url: 'dataset/export/genotype', method: 'POST', data: queryData, success: onSuccess, error: onError })

const apiPostGroupMarkerTableExport = (groupId, queryData, onSuccess, onError) => authAxios({ url: `group/${groupId}/marker/export`, method: 'POST', dataType: 'blob', data: queryData, success: onSuccess, error: onError })

const apiPostMarkerGroupTable = (markerId, queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: `marker/${markerId}/group`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostMapsTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: 'map/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostDatasetMapTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: 'dataset/map', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostMapdefinitionTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: 'map/mapdefinition/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostMapdefinitionTableIds = (queryData, onSuccess, onError) => {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'map/mapdefinition/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiGetMap = (mapId, onSuccess, onError) => authAxios({ url: `map/${mapId}`, success: onSuccess, error: onError })

const apiGetMapChromosomes = (mapId, onSuccess, onError) => authAxios({ url: `map/${mapId}/chromosome`, success: onSuccess, error: onError })

const apiPostMapExport = (mapId, queryData, onSuccess, onError) => authAxios({ url: `map/${mapId}/export`, method: 'POST', data: queryData, dataType: 'blob', success: onSuccess, error: onError })

const apiPostAlleleFrequencyDatasetExport = (queryData, onSuccess, onError) => authAxios({ url: 'dataset/export/allelefreq', method: 'POST', data: queryData, success: onSuccess, error: onError })

const apiPostMarkerDatasetTable = (markerId, queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: `marker/${markerId}/dataset`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export {
  apiPostMarkerTable,
  apiPostMarkerTableIds,
  apiPostGroupMarkerTable,
  apiPostGroupMarkerTableIds,
  apiPostGenotypeDatasetSummary,
  apiPostGenotypeDatasetExport,
  apiPostGroupMarkerTableExport,
  apiPostMarkerGroupTable,
  apiPostMapsTable,
  apiPostDatasetMapTable,
  apiPostMapdefinitionTable,
  apiPostMapdefinitionTableIds,
  apiGetMap,
  apiGetMapChromosomes,
  apiPostMapExport,
  apiPostAlleleFrequencyDatasetExport,
  apiPostMarkerDatasetTable
}
