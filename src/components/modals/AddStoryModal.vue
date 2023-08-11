<template>
  <b-modal
    ref="addStoryModal"
    size="lg"
    :title="$t(storyToEdit ? 'modalTitleEditStory' : 'modalTitleAddStory')"
    :ok-title="$t(storyToEdit ? 'buttonUpdate' : 'genericAdd')"
    :cancel-title="$t('buttonCancel')"
    :ok-disabled="!canContinue"
    @ok.prevent="okPressed">
    <!-- Modal showing news add form -->
    <b-form @submit.stop.prevent>
      <b-form-group
        :label="$t('formLabelStoryName')"
        label-for="storyName">
        <b-form-input id="storyName" trim v-model="storyName" required/>
      </b-form-group>
      <b-form-group
        :label="$t('formLabelStoryDescription')"
        label-for="storyDescription">
        <b-form-textarea :rows=4 id="storyDescription" trim v-model="storyDescription" required />
      </b-form-group>
      <b-form-group
        :label="$t('formLabelStoryDate')"
        label-for="storyDate">
        <b-form-datepicker id="storyDate" value-as-date v-model="storyCreatedOn" />
      </b-form-group>
      <template v-if="storyToEdit">
        <b-form-group
          :label="$t('formLabelStoryVisibility')"
          label-for="storyVisibility">
          <b-form-checkbox switch id="storyVisibility" v-model="storyVisibility">{{ $t(storyVisibility ? 'genericYes' : 'genericNo') }}</b-form-checkbox>
        </b-form-group>
        <b-form-group
          :label="$t('formLabelStoryFeatured')"
          label-for="storyFeatured">
          <b-form-checkbox switch id="storyFeatured" v-model="storyFeatured">{{ $t(storyFeatured ? 'genericYes' : 'genericNo') }}</b-form-checkbox>
        </b-form-group>
      </template>
      <b-form-group
        :label="$t('formLabelStoryPublication')"
        label-for="publication">
        <b-form-select v-model="publicationId" :options="publications" id="publication" />
      </b-form-group>
      <b-form-group
        :label="$t('formLabelStoryImage')"
        label-for="storyImage"
        v-if="!storyToEdit">
        <b-form-file v-model="imageFile" id="storyImage" accept=".jpeg, .png, .jpg" :state="Boolean(imageFile)" :placeholder="$t('pageDataUploadFilePlaceholder')" />
      </b-form-group>
    </b-form>
  </b-modal>
</template>

<script>
import { apiPatchStory, apiPostPublicationsTable, apiPostStoryUpload } from '@/mixins/api/misc'
import { MAX_JAVA_INTEGER } from '@/mixins/api/base'

export default {
  props: {
    storyToEdit: {
      type: Object,
      default: null
    }
  },
  data: function () {
    return {
      storyName: null,
      storyDescription: null,
      storyCreatedOn: new Date(),
      publicationId: null,
      storyVisibility: false,
      storyFeatured: false,
      imageFile: null,
      publications: []
    }
  },
  computed: {
    canContinue: function () {
      return this.storyName && this.storyName !== '' && this.storyName.length < 255 && this.storyDescription && this.storyDescription !== ''
    }
  },
  methods: {
    okPressed: async function () {
      if (this.storyToEdit) {
        apiPatchStory(this.storyToEdit.storyId, {
          storyName: this.storyName,
          storyDescription: this.storyDescription,
          storyCreatedOn: this.storyCreatedOn,
          publicationId: this.publicationId,
          storyVisibility: this.storyVisibility,
          storyFeatured: this.storyFeatured
        }, () => {
          this.$emit('story-added')
          this.hide()
        })
      } else {
        const formData = new FormData()
        formData.append('storyName', this.storyName)
        formData.append('storyDescription', this.storyDescription)
        formData.append('storyCreatedOn', this.storyCreatedOn.toISOString())
        if (this.publicationId) {
          formData.append('publicationId', this.publicationId)
        }
        formData.append('storyVisibility', this.storyVisibility)
        formData.append('storyFeatured', this.storyFeatured)

        if (this.imageFile) {
          formData.append('image', this.imageFile)
        }

        apiPostStoryUpload(formData, () => {
          this.$emit('story-added')
          this.hide()
        })
      }
    },
    show: function () {
      if (this.storyToEdit) {
        this.storyName = this.storyToEdit.storyName
        this.storyDescription = this.storyToEdit.storyDescription
        this.storyCreatedOn = new Date(this.storyToEdit.storyCreatedOn)
        this.publicationId = this.storyToEdit.publicationId
        this.storyVisibility = this.storyToEdit.storyVisibility
        this.storyFeatured = this.storyToEdit.storyFeatured
      } else {
        this.storyName = null
        this.storyDescription = null
        this.storyCreatedOn = new Date()
        this.publicationId = null
        this.storyVisibility = false
        this.storyFeatured = false
      }

      this.imageFile = null

      this.$refs.addStoryModal.show()
    },
    hide: function () {
      this.$refs.addStoryModal.hide()
    }
  },
  mounted: function () {
    apiPostPublicationsTable({
      page: 1,
      limit: MAX_JAVA_INTEGER
    }, result => {
      let temp = []

      if (result && result.data) {
        temp = result.data.map(p => {
          try {
            p.publicationFallbackCache = JSON.parse(p.publicationFallbackCache)
          } catch (err) {
            //
          }

          return {
            value: p.publicationId,
            text: p.publicationFallbackCache ? (p.publicationFallbackCache.title || p.publicationDoi) : p.publicationDoi
          }
        })
      } else {
        temp = []
      }

      temp.unshift({
        value: null,
        text: this.$t('genericNone')
      })

      this.publications = temp
    })
  }
}
</script>

<style>

</style>
