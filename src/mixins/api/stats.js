import baseApiMixin from '@/mixins/api/base'

export default {
  mixins: [baseApiMixin],
  methods: {
    apiGetOverviewStats: function (onSuccess, onError) {
      return this.authAxios({ url: 'stats/overview', success: onSuccess, error: onError })
    },
    apiGetEntityTypeStats: function (onSuccess, onError) {
      return this.authAxios({ url: 'stats/entitytype', success: onSuccess, error: onError })
    },
    apiGetStatsFile: function (type, onSuccess, onError) {
      return this.authAxios({ url: `stats/${type}`, dataType: 'blob', success: onSuccess, error: onError })
    }
  }
}
