<template>
  <b-modal
    ref="addAboutPartnerModal"
    size="lg"
    :title="$t('modalTitleAddAboutPartner')"
    :ok-title="$t('genericAdd')"
    :cancel-title="$t('buttonCancel')"
    :ok-disabled="!canContinue"
    @ok.prevent="okPressed">
    <!-- Modal showing add form -->
    <b-form @submit.stop.prevent>
      <b-form-group :label="$t('formLabelAboutPartnerName')" label-for="name">
        <b-form-input id="name" trim v-model.trim="name" required/>
      </b-form-group>
      <b-form-group :label="$t('formLabelAboutPartnerDescription')" label-for="description">
        <b-form-textarea id="description" trim v-model.trim="description"/>
      </b-form-group>
      <b-form-group :label="$t('formLabelAboutPartnerGroup')" label-for="group">
        <b-form-input list="groups" trim v-model.trim="group" id="group" />

        <datalist id="groups">
          <option v-for="group in groupNames" :key="`group-${group}`">{{ group }}</option>
        </datalist>
      </b-form-group>
      <b-form-group :label="$t('formLabelAboutPartnerUrl')" label-for="url">
        <b-form-input id="url" type="url" trim v-model.trim="url" required/>
      </b-form-group>
      <b-form-group
        :label="$t('formLabelAboutPartnerImage')"
        label-for="image">
        <b-form-file v-model="image" id="image" accept=".jpeg, .png, .jpg, .svg" :state="Boolean(image)" :placeholder="$t('pageDataUploadFilePlaceholder')" />
      </b-form-group>
    </b-form>
  </b-modal>
</template>

<script>
import { apiPostAboutPartner } from '@/mixins/api/misc'

export default {
  props: {
    groupNames: {
      type: Array,
      default: () => []
    }
  },
  data: function () {
    return {
      name: null,
      description: null,
      group: null,
      url: null,
      image: null
    }
  },
  computed: {
    canContinue: function () {
      return this.name && this.url && this.image
    }
  },
  methods: {
    okPressed: function () {
      const formData = new FormData()
      formData.append('name', this.name)
      if (this.description) {
        formData.append('description', this.description)
      }
      if (this.group) {
        formData.append('group', this.group)
      }
      formData.append('url', this.url)
      formData.append('imageFile', this.image)

      apiPostAboutPartner(formData, result => {
        this.$emit('partner-added')
        this.hide()
      })
    },
    show: function () {
      this.name = null
      this.description = null
      this.group = null
      this.url = null
      this.image = null
      this.$refs.addAboutPartnerModal.show()
    },
    hide: function () {
      this.$refs.addAboutPartnerModal.hide()
    }
  }
}
</script>

<style>

</style>
