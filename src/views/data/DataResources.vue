<template>
  <div>
    <h1>{{ $t('pageDataResourcesTitle') }}</h1>
    <p>{{ $t('pageDataResourcesText') }}</p>
    <template v-if="fileResourceTypes && fileResourceTypes.length > 0">
      <Collapse v-for="type in fileResourceTypes" :key="`resourcetype-${type.id}`" :title="type.name" :visible="false" v-on:toggle="(visible) => onUpdate(type, visible)" :ref="`collapse-${type.id}`">
        <template v-slot:default v-if="type.id in fileResources">
          <p v-if="type.description">{{ type.description }}</p>
          <b-list-group>
            <b-list-group-item :href="`${baseUrl}fileresource/${resource.fileresourceId}`" class="flex-column align-items-start" v-for="resource in fileResources[type.id].data" :key="`resource-${type.id}-${resource.fileresourceId}`">
              <div class="d-flex w-100 justify-content-between align-items-center">
                <h5 class="mb-1">{{ resource.fileresourceName }}</h5>
                <small>{{ getNumberWithSuffix(resource.fileresourceSize, 2, 1024, ' ') }}B</small>
              </div>
              <p class="mb-1" v-if="resource.fileresourceDescription">{{ resource.fileresourceDescription }}</p>
            </b-list-group-item>
          </b-list-group>
        </template>
      </Collapse>
    </template>
  </div>
</template>

<script>
import Vue from 'vue'

import Collapse from '@/components/util/Collapse'

import datasetApi from '@/mixins/api/dataset'

export default {
  data: function () {
    return {
      fileResourceTypes: null,
      fileResources: {
      }
    }
  },
  components: {
    Collapse
  },
  mixins: [ datasetApi ],
  methods: {
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
    }
  },
  mounted: function () {
    this.apiGetFileResourceTypes(result => {
      this.fileResourceTypes = result

      this.$nextTick(() => {
        this.fileResourceTypes.forEach(f => {
          this.$nextTick(() => this.$refs['collapse-' + f.id][0].update(null, { count: f.count }))
        })
      })
    })
  }
}
</script>

<style>

</style>
