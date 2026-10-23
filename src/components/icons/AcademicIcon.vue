<template functional>
  <!-- Icon of the Academicons font (https://jpswalsh.github.io/academicons/), loaded in App.vue. Decorative unless a title is given. -->
  <i :class="`ai ai-${props.name} academic-icon ${props.className}`"
     :style="$options.getStyle(props)"
     :title="props.title"
     :aria-label="props.title"
     :aria-hidden="props.title ? null : 'true'"
     :role="props.title ? 'img' : null" />
</template>

<script>
// Used like MdiIcon: <AcademicIcon name="orcid" :size="18" color="#a6ce39" />
// "name" is the icon name without the "ai-" prefix, see the list on the Academicons page (e.g. orcid, google-scholar,
// doi, researchgate, pubmed, arxiv, figshare, zenodo).
export default {
  props: {
    name: {
      type: String,
      required: true
    },
    // In pixels; without one the icon follows the font size of the text around it
    size: {
      type: Number,
      default: null
    },
    color: {
      type: String,
      default: null
    },
    className: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: null
    }
  },
  getStyle (props) {
    const result = {}

    if (props.size) {
      result.fontSize = `${props.size}px`
    }
    if (props.color) {
      result.color = props.color
    }

    return result
  }
}
</script>

<style>
/* Same baseline as the MDI icons */
.academic-icon {
  line-height: 1;
  vertical-align: -0.125em;
}
</style>
