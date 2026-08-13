import { authAxios, type ErrorHandler } from '@/plugins/api/base'
import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'
import type { AsyncExportResult, Datawarnings, DbObjectCount, ExportRequest, GermplasmDistance, GermplasmExportRequest, GermplasmStats, Locations, PaginatedLocationRequest, PaginatedPolygonRequest, PaginatedRequest, PaginatedResult, PedigreeRequest, SgoneGermplasmUnificationRequest, SgoneUnificationRequest, TaxonCount, UnificationRequest, ViewMcpd, ViewTableDatasets, ViewTableEntities, ViewTableGermplasm, ViewTableGermplasmAttributes, ViewTableGroupGermplasm, ViewTableGroups, ViewTablePedigreedefinitions, ViewTablePedigrees, ViewTableTaxonomies } from '@/plugins/types/germinate'

export function apiGetGermplasmMcpd (germplasmId: number, onSuccess?: GerminateResponseHandler<ViewMcpd>, onError?: ErrorHandler) {
  return authAxios({ url: `germplasm/${germplasmId}/mcpd`, success: onSuccess, error: onError })
}

export function apiPostGermplasmTable (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableGermplasm[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'germplasm/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostTaxonomyTable (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableTaxonomies[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'taxonomy/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostGermplasmTableIds (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<number[]>>, onError?: ErrorHandler) {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'germplasm/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostPublicationGermplasmTable (publicationId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableGermplasm[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: `publication/${publicationId}/germplasm`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostPublicationGermplasmTableIds (publicationId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<number[]>>, onError?: ErrorHandler) {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: `publication/${publicationId}/germplasm/ids`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostGroupGermplasmTable (groupId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableGroupGermplasm[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: `group/${groupId}/germplasm`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostGroupGermplasmTableExport (groupId: number, queryData: ExportRequest, onSuccess?: GerminateResponseHandler<Blob>, onError?: ErrorHandler) {
  return authAxios({ url: `group/${groupId}/germplasm/export`, method: 'POST', dataType: 'blob', data: queryData, success: onSuccess, error: onError })
}

export function apiPostGroupGermplasmTableIds (groupId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<number[]>>, onError?: ErrorHandler) {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: `group/${groupId}/germplasm/ids`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostGermplasmDistanceTable (queryData: PaginatedLocationRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<GermplasmDistance[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'germplasm/distance/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostGermplasmDistanceTableIds (queryData: PaginatedLocationRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<number[]>>, onError?: ErrorHandler) {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'germplasm/distance/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostGermplasmPolygonTable (queryData: PaginatedPolygonRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableGermplasm[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  if (queryData.orderBy === 'distance') {
    delete queryData.orderBy
    delete queryData.ascending
  }
  return authAxios({ url: 'germplasm/polygon/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostGermplasmPolygonTableIds (queryData: PaginatedPolygonRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<number[]>>, onError?: ErrorHandler) {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'germplasm/polygon/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostGermplasmAttributeTableExport (queryData: ExportRequest, onSuccess?: GerminateResponseHandler<Blob>, onError?: ErrorHandler) {
  return authAxios({ url: 'germplasm/attribute/export', method: 'POST', dataType: 'blob', data: queryData, success: onSuccess, error: onError })
}

export function apiExportPassport (queryData: GermplasmExportRequest, onSuccess?: GerminateResponseHandler<Blob>, onError?: ErrorHandler) {
  return authAxios({ url: 'germplasm/export', method: 'POST', dataType: 'blob', data: queryData, success: onSuccess, error: onError })
}

export function apiPostGermplasmGroupTable (germplasmId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableGroups[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: `germplasm/${germplasmId}/group`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostGermplasmDatasetTable (germplasmId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableDatasets[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: `germplasm/${germplasmId}/dataset`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostGermplasmAttributeTable (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableGermplasmAttributes[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'germplasm/attribute', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostEntityIds (ids: number[], direction: string, onSuccess?: GerminateResponseHandler<number[]>, onError?: ErrorHandler) {
  return authAxios({ url: `germplasm/entity?direction=${direction}`, method: 'POST', data: ids, success: onSuccess, error: onError })
}

export function apiPostPedigreeTable (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTablePedigrees[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'pedigree/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostEntityTable<T> (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableEntities[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'entity/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostExternalLinkIdentifiers (queryData: number[], onSuccess?: GerminateResponseHandler<string[]>, onError?: ErrorHandler) {
  return authAxios({ url: 'germplasm/external/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiGetGermplasmStatsTraits (germplasmId: number, subsetReqest?: GermplasmExportRequest, onSuccess?: GerminateResponseHandler<GermplasmStats[]>, onError?: ErrorHandler) {
  return authAxios({ url: `germplasm/${germplasmId}/stats/trait`, data: subsetReqest, method: 'POST', success: onSuccess, error: onError })
}

export function apiGetGermplasmDataWarnings (germplasmId: number, onSuccess?: GerminateResponseHandler<Datawarnings[]>, onError?: ErrorHandler) {
  return authAxios({ url: `datawarning/germplasm/${germplasmId}`, success: onSuccess, error: onError })
}

export function apiGetTaxonomyData (onSuccess?: GerminateResponseHandler<TaxonCount>, onError?: ErrorHandler) {
  return authAxios({ url: 'germplasm/taxonomy', success: onSuccess, error: onError })
}

export function apiGetLocationData (onSuccess?: GerminateResponseHandler<DbObjectCount[]>, onError?: ErrorHandler) {
  return authAxios({ url: 'germplasm/location', success: onSuccess, error: onError })
}

export function apiGetBiologicalStatusData (onSuccess?: GerminateResponseHandler<DbObjectCount[]>, onError?: ErrorHandler) {
  return authAxios({ url: 'germplasm/biologicalstatus', success: onSuccess, error: onError })
}

export function apiGetGermplasmTableColumns (onSuccess?: GerminateResponseHandler<string[]>, onError?: ErrorHandler) {
  return authAxios({ url: 'germplasm/table/columns', success: onSuccess, error: onError })
}

export function apiPostGermplasmUnification (queryData: UnificationRequest, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: 'germplasm/unify', data: queryData, method: 'POST', success: onSuccess, error: onError })
}

export function apiPostGermplasmUnificationSgone (queryData: SgoneUnificationRequest, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: 'germplasm/unify/sgone', data: queryData, method: 'POST', success: onSuccess, error: onError })
}

export function apiPatchGermplasmLocation (germplasmId: number, location: Locations, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: `germplasm/${germplasmId}/location`, data: location, method: 'PATCH', success: onSuccess, error: onError })
}

export function apiPostPedigreedefinitionTable (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTablePedigreedefinitions[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'pedigreedefinition/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostPedigreeDatasetExport (queryData: PedigreeRequest, onSuccess?: GerminateResponseHandler<AsyncExportResult[]>, onError?: ErrorHandler) {
  return authAxios({ url: 'dataset/export/pedigree-async', method: 'POST', data: queryData, success: onSuccess, error: onError })
}
