<template>
  <div>
    <h1>{{ $t('pageDataResourcesTitle') }} <b-button size="sm" v-if="token && userIsAtLeast(token.userType, 'Data Curator')" @click="onShowAddModal"><i class="mdi mdi-plus"/></b-button></h1>
    <p>{{ $t('pageDataResourcesText') }}</p>
    <template v-if="fileResourceTypes && fileResourceTypes.length > 0">
      <!-- Show a collapse per file resource type -->
      <Collapse v-for="type in nonEmptyFileResourceTypes"
                :key="`resourcetype-${type.id}`"
                :title="type.name"
                :visible="false"
                v-on:toggle="(visible) => onUpdate(type, visible)"
                :ref="`collapse-${type.id}`">
        <template v-slot:content v-if="type.id in fileResources">
          <!-- Description of file resource type -->
          <p v-if="type.description">{{ type.description }}</p>
          <b-list-group>
            <!-- Show a list group item per file resouce -->
            <b-list-group-item class="flex-column align-items-start"
                               v-for="resource in fileResources[type.id].data"
                               :key="`resource-${type.id}-${resource.fileresourceId}`">
              <div class="d-flex w-100 justify-content-between align-items-center">
                <div class="d-flex justify-content-between align-items-center">
                  <!-- Heading and link to download -->
                  <h5 class="mb-1"><a href="#" @click="downloadResource(resource)">{{ resource.fileresourceName }}</a></h5>
                  <i class="mdi mdi-download mdi-18px align-middle mx-1" />
                  <!-- File size -->
                  <small v-if="resource.fileresourceSize">({{ getNumberWithSuffix(resource.fileresourceSize, 2, 1024, ' ') }}B)</small>
                </div>
                <div>
                  <!-- Date -->
                  <small v-b-tooltip="$options.filters.toDateTime(resource.fileresourceCreatedOn)"><i class="mdi mdi-calendar-clock" /> {{ resource.fileresourceCreatedOn | toDate }}</small>
                  <!-- Button to delete the file resource -->
                  <b-button variant="danger" class="ml-3" v-if="token && userIsAtLeast(token.userType, 'Data Curator')" @click="onDeleteResource(resource)"><i class="mdi mdi-delete" /></b-button>
                </div>
              </div>
              <!-- Description of file resource -->
              <p class="mb-1" v-if="resource.fileresourceDescription">{{ resource.fileresourceDescription }}</p>
            </b-list-group-item>
          </b-list-group>

          <b-button variant="danger" class="mt-3" v-if="token && userIsAtLeast(token.userType, 'Data Curator')" @click="onDeleteType(type)"><i class="mdi mdi-delete" /> {{ $t('buttonDeleteType') }}</b-button>
        </template>
      </Collapse>
    </template>
    <!-- Modal to allow adding new file resources -->
    <FileResourceModal ref="fileResourceModal" v-on:resource-added="getFileResources" v-if="token && userIsAtLeast(token.userType, 'Data Curator')" />
  </div>
</template>

<script>
import Vue from 'vue'

import Collapse from '@/components/util/Collapse'
import FileResourceModal from '@/components/modals/FileResourceModal'

import datasetApi from '@/mixins/api/dataset'
import miscApi from '@/mixins/api/misc'

export default {
  data: function () {
    return {
      fileResourceTypes: null,
      fileResources: {
      }
    }
  },
  computed: {
    nonEmptyFileResourceTypes: function () {
      return this.fileResourceTypes ? this.fileResourceTypes.filter(f => f.count > 0) : null
    }
  },
  components: {
    Collapse,
    FileResourceModal
  },
  mixins: [ datasetApi, miscApi ],
  methods: {
    downloadResource: function (resource) {
      this.apiGetDataResource(resource.fileresourceId, result => {
        this.downloadBlob({
          blob: result,
          filename: resource.fileresourcePath
        })
      })
    },
    onDeleteResource: function (resource) {
      this.$bvModal.msgBoxConfirm(this.$t('modalTitleSure'), {
        okVariant: 'danger',
        okTitle: this.$t('genericYes'),
        cancelTitle: this.$t('genericNo')
      })
        .then(value => {
          if (value) {
            this.apiDeleteFileresource(resource.fileresourceId, result => {
              if (result) {
                this.getFileResources()
              }
            })
          }
        })
    },
    onDeleteType: function (type) {
      this.$bvModal.msgBoxConfirm(this.$t('modalTitleSure'), {
        okVariant: 'danger',
        okTitle: this.$t('genericYes'),
        cancelTitle: this.$t('genericNo')
      })
        .then(value => {
          if (value) {
            this.apiDeleteFileresourceType(type.id, result => {
              if (result) {
                this.getFileResources()
              }
            })
          }
        })
    },
    onShowAddModal: function () {
      this.$refs.fileResourceModal.show()
    },
    onUpdate: function (type, visible) {
      if (visible && !(type.id in this.fileResources)) {
        this.apiPostFileResourceTable({
          page: 1,
          filter: [{
            column: 'fileresourcetypeId',
            comparator: 'equals',
            operator: 'and',
            values: [type.id]
          }]
        }, result => {
          Vue.set(this.fileResources, type.id, result)
        })
      }
    },
    getFileResources: function () {
      this.apiGetFileResourceTypes(result => {
        this.fileResourceTypes = result

        this.$nextTick(() => {
          this.fileResourceTypes.forEach(f => {
            this.fileResources = {}
            this.$nextTick(() => {
              this.$refs['collapse-' + f.id][0].update(null, { count: f.count })
              this.$refs['collapse-' + f.id][0].close()
            })
          })
        })
      })
    }
  },
  mounted: function () {
    this.getFileResources()
  }
}
</script>

<style>

</style>
