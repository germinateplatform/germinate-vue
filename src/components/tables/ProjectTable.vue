<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               :filterOn="filterOn"
               primary-key="projectId"
               ref="table"
               v-bind="$props"
               v-on="$listeners">
      <!-- Project id link -->
      <template v-slot:cell(projectId)="data">
        <router-link :to="{ name: Pages.projectDetails, params: { projectId: data.item.projectId } }" event="" @click.native.prevent="$emit('project-selected', data.item.projectId)">{{ data.item.projectId }}</router-link>
      </template>
      <!-- Project name link -->
      <template v-slot:cell(projectName)="data">
        <router-link :to="{ name: Pages.projectDetails, params: { projectId: data.item.projectId } }" event="" @click.native.prevent="$emit('project-selected', data.item.projectId)">{{ data.item.projectName }}</router-link>
      </template>
      <!-- Project description link -->
      <template v-slot:cell(projectDescription)="data">
        <router-link :to="{ name: Pages.projectDetails, params: { projectId: data.item.projectId } }" event="" @click.native.prevent="$emit('project-selected', data.item.projectId)">{{ data.item.projectDescription }}</router-link>
      </template>
      <!-- Project datasets -->
      <template v-slot:cell(datasets)="data">
        <span v-if="data.item.datasets">{{ data.item.datasets.length.toLocaleString() }}</span>
      </template>
    </BaseTable>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'
import { Pages } from '@/mixins/pages'

export default {
  name: 'ProjectTable',
  props: {
    ...defaultProps.BASE,
    ...defaultProps.IDS,
    selectable: {
      type: Boolean,
      default: false
    },
    selectionMode: {
      type: String,
      default: 'multi'
    }
  },
  data: function () {
    return {
      Pages,
      options: {
        idColumn: 'projectId',
        tableName: 'projects'
      }
    }
  },
  computed: {
    ...mapGetters([
      'storeToken',
      'storeSelectedProjects'
    ]),
    columns: function () {
      const columns = [
        {
          key: 'projectId',
          type: Number,
          sortable: true,
          class: 'text-right',
          label: this.$t('tableColumnProjectId')
        }, {
          key: 'projectName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnProjectName'),
          preferredSortingColumn: true
        }, {
          key: 'projectDescription',
          type: String,
          sortable: true,
          label: this.$t('tableColumnProjectDescription')
        }, {
          key: 'datasets',
          type: 'json',
          sortable: false,
          class: 'text-right',
          label: this.$t('tableColumnProjectDatasets')
        }, {
          key: 'projectStartDate',
          type: Date,
          sortable: true,
          label: this.$t('tableColumnProjectStartDate'),
          formatter: value => value ? new Date(value).toLocaleDateString() : null
        }, {
          key: 'projectEndDate',
          type: Date,
          sortable: true,
          label: this.$t('tableColumnProjectEndDate'),
          formatter: value => value ? new Date(value).toLocaleDateString() : null
        }
      ]

      if (this.selectable === true) {
        columns.unshift({
          key: 'selected',
          type: undefined,
          sortable: false,
          class: 'table-primary',
          label: ''
        })
      }

      return columns
    }
  },
  components: {
    BaseTable
  },
  methods: {
    setSelectedItems: function (toSelect) {
      this.$refs.table.setSelectedItems(toSelect)
    },
    refresh: function () {
      this.$refs.table.refresh()
    }
  }
}
</script>
