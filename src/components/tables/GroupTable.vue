<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               :filterOn="filterOn"
               ref="table"
               v-bind="$props"
               v-on="$listeners">
      <!-- Group id link -->
      <template v-slot:cell(groupId)="data">
        <router-link v-if="isEditable === true" :to="`/groups/${data.item.groupId}`" event="" @click.native.prevent="$emit('group-selected', data.item.groupId)">{{ data.item.groupId }}</router-link>
        <router-link v-else :to="`/groups/${data.item.groupId}`">{{ data.item.groupId }}</router-link>
      </template>
      <!-- Group name link -->
      <template v-slot:cell(groupName)="data">
        <router-link v-if="isEditable === true" :to="`/groups/${data.item.groupId}`" event="" @click.native.prevent="$emit('group-selected', data.item.groupId)">{{ data.item.groupName }}</router-link>
        <router-link v-else :to="`/groups/${data.item.groupId}`">{{ data.item.groupName }}</router-link>
      </template>
      <!-- Group description link -->
      <template v-slot:cell(groupDescription)="data">
        <router-link v-if="isEditable === true" :to="`/groups/${data.item.groupId}`" event="" @click.native.prevent="$emit('group-selected', data.item.groupId)">{{ data.item.groupDescription }}</router-link>
        <router-link v-else :to="`/groups/${data.item.groupId}`">{{ data.item.groupDescription }}</router-link>
      </template>
      <!-- Group type icon -->
      <template v-slot:cell(groupType)="data">
        <span><i :class="`mdi mdi-18px ${groupTypes[data.item.groupType].icon} fix-alignment`" :style="`color: ${groupTypes[data.item.groupType].color()};`" /> {{ groupTypes[data.item.groupType].text() }}</span>
      </template>

      <!-- Only show if authentication enabled -->
      <template v-slot:cell(actions)="data">
        <b-button-group v-if="isEditable && token && (token.id === data.item.userId)">
          <b-button variant="outline-info" size="sm" v-b-tooltip.hover :title="$t('buttonEdit')" @click="$emit('on-group-edit-clicked', data.item)"><i class="mdi mdi-18px mdi-rename-box" /></b-button>
          <b-button variant="outline-danger" size="sm" v-b-tooltip.hover :title="$t('buttonDelete')" @click="$emit('on-group-delete-clicked', data.item)"><i class="mdi mdi-18px mdi-delete" /></b-button>
        </b-button-group>
      </template>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'
import typesMixin from '@/mixins/types.js'

export default {
  name: 'GroupTable',
  props: {
    ...defaultProps.BASE,
    ...defaultProps.ACTIONS,
    isEditable: {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    return {
      options: {
        idColumn: 'groupId',
        tableName: 'groups'
      }
    }
  },
  computed: {
    columns: function () {
      let columns = [
        {
          key: 'groupId',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'groupId')}`,
          label: this.$t('tableColumnGroupId')
        }, {
          key: 'groupName',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'groupName')}`,
          label: this.$t('tableColumnGroupName'),
          preferedSortingColumn: true
        }, {
          key: 'groupDescription',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'groupDescription')}`,
          label: this.$t('tableColumnGroupDescription')
        }, {
          key: 'groupType',
          type: 'groupType',
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'groupType')}`,
          label: this.$t('tableColumnGroupType')
        }, {
          key: 'userId',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'userId')}`,
          label: this.$t('tableColumnGroupUserId')
        }, {
          key: 'userName',
          type: undefined,
          sortable: false,
          class: `${this.isTableColumnHidden(this.options.tableName, 'userName')}`,
          label: this.$t('tableColumnGroupUserName')
        }, {
          key: 'createdOn',
          type: Date,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'createdOn')}`,
          label: this.$t('tableColumnGroupCreatedOn'),
          formatter: this.$options.filters.toDate
        }, {
          key: 'updatedOn',
          type: Date,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'updatedOn')}`,
          label: this.$t('tableColumnGroupUpdatedOn'),
          formatter: this.$options.filters.toDate
        }, {
          key: 'count',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'count')}`,
          label: this.$t('tableColumnGroupCount'),
          formatter: this.$options.filters.toThousandSeparators
        }
      ]

      if (this.isEditable === true) {
        columns.push({
          key: 'actions',
          type: undefined,
          sortable: false,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'actions')}`,
          label: ''
        })
      }

      return columns
    }
  },
  components: {
    BaseTable
  },
  mixins: [ typesMixin ],
  methods: {
    refresh: function () {
      this.$refs.table.refresh()
    }
  }
}
</script>
