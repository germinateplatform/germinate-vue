<template>
  <div>
    <div :class="`my-3 ${storeActiveStory ? '' : 'pt-3'} d-flex justify-content-between align-items-center`">
      <div class="d-flex align-items-center">
        <b-img-lazy width="48" height="48" :src="`${storeBaseUrl}image/src-svg/crop.svg`" onerror="this.onerror=null;this.src='null';" alt="Crop logo" />
        <h5 class="my-0 ml-3">{{ $t('germinateTitle') }}</h5>
      </div>
      <div class="d-flex flex-row flex-wrap justify-content-end">
        <!-- Selected projects -->
        <h5 v-if="selectedProjects && selectedProjects.length > 0"
            class="d-flex align-items-stretch mx-1 marked-item-badges">
          <div tabindex="100" id="popover-target-projects" class="d-flex align-items-stretch" v-b-tooltip="$t('tooltipPageHeaderShowSelectedProjects')">
            <b-badge variant="primary">
              <MdiIcon :path="mdiClipboardList" />
            </b-badge>
            <b-badge>{{ getNumberWithSuffix(selectedProjects.length, 1) }}</b-badge>
          </div>
          <b-popover target="popover-target-projects" triggers="focus" placement="top">
            <template #title>{{ `${$t('widgetHeaderSelectedProjects')}: ${(selectedProjects || []).length.toLocaleString()}` }}</template>

            <b-list-group>
              <b-list-group-item v-for="project in selectedProjects" :key="`selected-project-${project.projectId}`" class="d-flex justify-content-between align-items-center">
                <span>{{ project.projectName }}</span>
                <b-badge variant="danger" href="#" @click.prevent="removeSelectedProject(project)">
                  <MdiIcon :path="mdiDelete" />
                </b-badge>
              </b-list-group-item>
            </b-list-group>
          </b-popover>
          <b-badge :href="selectedProjects.length < 1 ? null : '#'"
                   :disabled="selectedProjects.length < 1"
                   @click.prevent="selectedProjects.length < 1 ? null : clearSelectedProjects()"
                   v-b-tooltip="$t('chartTooltipSelectedProjectsClear')">
            <span :class="{ 'text-danger': selectedProjects.length >= 1 }"><MdiIcon :path="mdiDelete" /></span>
          </b-badge>
        </h5>
        <!-- Badges for marked items -->
        <h5 v-for="itemType in Object.keys(markedItemTypes)"
            :key="`item-type-${itemType}`"
            class="d-flex align-items-stretch mx-1 marked-item-badges">
          <router-link :to="{ name: Pages.markedItemsType, params: { itemType: itemType } }" class="d-flex align-items-stretch" v-b-tooltip="`${markedItemTypes[itemType].text()}: ${storeMarkedIds[itemType].length.toLocaleString()}`">
            <b-badge :style="{ backgroundColor: markedItemTypes[itemType].color(), color: getHighContrastTextColor(markedItemTypes[itemType].color()) }">
              <MdiIcon :path="markedItemTypes[itemType].path" />
            </b-badge>
            <b-badge>{{ getNumberWithSuffix(storeMarkedIds[itemType].length, 1) }}</b-badge>
          </router-link>
          <b-badge :href="storeMarkedIds[itemType].length < 1 ? null : '#'"
                   :disabled="storeMarkedIds[itemType].length < 1"
                   @click.prevent="storeMarkedIds[itemType].length < 1 ? null : clearMarkedItems(itemType)"
                   v-b-tooltip="$t('chartTooltipMarkedItemsClear')">
            <span :class="{ 'text-danger': storeMarkedIds[itemType].length >= 1 }"><MdiIcon :path="mdiDelete" /></span>
          </b-badge>
        </h5>
      </div>
    </div>
    <hr />
  </div>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import { getHighContrastTextColor } from '@/mixins/colors'
import { getNumberWithSuffix } from '@/mixins/formatting'
import { markedItemTypes } from '@/mixins/types'
import { Pages } from '@/mixins/pages'

import { mdiClipboardList, mdiDelete } from '@mdi/js'

import { mapGetters } from 'vuex'
import { apiPostProjectTable } from '@/mixins/api/project'

export default {
  components: {
    MdiIcon
  },
  data: function () {
    return {
      Pages,
      markedItemTypes,
      mdiDelete,
      mdiClipboardList,
      selectedProjects: []
    }
  },
  computed: {
    ...mapGetters([
      'storeBaseUrl',
      'storeServerSettings',
      'storeMarkedIds',
      'storeActiveStory',
      'storeSelectedProjects'
    ])
  },
  watch: {
    storeSelectedProjects: function (newValue) {
      if (newValue && newValue.length > 0) {
        this.fetchSelectedProjects()
      } else {
        this.selectedProjects = []
      }
    }
  },
  methods: {
    getNumberWithSuffix,
    getHighContrastTextColor,
    fetchSelectedProjects: function () {
      const data = {
        page: 1,
        limit: this.storeSelectedProjects.length,
        prevCount: -1,
        orderBy: null,
        ascending: null,
        minimal: true,
        filter: [
          {
            column: 'projectId',
            operator: 'and',
            comparator: 'inSet',
            values: this.storeSelectedProjects
          }
        ]
      }
      apiPostProjectTable(data, result => {
        if (result && result.data) {
          this.selectedProjects = result.data || []
        }
      })
    },
    removeSelectedProject: function (project) {
      const copy = this.storeSelectedProjects.concat().filter(p => p !== project.projectId)

      this.$store.dispatch('setSelectedProjects', copy)
    },
    clearSelectedProjects: function () {
      // Ask for confirmation
      this.$bvModal.msgBoxConfirm(this.$t('modalTitleSure'), {
        okVariant: 'danger',
        okTitle: this.$t('genericYes'),
        cancelTitle: this.$t('genericNo')
      })
        .then(value => {
          if (value) {
            this.$store.dispatch('setSelectedProjects', [])
          }
        })
    },
    clearMarkedItems: function (itemType) {
      // Ask for confirmation
      this.$bvModal.msgBoxConfirm(this.$t('modalTitleSure'), {
        okVariant: 'danger',
        okTitle: this.$t('genericYes'),
        cancelTitle: this.$t('genericNo')
      })
        .then(value => {
          if (value) {
            this.$store.dispatch('clearMarkedIds', itemType)
          }
        })
    }
  },
  mounted: function () {
    this.fetchSelectedProjects()
  }
}
</script>

<style scoped>
#popover-target-projects:hover {
  cursor: pointer;
}
.marked-item-badges {
  white-space: nowrap;
}
.marked-item-badges a .badge:first-child {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.marked-item-badges a .badge:last-child {
  border-radius: 0;
}
.marked-item-badges a:hover {
  text-decoration: none;
}
.marked-item-badges > .badge {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
</style>
