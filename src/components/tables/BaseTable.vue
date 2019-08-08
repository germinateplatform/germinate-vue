<script>
import { mapState } from 'vuex'
import I18nTable from '@/components/tables/I18nTable'
import TableFilter from '@/components/tables/TableFilter'

export default {
  extends: I18nTable,
  name: 'BaseTable',
  data: function () {
    return {
      prevCount: -1,
      filter: null,
      options: {
        requestFunction: data => {
          var vm = this
          data.prevCount = this.prevCount
          return this.requestData(data, function (result) {
            vm.prevCount = result.count
          })
        },
        responseAdapter: function (data) {
          return data
        },
        // perPageValues: [],
        perPage: 10,
        pagination: {
          chunk: 5
        }
      }
    }
  },
  computed: {
    ...mapState([
      'baseUrl',
      'markedIds',
      'hiddenColumns'
    ])
  },
  components: {
    TableFilter
  },
  methods: {
    isHidden: function (itemType, column) {
      return this.$store.getters.hiddenColumns[itemType].indexOf(column) !== -1 ? 'd-none' : ''
    },
    onFilterChanged: function (filter) {
      this.filter = filter
      this.prevCount = -1
    },
    onToggleColumn: function (column) {
      var option = this.options.columnsClasses[column]
      if (option.indexOf('d-none') !== -1) {
        option = option.replace('d-none', '')
      } else {
        option = option + ' d-none'
      }

      option = option.replace(/  +/g, ' ')

      this.options.columnsClasses[column] = option
    },
    markItem: function (type, id, event) {
      if (event) {
        this.$store.dispatch('ON_MARKED_IDS_ADD', { type: type, ids: [id] })
      } else {
        this.$store.dispatch('ON_MARKED_IDS_REMOVE', { type: type, ids: [id] })
      }
    }
  }
}
</script>

<style>

</style>
