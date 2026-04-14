import { authAxios, type ErrorHandler } from '@/plugins/api/base'
import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'
import type { BiologicalStatusCount, GermplasmMetaStats, Taxonomies } from '@/plugins/types/germinate'

const apiGetOverviewStats = <T>(onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios<T>({ url: 'stats/overview', success: onSuccess, error: onError })

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
