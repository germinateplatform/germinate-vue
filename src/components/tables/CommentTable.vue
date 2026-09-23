<template>
  <div>
    <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableComments} -->
    <BaseTable
      ref="baseTable"
      :get-data="compProps.getData"
      :headers="headers"
      :filter-on="filterOn"
      :show-details="false"
      item-key="commentId"
      table-key="comments"
      :sort-by="[{ key: 'updatedOn', order: 'desc' }]"
      :header-icon="mdiCommentAccount"
      :header-title="$t('pagePassportCommentTitle')"
      v-bind="$attrs"
    >
      <template #header v-if="store.storeToken && store.storeServerSettings?.commentsEnabled === true">
        <v-btn variant="outlined" :prepend-icon="mdiCommentPlus" @click="addItem">{{ $t('tableButtonAddComment') }}</v-btn>
      </template>

      <template #item.commentType="{ item }">
        <v-chip label :color="commentTypes[item.commentType].color()" :prepend-icon="commentTypes[item.commentType].path">{{ commentTypes[item.commentType].text() }}</v-chip>
      </template>

      <template #item.actions="{ item }">
        <v-btn-group variant="tonal" v-if="store.storeToken?.id === item.userId">
          <v-btn size="x-small" color="error" :icon="mdiDelete" v-tooltip:top="$t('tableTooltipDatasetDelete')" @click="deleteComment(item)" />
        </v-btn-group>
      </template>

      <!-- Pass on all named slots -->
      <template v-for="slot in Object.keys($slots)" #[slot]="slotProps">
        <slot :name="slot" v-bind="slotProps" />
      </template>
    </BaseTable>

    <!-- @vue-generic {import('@/plugins/types/germinate').Comments} -->
    <GenericAddEditFormModal
      title="modalTitleAddComment"
      v-model="selectedComment"
      :fields="commentFields"
      :notify="sendComment"
      @items-changed="baseTable?.refresh()"
      ref="commentEditModal"
      v-if="selectedComment"
    />
  </div>
</template>

<script setup lang="ts">
  import BaseTable from '@/components/tables/BaseTable.vue'

  import type { ExtendedDataTableHeader } from '@/plugins/types/client'
  import type { AxiosResponse } from 'axios'
  import type { Comments, FilterGroup, PaginatedRequest, PaginatedResult, ViewTableComments } from '@/plugins/types/germinate'
  import { useI18n } from 'vue-i18n'
  import { mdiCommentAccount, mdiCommentPlus, mdiDelete } from '@mdi/js'
  import { commentTypes } from '@/plugins/util/types'
  import { coreStore } from '@/stores/app'

  import emitter from 'tiny-emitter/instance'
  import { apiDeleteComment, apiPutComment } from '@/plugins/api/comment'

  const compProps = defineProps<{
    getData: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<ViewTableComments[]>>> }
    filterOn?: FilterGroup[]
    commentTypeId: number
    referenceId: number
  }>()

  const store = coreStore()
  const baseTable = useTemplateRef('baseTable')
  const commentEditModal = useTemplateRef('commentEditModal')
  const { t } = useI18n()

  const selectedComment = ref<Comments>()

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    const result = [{
      key: 'commentId',
      dataType: 'integer',
      sortable: true,
      title: t('tableColumnCommentId'),
    }, {
      key: 'commentTypeId',
      dataType: 'integer',
      sortable: true,
      title: t('tableColumnCommentTypeId'),
    }, {
      key: 'commentType',
      dataType: 'string',
      sortable: true,
      title: t('tableColumnCommentType'),
    }, {
      key: 'commentForeignId',
      dataType: 'integer',
      sortable: true,
      title: t('tableColumnCommentForeignId'),
    }, {
      key: 'userName',
      dataType: 'string',
      sortable: true,
      title: t('tableColumnCommentUserName'),
    }, {
      key: 'commentContent',
      dataType: 'json',
      sortable: true,
      title: t('tableColumnCommentContent'),
      preferredSortingColumn: true,
    }, {
      key: 'updatedOn',
      dataType: 'date',
      sortable: true,
      title: t('tableColumnCommentUpdatedOn'),
      // @ts-ignore
      value: (value: ViewTableComments) => value.updatedOn ? new Date(value.updatedOn).toLocaleDateString() : undefined,
    }, {
      key: 'actions',
      type: undefined,
      align: 'end',
      sortable: false,
      title: '',
    }]

    return result
  })

  function addItem () {
    selectedComment.value = {
      userId: store.storeToken?.id || -1,
      commenttypeId: compProps.commentTypeId,
      referenceId: compProps.referenceId,
      visibility: true,
      description: '',
    }

    nextTick(() => commentEditModal.value?.show())
  }

  function sendComment () {
    return new Promise<boolean>(resolve => {
      if (selectedComment.value) {
        apiPutComment(selectedComment.value, () => resolve(true))
      } else {
        resolve(false)
      }
    })
  }

  const commentFields = computed(() => {
    return [{
      key: 'description',
      title: 'tableColumnCommentContent',
      type: 'textarea' as const,
      required: true,
      width: 2,
    }]
  })

  function deleteComment (item: ViewTableComments) {
    emitter.emit('show-confirm', {
      title: t('modalTitleConfirm'),
      message: t('modalTextCommentDelete'),
      okTitle: t('genericYes'),
      cancelTitle: t('genericNo'),
      okVariant: 'error',
      callback: (result: boolean) => {
        if (result === true) {
          apiDeleteComment(item.commentId || -1, () => {
            baseTable.value?.refresh()
          }, {
            codes: [404],
            callback: () => {
              // Do nothing here, it just means there is nothing to delete
            },
          })
        }
      },
    })
  }

  defineExpose({
    refresh: (readFilter?: boolean) => baseTable.value?.refresh({ readFilter }),
  })
</script>
