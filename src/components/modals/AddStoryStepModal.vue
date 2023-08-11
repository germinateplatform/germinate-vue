<template>
  <b-modal
    ref="addStoryStepModal"
    size="lg"
    :title="$t('modalTitleAddStoryStep')"
    :ok-title="$t('genericAdd')"
    :cancel-title="$t('buttonCancel')"
    :ok-disabled="!canContinue"
    @ok.prevent="okPressed">
    <!-- Modal showing news add form -->
    <b-form @submit.stop.prevent>
      <b-form-group
        :label="$t('formLabelStoryStepName')"
        label-for="stepName">
        <b-form-input id="stepName" v-model="stepName" required/>
      </b-form-group>
      <b-form-group
        :label="$t('formLabelStoryStepDescription')"
        label-for="stepDescription">
        <b-form-textarea :rows=4 id="stepDescription" v-model="stepDescription" required />
      </b-form-group>
      <b-form-group
        :label="$t('formLabelStoryStepImage')"
        label-for="stepImage">
        <b-form-file v-model="imageFile" id="stepImage" accept=".jpeg, .png, .jpg" :state="Boolean(imageFile)" :placeholder="$t('pageDataUploadFilePlaceholder')" />
      </b-form-group>
    </b-form>
  </b-modal>
</template>

<script>
import { mapGetters } from 'vuex'
import { apiPostStoryStepUpload } from '@/mixins/api/misc'

export default {
  props: {
    stepIndexOffset: {
      type: Number,
      default: 0
    }
  },
  data: function () {
    return {
      stepName: null,
      stepDescription: null,
      imageFile: null
    }
  },
  computed: {
    ...mapGetters([
      'storeActiveStory'
    ]),
    canContinue: function () {
      return this.stepName && this.stepDescription
    }
  },
  methods: {
    okPressed: async function () {
      const route = this.$route

      const routeData = {
        router: {
          name: route.name,
          query: route.query,
          params: route.params
        }
      }

      const newIndex = this.storeActiveStory.index + this.stepIndexOffset
      const formData = new FormData()
      formData.append('stepName', this.stepName)
      formData.append('stepDescription', this.stepDescription)
      formData.append('storyIndex', newIndex)
      formData.append('pageConfig', JSON.stringify(routeData))

      if (this.imageFile) {
        formData.append('image', this.imageFile)
      }

      apiPostStoryStepUpload(this.storeActiveStory.story.storyId, formData, () => {
        this.$emit('story-step-added', newIndex)
        this.hide()
      })
    },
    show: function () {
      this.stepName = null
      this.stepDescription = null
      this.imageFile = null
      this.$refs.addStoryStepModal.show()
    },
    hide: function () {
      this.$refs.addStoryStepModal.hide()
    }
  }
}
</script>

<style>

</style>
