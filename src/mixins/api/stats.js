export default {
  methods: {
    apiGetOverviewStats: function (onSuccess, onError) {
      return this.authAjax({ url: 'stats/overview', success: onSuccess, error: onError })
    },
    apiGetEntityTypeStats: function (onSuccess, onError) {
      return this.authAjax({ url: 'stats/entitytype', success: onSuccess, error: onError })
    },
    apiGetStatsFile: function (type, onSuccess, onError) {
      return this.authAjax({ url: `stats/${type}`, dataType: 'blob', success: onSuccess, error: onError })
    }
  }
}
