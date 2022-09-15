import { authAxios } from '@/mixins/api/base'

const apiGetOverviewStats = (onSuccess, onError) => authAxios({ url: 'stats/overview', success: onSuccess, error: onError })

const apiGetEntityTypeStats = (onSuccess, onError) => authAxios({ url: 'stats/entitytype', success: onSuccess, error: onError })

const apiGetStatsFile = (type, onSuccess, onError) => authAxios({ url: `stats/${type}`, dataType: 'blob', success: onSuccess, error: onError })

export {
  apiGetOverviewStats,
  apiGetEntityTypeStats,
  apiGetStatsFile
}
