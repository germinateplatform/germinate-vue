import { authAxios, type ErrorHandler } from '@/plugins/api/base'
import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'
import type { ExportRequest, GermplasmExportRequest, GermplasmUnificationRequest, Locations, PaginatedRequest, PedigreeRequest, SgoneGermplasmUnificationRequest } from '../types/germinate'

function apiGetGermplasmMcpd<T> (germplasmId: number, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  return authAxios({ url: `germplasm/${germplasmId}/mcpd`, success: onSuccess, error: onError })
}

function apiPostGermplasmTable<T> (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'germplasm/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostTaxonomyTable<T> (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'taxonomy/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostGermplasmTableCW<T> (queryData: PaginatedRequest, namesFromFile?: string, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: `germplasm/table?namesFromFile=${namesFromFile}`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostGermplasmTableCWIds<T> (queryData: PaginatedRequest, namesFromFile?: string, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: `germplasm/table/ids?namesFromFile=${namesFromFile}`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostGermplasmTableIds<T> (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'germplasm/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostPublicationGermplasmTable<T> (publicationId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: `publication/${publicationId}/germplasm`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostGroupGermplasmTable<T> (groupId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: `group/${groupId}/germplasm`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostGroupGermplasmTableExport<T> (groupId: number, queryData: ExportRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  return authAxios({ url: `group/${groupId}/germplasm/export`, method: 'POST', dataType: 'blob', data: queryData, success: onSuccess, error: onError })
}

function apiPostGroupGermplasmTableIds<T> (groupId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: `group/${groupId}/germplasm/ids`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostGermplasmDistanceTable<T> (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'germplasm/distance/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostGermplasmDistanceTableIds<T> (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'germplasm/distance/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostGermplasmPolygonTable<T> (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  queryData.page -= 1
  if (queryData.orderBy === 'distance') {
    delete queryData.orderBy
    delete queryData.ascending
  }
  return authAxios({ url: 'germplasm/polygon/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostGermplasmPolygonTableIds<T> (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'germplasm/polygon/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostGermplasmAttributeTableExport<T> (queryData: ExportRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  return authAxios({ url: 'germplasm/attribute/export', method: 'POST', dataType: 'blob', data: queryData, success: onSuccess, error: onError })
}

function apiExportPassport<T> (queryData: GermplasmExportRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  return authAxios({ url: 'germplasm/export', method: 'POST', dataType: 'blob', data: queryData, success: onSuccess, error: onError })
}

function apiPostGermplasmGroupTable<T> (germplasmId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: `germplasm/${germplasmId}/group`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostGermplasmDatasetTable<T> (germplasmId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: `germplasm/${germplasmId}/dataset`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostGermplasmAttributeTable<T> (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'germplasm/attribute', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostEntityIds<T> (ids: number[], direction: string, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  return authAxios({ url: `germplasm/entity?direction=${direction}`, method: 'POST', data: ids, success: onSuccess, error: onError })
}

function apiPostPedigreeTable<T> (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'pedigree/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostEntityTable<T> (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'entity/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostExternalLinkIdentifiers<T> (queryData: number[], onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  return authAxios({ url: 'germplasm/external/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiGetGermplasmStatsTraits<T> (germplasmId: number, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  return authAxios({ url: `germplasm/${germplasmId}/stats/trait`, success: onSuccess, error: onError })
}

function apiGetGermplasmDataWarnings<T> (germplasmId: number, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  return authAxios({ url: `datawarning/germplasm/${germplasmId}`, success: onSuccess, error: onError })
}

function apiGetTaxonomyData<T> (onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  return authAxios({ url: 'germplasm/taxonomy', success: onSuccess, error: onError })
}

function apiGetLocationData<T> (onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  return authAxios({ url: 'germplasm/location', success: onSuccess, error: onError })
}

function apiGetBiologicalStatusData<T> (onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  return authAxios({ url: 'germplasm/biologicalstatus', success: onSuccess, error: onError })
}

function apiGetGermplasmTableColumns<T> (onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  return authAxios({ url: 'germplasm/table/columns', success: onSuccess, error: onError })
}

function apiPostGermplasmUnification<T> (queryData: GermplasmUnificationRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  return authAxios({ url: 'germplasm/unify', data: queryData, method: 'POST', success: onSuccess, error: onError })
}

function apiPostGermplasmUnificationSgone<T> (queryData: SgoneGermplasmUnificationRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  return authAxios({ url: 'germplasm/unify/sgone', data: queryData, method: 'POST', success: onSuccess, error: onError })
}

function apiPatchGermplasmLocation<T> (germplasmId: number, location: Locations, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  return authAxios({ url: `germplasm/${germplasmId}/location`, data: location, method: 'PATCH', success: onSuccess, error: onError })
}

function apiPostPedigreedefinitionTable<T> (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'pedigreedefinition/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostPedigreeDatasetExport<T> (queryData: PedigreeRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  return authAxios({ url: 'dataset/export/pedigree-async', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

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
  apiGetGermplasmDataWarnings,
  apiPostTaxonomyTable,
}
