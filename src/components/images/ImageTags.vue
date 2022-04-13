<template>
  <div v-if="imageTags && imageTags.length" class="mb-3">
    <h3>{{ $t('widgetImageTagsTitle') }}</h3>
    <b-badge class="mr-3" href="#" @click.native.prevent="onTagClicked(null)" variant="danger" v-if="selectedTag">
      <i class="mdi mdi-close" />
      <span> {{ $t('widgetImageTagsDeselect') }}</span>
    </b-badge>
    <b-badge v-for="(tag, index) in imageTags" :key="`image-tag-${index}`" class="mr-1" href="#" @click.native.prevent="onTagClicked(tag)" :variant="(selectedTag !== null && tag.tagId === selectedTag.tagId) ? 'primary' : null">
      <i class="mdi mdi-tag" />
      <span> {{ tag.tagName }}</span>
    </b-badge>
  </div>
</template>

<script>
import miscApi from '@/mixins/api/misc.js'

export default {
  props: {
    referenceTable: {
      type: String,
      default: null
    },
    foreignId: {
      type: Number,
      default: null
    }
  },
  data: function () {
    return {
      selectedTag: null,
      imageTags: []
    }
  },
  mixins: [miscApi],
  methods: {
    selectTag: function (tag) {
      this.selectedTag = tag
    },
    onTagClicked: function (tag) {
      this.selectedTag = tag
      this.$emit('tag-selected', tag)
    },
    refresh: function () {
      if (this.referenceTable && this.foreignId) {
        this.apiGetImageTagsForId(this.referenceTable, this.foreignId, result => {
          if (result) {
            this.imageTags = result.data
          }
        })
      } else {
        this.apiGetImageTags(result => {
          if (result) {
            this.imageTags = result.data
          }
        })
      }
    }
  },
  mounted: function () {
    this.refresh()
  }
}
</script>

<style>

</style>
