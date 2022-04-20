<template>
  <ul v-if="links && links.length > 0">
    <template v-for="(link, index) in links">
      <li :key="`link-widget-${index}`" v-if="link.hyperlink">
        <a :href="link.hyperlink" target="_blank" rel="noopener noreferrer">{{ link.linktypeDescription }}</a>&nbsp;<MdiIcon :path="mdiOpenInNew" />
      </li>
    </template>
  </ul>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import miscApi from '@/mixins/api/misc.js'

import { mdiOpenInNew } from '@mdi/js'

export default {
  components: {
    MdiIcon
  },
  props: {
    foreignId: {
      type: Number,
      default: null
    },
    targetTable: {
      type: String,
      default: null
    }
  },
  data: function () {
    return {
      mdiOpenInNew,
      links: null
    }
  },
  mixins: [miscApi],
  watch: {
    foreignId: function () {
      this.update()
    },
    targetTable: function () {
      this.update()
    }
  },
  methods: {
    update: function () {
      // Set up the query
      const query = {
        targetTable: this.targetTable,
        foreignId: this.foreignId
      }

      // Query the API
      this.apiPostLinks(query, result => {
        this.links = result
      })
    }
  },
  mounted: function () {
    this.update()
  }
}
</script>

<style>

</style>
