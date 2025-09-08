import { MAX_JAVA_INTEGER, authAxios, type ErrorHandler } from '@/plugins/api/base'
import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'
import type { AlleleFrequencyDatasetRequest, ExportRequest, MapExportRequest, PaginatedRequest, SubsettedGenotypeDatasetRequest } from '../types/germinate'

const apiPostMarkerTable = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: 'marker/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostMarkerTableIds = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'marker/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostGroupMarkerTable = <T>(groupId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: `group/${groupId}/marker`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostGroupMarkerTableIds = <T>(groupId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: `group/${groupId}/marker/ids`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostGenotypeDatasetSummary = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page = 0
  queryData.limit = MAX_JAVA_INTEGER
  return authAxios({ url: 'dataset/export/genotype/summary', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostGenotypeDatasetExport = <T>(queryData: SubsettedGenotypeDatasetRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'dataset/export/genotype', method: 'POST', data: queryData, success: onSuccess, error: onError })

const apiPostGroupMarkerTableExport = <T>(groupId: number, queryData: ExportRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `group/${groupId}/marker/export`, method: 'POST', dataType: 'blob', data: queryData, success: onSuccess, error: onError })

const apiPostMarkerGroupTable = <T>(markerId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: `marker/${markerId}/group`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostMapsTable = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: 'map/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostDatasetMapTable = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: 'dataset/map', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostMapdefinitionTable = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: 'map/mapdefinition/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostMapdefinitionTableIds = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'map/mapdefinition/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiGetMap = <T>(mapId: number, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `map/${mapId}`, success: onSuccess, error: onError })

const apiGetMapChromosomes = <T>(mapId: number, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `map/${mapId}/chromosome`, success: onSuccess, error: onError })

const apiPostMapExport = <T>(mapId: number, queryData: MapExportRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `map/${mapId}/export`, method: 'POST', data: queryData, dataType: 'blob', success: onSuccess, error: onError })

const apiPostAlleleFrequencyDatasetExport = <T>(queryData: AlleleFrequencyDatasetRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'dataset/export/allelefreq', method: 'POST', data: queryData, success: onSuccess, error: onError })

const apiPostMarkerDatasetTable = <T>(markerId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
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
  apiPostMarkerDatasetTable,
}
