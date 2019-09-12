<template>
  <b-modal :ref="`attributeModal-${id}`" ok-only :ok-title="$t('buttonClose')" size="lg" title="Attributes">
    <div>
      <template v-if="dataset && dataset.dublinCore">
        <dl class="row">
          <template v-if="dataset.dublinCore.title">
            <dt class="col-sm-3 text-right">{{ $t('dublinCoreTitle') }}</dt><dd class="col-sm-9" v-html="dataset.dublinCore.title.join(', ')" />
          </template>
          <template v-if="dataset.dublinCore.creator">
            <dt class="col-sm-3 text-right">{{ $t('dublinCoreCreator') }}</dt><dd class="col-sm-9" v-html="dataset.dublinCore.creator.join(', ')" />
          </template>
          <template v-if="dataset.dublinCore.subject">
            <dt class="col-sm-3 text-right">{{ $t('dublinCoreSubject') }}</dt><dd class="col-sm-9" v-html="dataset.dublinCore.subject.join(', ')" />
          </template>
          <template v-if="dataset.dublinCore.description">
            <dt class="col-sm-3 text-right">{{ $t('dublinCoreDescription') }}</dt><dd class="col-sm-9" v-html="dataset.dublinCore.description.join(', ')" />
          </template>
          <template v-if="dataset.dublinCore.publisher">
            <dt class="col-sm-3 text-right">{{ $t('dublinCorePublisher') }}</dt><dd class="col-sm-9" v-html="dataset.dublinCore.publisher.join(', ')" />
          </template>
          <template v-if="dataset.dublinCore.contributor">
            <dt class="col-sm-3 text-right">{{ $t('dublinCoreContributor') }}</dt><dd class="col-sm-9" v-html="dataset.dublinCore.contributor.join(', ')" />
          </template>
          <template v-if="dataset.dublinCore.date">
            <dt class="col-sm-3 text-right">{{ $t('dublinCoreDate') }}</dt><dd class="col-sm-9" v-html="dataset.dublinCore.date.join(', ')" />
          </template>
          <template v-if="dataset.dublinCore.type">
            <dt class="col-sm-3 text-right">{{ $t('dublinCoreType') }}</dt><dd class="col-sm-9" v-html="dataset.dublinCore.type.join(', ')" />
          </template>
          <template v-if="dataset.dublinCore.format">
            <dt class="col-sm-3 text-right">{{ $t('dublinCoreFormat') }}</dt><dd class="col-sm-9" v-html="dataset.dublinCore.format.join(', ')" />
          </template>
          <template v-if="dataset.dublinCore.identifier">
            <dt class="col-sm-3 text-right">{{ $t('dublinCoreIdentifier') }}</dt><dd class="col-sm-9" v-html="dataset.dublinCore.identifier.join(', ')" />
          </template>
          <template v-if="dataset.dublinCore.source">
            <dt class="col-sm-3 text-right">{{ $t('dublinCoreSource') }}</dt><dd class="col-sm-9" v-html="dataset.dublinCore.source.join(', ')" />
          </template>
          <template v-if="dataset.dublinCore.language">
            <dt class="col-sm-3 text-right">{{ $t('dublinCoreLanguage') }}</dt><dd class="col-sm-9" v-html="dataset.dublinCore.language.join(', ')" />
          </template>
          <template v-if="dataset.dublinCore.relation">
            <dt class="col-sm-3 text-right">{{ $t('dublinCoreRelation') }}</dt><dd class="col-sm-9" v-html="dataset.dublinCore.relation.join(', ')" />
          </template>
          <template v-if="dataset.dublinCore.coverage">
            <dt class="col-sm-3 text-right">{{ $t('dublinCoreCoverage') }}</dt><dd class="col-sm-9" v-html="dataset.dublinCore.coverage.join(', ')" />
          </template>
          <template v-if="dataset.dublinCore.rights">
            <dt class="col-sm-3 text-right">{{ $t('dublinCoreRights') }}</dt><dd class="col-sm-9" v-html="dataset.dublinCore.rights.join(', ')" />
          </template>
        </dl>
      </template>
    </div>
  </b-modal>
</template>

<script>
export default {
  props: {
    dataset: {
      type: Object,
      default: null
    }
  },
  data: function () {
    return {
      id: this.uuidv4()
    }
  },
  methods: {
    show: function () {
      this.$refs['attributeModal-' + this.id].show()
    }
  }
}
</script>

<style>

</style>
