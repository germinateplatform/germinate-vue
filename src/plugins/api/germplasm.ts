import { authAxios, type ErrorHandler } from '@/plugins/api/base'
import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'
import type { ExportRequest, GermplasmExportRequest, GermplasmUnificationRequest, Locations, PaginatedRequest, PedigreeRequest, SgoneGermplasmUnificationRequest } from '../types/germinate'

const apiGetGermplasmMcpd = <T>(germplasmId: number, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `germplasm/${germplasmId}/mcpd`, success: onSuccess, error: onError })

const apiPostGermplasmTable = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: 'germplasm/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostTaxonomyTable = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: 'taxonomy/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostGermplasmTableCW = <T>(queryData: PaginatedRequest, namesFromFile?: string, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: `germplasm/table?namesFromFile=${namesFromFile}`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostGermplasmTableCWIds = <T>(queryData: PaginatedRequest, namesFromFile?: string, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: `germplasm/table/ids?namesFromFile=${namesFromFile}`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostGermplasmTableIds = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'germplasm/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostPublicationGermplasmTable = <T>(publicationId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: `publication/${publicationId}/germplasm`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostGroupGermplasmTable = <T>(groupId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: `group/${groupId}/germplasm`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostGroupGermplasmTableExport = <T>(groupId: number, queryData: ExportRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `group/${groupId}/germplasm/export`, method: 'POST', dataType: 'blob', data: queryData, success: onSuccess, error: onError })

const apiPostGroupGermplasmTableIds = <T>(groupId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: `group/${groupId}/germplasm/ids`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostGermplasmDistanceTable = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: 'germplasm/distance/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostGermplasmDistanceTableIds = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'germplasm/distance/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostGermplasmPolygonTable = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  if (queryData.orderBy === 'distance') {
    delete queryData.orderBy
    delete queryData.ascending
  }
  return authAxios({ url: 'germplasm/polygon/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostGermplasmPolygonTableIds = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'germplasm/polygon/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostGermplasmAttributeTableExport = <T>(queryData: ExportRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'germplasm/attribute/export', method: 'POST', dataType: 'blob', data: queryData, success: onSuccess, error: onError })

const apiExportPassport = <T>(queryData: GermplasmExportRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'germplasm/export', method: 'POST', dataType: 'blob', data: queryData, success: onSuccess, error: onError })

const apiPostGermplasmGroupTable = <T>(germplasmId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: `germplasm/${germplasmId}/group`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostGermplasmDatasetTable = <T>(germplasmId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: `germplasm/${germplasmId}/dataset`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostGermplasmAttributeTable = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: 'germplasm/attribute', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostEntityIds = <T>(ids: number[], direction: string, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `germplasm/entity?direction=${direction}`, method: 'POST', data: ids, success: onSuccess, error: onError })

const apiPostPedigreeTable = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: 'pedigree/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostEntityTable = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: 'entity/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostExternalLinkIdentifiers = <T>(queryData: number[], onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'germplasm/external/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })

const apiGetGermplasmStatsTraits = <T>(germplasmId: number, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `germplasm/${germplasmId}/stats/trait`, success: onSuccess, error: onError })

const apiGetGermplasmDataWarnings = <T>(germplasmId: number, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `datawarning/germplasm/${germplasmId}`, success: onSuccess, error: onError })

const apiGetTaxonomyData = <T>(onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'germplasm/taxonomy', success: onSuccess, error: onError })

const apiGetLocationData = <T>(onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'germplasm/location', success: onSuccess, error: onError })

const apiGetBiologicalStatusData = <T>(onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'germplasm/biologicalstatus', success: onSuccess, error: onError })

const apiGetGermplasmTableColumns = <T>(onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'germplasm/table/columns', success: onSuccess, error: onError })

const apiPostGermplasmUnification = <T>(queryData: GermplasmUnificationRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'germplasm/unify', data: queryData, method: 'POST', success: onSuccess, error: onError })

const apiPostGermplasmUnificationSgone = <T>(queryData: SgoneGermplasmUnificationRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'germplasm/unify/sgone', data: queryData, method: 'POST', success: onSuccess, error: onError })

const apiPatchGermplasmLocation = <T>(germplasmId: number, location: Locations, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `germplasm/${germplasmId}/location`, data: location, method: 'PATCH', success: onSuccess, error: onError })

const apiPostPedigreedefinitionTable = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: 'pedigreedefinition/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostPedigreeDatasetExport = <T>(queryData: PedigreeRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'dataset/export/pedigree-async', method: 'POST', data: queryData, success: onSuccess, error: onError })

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
