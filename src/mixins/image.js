import { mapGetters } from 'vuex'

import formattingMixin from '@/mixins/formatting'

export default {
  computed: {
    ...mapGetters([
      'storeBaseUrl'
    ])
  },
  mixins: [formattingMixin],
  methods: {
    getImageUrl: function (name, params) {
      const paramString = this.toUrlString(params)

      let index = name.lastIndexOf('\\')
      if (index !== -1) {
        name = name.substring(index + 1)
      }
      index = name.lastIndexOf('/')
      if (index !== -1) {
        name = name.substring(index + 1)
      }

      return `${this.storeBaseUrl}image/src/${encodeURI(name)}?${paramString}`
    }
  }
}
