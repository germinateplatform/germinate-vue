<template>
  <ul v-if="links && links.length > 0">
    <li v-for="(link, index) in links" :key="`link-widget-${index}`">
      <a :href="link.hyperlink" target="_blank">{{ link.linktypeDescription }}</a>&nbsp;<i class="mdi mdi-open-in-new" />
    </li>
  </ul>
</template>

<script>
import miscApi from '@/mixins/api/misc.js'

export default {
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
      links: null
    }
  },
  mixins: [ miscApi ],
  watch: {
    foreignId: function (newValue, oldValue) {
      this.update()
    },
    targetTable: function (newValue, oldValue) {
      this.update()
    }
  },
  methods: {
    update: function () {
      const query = {
        targetTable: this.targetTable,
        foreignId: this.foreignId
      }

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
