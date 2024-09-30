<template>
  <div>
    <CoolLightBox
      :items="coolboxImages"
      :index="coolboxIndex"
      effect="fade"
      @close="coolboxIndex = null" />
    <BaseTable :options="options"
               :columns="columns"
               :filterOn="filterOn"
               :tableActions="userIsDataCurator ? localTableActions : null"
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
      <!-- Project image/logo -->
      <template v-slot:cell(projectImageId)="data">
        <a :href="getSrc(data.item, 'large')" @click.prevent="update(data.item)" v-if="data.item.projectImageId">
          <b-img-lazy :src="getSrc(data.item, 'small')" class="table-image" alt="Image" />
        </a>
      </template>

      <!-- Edit project -->
      <template v-slot:cell(edit)="data">
        <a href="#" class="text-decoration-none" @click.prevent="onProjectEditClicked(data.item)" v-if="userIsDataCurator">
          <span v-b-tooltip.hover :title="$t('tableTooltipProjectEdit')"><MdiIcon :path="mdiSquareEditOutline"/></span>
        </a>
      </template>
      <!-- Delete project -->
      <template v-slot:cell(delete)="data">
        <a href="#" class="text-decoration-none" @click.prevent="onProjectDeleteClicked(data.item)" v-if="userIsDataCurator">
          <span v-b-tooltip.hover :title="$t('tableTooltipProjectDelete')"><MdiIcon className="text-danger" :path="mdiDelete"/></span>
        </a>
      </template>
    </BaseTable>

    <!-- Project edit modal -->
    <AddProjectModal :projectToEdit="project" v-if="userIsDataCurator" @projects-changed="projectAddedEdited" ref="projectEditModal" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import MdiIcon from '@/components/icons/MdiIcon'
import CoolLightBox from 'vue-cool-lightbox'
import 'vue-cool-lightbox/dist/vue-cool-lightbox.min.css'
import BaseTable from '@/components/tables/BaseTable'
import AddProjectModal from '@/components/modals/AddProjectModal'
import defaultProps from '@/const/table-props.js'
import { Pages } from '@/mixins/pages'
import { userIsAtLeast, USER_TYPE_DATA_CURATOR } from '@/mixins/api/auth'
import { mdiDelete, mdiPlusBox, mdiSquareEditOutline } from '@mdi/js'
import { apiDeleteProject } from '@/mixins/api/project'
import { getImageUrlById } from '@/mixins/image'

const emitter = require('tiny-emitter/instance')

export default {
  name: 'ProjectTable',
  props: {
    ...defaultProps.BASE,
    ...defaultProps.IDS,
    ...defaultProps.ACTIONS,
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
      mdiDelete,
      mdiSquareEditOutline,
      Pages,
      options: {
        idColumn: 'projectId',
        tableName: 'projects'
      },
      project: null,
      coolboxIndex: null,
      coolboxImages: []
    }
  },
  computed: {
    ...mapGetters([
      'storeToken',
      'storeSelectedProjects'
    ]),
    userIsDataCurator: function () {
      return this.storeToken && userIsAtLeast(this.storeToken.userType, USER_TYPE_DATA_CURATOR)
    },
    localTableActions: function () {
      return [{
        id: 1,
        text: this.$t('buttonAddProject'),
        variant: null,
        disabled: () => false,
        path: mdiPlusBox,
        callback: () => {
          this.project = null
          this.$nextTick(() => this.$refs.projectEditModal.show())
        }
      }]
    },
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
          key: 'projectImageId',
          type: undefined,
          sortable: false,
          label: this.$t('tableColumnProjectImage')
        }, {
          key: 'datasets',
          type: undefined,
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

      if (this.userIsDataCurator) {
        columns.push({
          key: 'edit',
          type: undefined,
          sortable: false,
          class: 'px-1',
          label: ''
        })

        columns.push({
          key: 'delete',
          type: undefined,
          sortable: false,
          class: 'px-1',
          label: ''
        })
      }

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
    AddProjectModal,
    CoolLightBox,
    BaseTable,
    MdiIcon
  },
  methods: {
    getSrc: function (project, size) {
      return getImageUrlById(project.projectImageId, {
        type: 'projects',
        size: size,
        token: this.storeToken ? this.storeToken.imageToken : ''
      })
    },
    update: function (project) {
      this.coolboxImages = [{
        src: this.getSrc(project, 'large'),
        title: project.projectName
      }]
      this.coolboxIndex = 0
    },
    projectAddedEdited: function () {
      this.refresh()
      this.$emit('projects-updated')
      emitter.emit('update-sidebar-menu')
    },
    setSelectedItems: function (toSelect) {
      this.$refs.table.setSelectedItems(toSelect)
    },
    refresh: function () {
      this.$refs.table.refresh()
    },
    onProjectEditClicked: function (project) {
      this.project = project

      this.$nextTick(() => this.$refs.projectEditModal.show())
    },
    onProjectDeleteClicked: function (project) {
      this.$bvModal.msgBoxConfirm(this.$t('modalTextProjectDelete'), {
        title: this.$t('modalTitleSure'),
        okVariant: 'danger',
        okTitle: this.$t('genericYes'),
        cancelTitle: this.$t('genericNo')
      })
        .then(value => {
          if (value) {
            // Delete the image
            apiDeleteProject(project.projectId, result => {
              if (result) {
                const copy = this.storeSelectedProjects.concat().filter(p => p !== project.projectId)
                this.$store.dispatch('setSelectedProjects', copy)

                this.refresh()

                emitter.emit('update-sidebar-menu')
              }
            })
          }
        })
    }
  }
}
</script>

<style scoped>
.table-image {
  max-height: 150px;
  object-fit: contain;
}
</style>
