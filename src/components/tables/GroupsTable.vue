<template>
  <div>
    <BaseTable :options="options" :columns="columns">
      <span slot="createdon" slot-scope="props" v-if="props.row.createdon">{{ props.row.createdon | toDate }}</span>
      <span slot="updatedon" slot-scope="props" v-if="props.row.updatedon">{{ props.row.updatedon | toDate }}</span>
      <span slot="grouptype" slot-scope="props">{{ getGroupType(props.row.grouptype) }}</span>

      <!-- Only show if authentication enabled -->
      <b-button-group slot="actions" slot-scope="props">
        <b-button variant="info" size="sm" v-b-tooltip.hover  :title="$t('buttonEdit')"><i class="mdi mdi-18px mdi-rename-box" /></b-button>
        <b-button variant="danger" size="sm" v-b-tooltip.hover :title="$t('buttonDelete')" @click="deleteGroup(props.row)"><i class="mdi mdi-18px mdi-delete" /></b-button>
      </b-button-group>
    </BaseTable>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import BaseTable from '@/components/tables/BaseTable'

export default {
  name: 'DatasetsTable',
  props: {
    filterOn: {
      type: Array,
      default: null
    }
  },
  computed: {
    ...mapState([
      'token',
      'locale'
    ])
  },
  data: function () {
    const columns = ['groupid', 'groupname', 'groupdescription', 'grouptype', 'userid', 'createdon', 'updatedon', 'count', 'actions']
    return {
      options: {
        requestData: (data, callback) => {
          return this.apiPostGroupTable(data, callback)
        },
        idColumn: 'groupid',
        tableName: 'groups',
        filterOn: this.filterOn,
        sortable: ['groupid', 'groupname', 'groupdescription', 'grouptype', 'userid', 'createdon', 'updatedon', 'count'],
        filterable: [],
        headings: {
          groupid: () => this.$t('tableColumnGroupId'),
          groupmname: () => this.$t('tableColumnGroupName'),
          groupdescription: () => this.$t('tableColumnGroupDescription'),
          grouptype: () => this.$t('tableColumnGroupType'),
          userid: () => this.$t('tableColumnGroupUserId'),
          createdon: () => this.$t('tableColumnGroupCreatedOn'),
          updatedon: () => this.$t('tableColumnGroupUpdatedOn'),
          count: () => this.$t('tableColumnGroupCount'),
          actions: () => this.$t('tableColumnActions')
        },
        // orderBy: {
        //   column: 'datasetid'
        // },
        columnsClasses: {
          groupid: 'text-right',
          count: 'text-right',
          actions: 'text-right'
        }
      },
      columns: columns
    }
  },
  components: {
    BaseTable
  },
  methods: {
    getGroupType: function (groupType) {
      switch (groupType) {
        case 'locations':
          return this.$t('groupTypeLocation')
        case 'germinatebase':
          return this.$t('groupTypeGerminatebase')
        case 'markers':
          return this.$t('groupTypeMarker')
        default:
          return ''
      }
    }
  }
}
</script>
