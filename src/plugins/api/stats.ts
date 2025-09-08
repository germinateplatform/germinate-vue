import { authAxios, type ErrorHandler } from '@/plugins/api/base'
import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'

const apiGetOverviewStats = <T>(onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios<T>({ url: 'stats/overview', success: onSuccess, error: onError })

const apiGetEntityTypeStats = <T>(onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios<T>({ url: 'stats/entitytype', success: onSuccess, error: onError })

const apiGetStatsFile = <T>(type: string, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios<T>({ url: `stats/${type}`, dataType: 'blob', success: onSuccess, error: onError })

export {
  apiGetOverviewStats,
  apiGetEntityTypeStats,
  apiGetStatsFile,
}
