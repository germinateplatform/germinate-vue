import { authAxios, type ErrorHandler } from '@/plugins/api/base'
import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'
import type { BiologicalStatusCount, GermplasmMetaStats, OverviewStats, Taxonomies } from '@/plugins/types/germinate'

function apiGetOverviewStats (projectIds?: number[], onSuccess?: GerminateResponseHandler<OverviewStats>, onError?: ErrorHandler) {
  authAxios<OverviewStats>({ url: `stats/overview${(projectIds && projectIds.length > 0) ? `?projectIds=${projectIds.join(',')}` : ''}`, success: onSuccess, error: onError })
}

const apiGetEntityTypeStats = <T>(onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios<T>({ url: 'stats/entitytype', success: onSuccess, error: onError })

const apiGetStatsFile = (type: string, onSuccess?: GerminateResponseHandler<Blob>, onError?: ErrorHandler) => authAxios<Blob>({ url: `stats/${type}`, dataType: 'blob', success: onSuccess, error: onError })

const apiGetMetaStats = (onSuccess?: GerminateResponseHandler<GermplasmMetaStats[]>, onError?: ErrorHandler) => authAxios<GermplasmMetaStats[]>({ url: 'stats/meta', success: onSuccess, error: onError })

const apiGetTaxonomies = (onlyGenusSpecies: boolean, onSuccess?: GerminateResponseHandler<Taxonomies[]>, onError?: ErrorHandler) => authAxios<Taxonomies[]>({ url: `taxonomy${onlyGenusSpecies ? '?onlyGenusSpecies=true' : ''}`, success: onSuccess, error: onError })

const apiGetBiologicalStatusCount = (fullName: boolean, onSuccess?: GerminateResponseHandler<BiologicalStatusCount[]>, onError?: ErrorHandler) => authAxios<BiologicalStatusCount[]>({ url: `biologicalstatus${fullName ? '?fullName=true' : ''}`, success: onSuccess, error: onError })

export {
  apiGetOverviewStats,
  apiGetEntityTypeStats,
  apiGetStatsFile,
  apiGetMetaStats,
  apiGetBiologicalStatusCount,
  apiGetTaxonomies,
}
