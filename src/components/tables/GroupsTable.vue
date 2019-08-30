<template>
  <div>
    <BaseTable :options="options" :columns="columns">
      <router-link slot="groupid" slot-scope="props" :to="`/groups/${props.row.groupid}`" event="" @click.native.prevent="$emit('group-selected', props.row.groupid)">{{ props.row.groupid }}</router-link>
      <router-link slot="groupname" slot-scope="props" :to="`/groups/${props.row.groupid}`" event="" @click.native.prevent="$emit('group-selected', props.row.groupid)">{{ props.row.groupname }}</router-link>
      <router-link slot="groupdescription" slot-scope="props" :to="`/groups/${props.row.groupid}`" event="" @click.native.prevent="$emit('group-selected', props.row.groupid)">{{ props.row.groupdescription }}</router-link>

      <span slot="createdon" slot-scope="props" v-if="props.row.createdon">{{ props.row.createdon | toDate }}</span>
      <span slot="updatedon" slot-scope="props" v-if="props.row.updatedon">{{ props.row.updatedon | toDate }}</span>
      <span slot="grouptype" slot-scope="props"><i :class="`mdi mdi-18px ${groupType[props.row.grouptype].icon} fix-alignment`" :style="`color: ${groupType[props.row.grouptype].color};`" /> {{ groupType[props.row.grouptype].text() }}</span>

      <!-- Only show if authentication enabled -->
      <b-button-group slot="actions" slot-scope="props">
        <b-button variant="outline-info" size="sm" v-b-tooltip.hover  :title="$t('buttonEdit')"><i class="mdi mdi-18px mdi-rename-box" /></b-button>
        <b-button variant="outline-danger" size="sm" v-b-tooltip.hover :title="$t('buttonDelete')" @click="deleteGroup(props.row)"><i class="mdi mdi-18px mdi-delete" /></b-button>
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
      'locale',
      'settings'
    ])
  },
  data: function () {
    const columns = [
      {
        name: 'groupid',
        type: Number
      }, {
        name: 'groupname',
        type: String
      }, {
        name: 'groupdescription',
        type: String
      }, {
        name: 'grouptype',
        type: String
      }, {
        name: 'userid',
        type: String
      }, {
        name: 'createdon',
        type: Date
      }, {
        name: 'updatedon',
        type: Date
      }, {
        name: 'count',
        type: Number
      }, {
        name: 'actions',
        type: undefined
      }
    ]
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
          actions: ''
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
      columns: columns,
      groupType: {
        germinatebase: {
          icon: 'mdi-sprout',
          text: () => this.$t('groupTypeGerminatebase')
        },
        markers: {
          icon: 'mdi-dna',
          text: () => this.$t('groupTypeMarker')
        },
        locations: {
          icon: 'mdi-map-marker',
          text: () => this.$t('groupTypeLocation')
        }
      }
    }
  },
  components: {
    BaseTable
  },
  created: function () {
    this.groupType.germinatebase.color = this.settings.colorsTemplate[0]
    this.groupType.locations.color = this.settings.colorsTemplate[1]
    this.groupType.markers.color = this.settings.colorsTemplate[2]
  }
}
</script>
