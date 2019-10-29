<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               :filterOn="filterOn"
               ref="table"
               v-bind="$props"
               v-on="$listeners">
      <router-link slot="groupId" slot-scope="props" :to="`/groups/${props.row.groupId}`" event="" @click.native.prevent="$emit('group-selected', props.row.groupId)">{{ props.row.groupId }}</router-link>
      <router-link slot="groupName" slot-scope="props" :to="`/groups/${props.row.groupId}`" event="" @click.native.prevent="$emit('group-selected', props.row.groupId)">{{ props.row.groupName }}</router-link>
      <router-link slot="groupDescription" slot-scope="props" :to="`/groups/${props.row.groupId}`" event="" @click.native.prevent="$emit('group-selected', props.row.groupId)">{{ props.row.groupDescription }}</router-link>

      <span slot="createdOn" slot-scope="props" v-if="props.row.createdOn">{{ props.row.createdOn | toDate }}</span>
      <span slot="updatedOn" slot-scope="props" v-if="props.row.updatedOn">{{ props.row.updatedOn | toDate }}</span>
      <span slot="groupType" slot-scope="props"><i :class="`mdi mdi-18px ${groupTypes[props.row.groupType].icon} fix-alignment`" :style="`color: ${groupTypes[props.row.groupType].color()};`" /> {{ groupTypes[props.row.groupType].text() }}</span>

      <!-- Only show if authentication enabled -->
      <b-button-group slot="actions" slot-scope="props" v-if="token && token.id === props.row.userId">
        <b-button variant="outline-info" size="sm" v-b-tooltip.hover :title="$t('buttonEdit')" @click="$emit('on-group-edit-clicked', props.row)"><i class="mdi mdi-18px mdi-rename-box" /></b-button>
        <b-button variant="outline-danger" size="sm" v-b-tooltip.hover :title="$t('buttonDelete')" @click="$emit('on-group-delete-clicked', props.row)"><i class="mdi mdi-18px mdi-delete" /></b-button>
      </b-button-group>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'

export default {
  name: 'GroupTable',
  props: {
    ...defaultProps.BASE
  },
  data: function () {
    const columns = [
      {
        name: 'groupId',
        type: Number
      }, {
        name: 'groupName',
        type: String
      }, {
        name: 'groupDescription',
        type: String
      }, {
        name: 'groupType',
        type: 'groupType'
      }, {
        name: 'userId',
        type: String
      }, {
        name: 'createdOn',
        type: Date
      }, {
        name: 'updatedOn',
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
        idColumn: 'groupId',
        tableName: 'groups',
        sortable: ['groupId', 'groupName', 'groupDescription', 'groupType', 'userId', 'createdOn', 'updatedOn', 'count'],
        filterable: [],
        headings: {
          groupId: () => this.$t('tableColumnGroupId'),
          groupName: () => this.$t('tableColumnGroupName'),
          groupDescription: () => this.$t('tableColumnGroupDescription'),
          groupType: () => this.$t('tableColumnGroupType'),
          userId: () => this.$t('tableColumnGroupUserId'),
          createdOn: () => this.$t('tableColumnGroupCreatedOn'),
          updatedOn: () => this.$t('tableColumnGroupUpdatedOn'),
          count: () => this.$t('tableColumnGroupCount'),
          actions: ''
        },
        columnsClasses: {
          groupId: 'text-right',
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
    refresh: function () {
      this.$refs.table.refresh()
    }
  }
}
</script>
