<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               :filterOn="getFilter()"
               :tableActions="tableActions"
               primary-key="commentId"
               v-bind="$props"
               ref="commentTable"
               v-on="$listeners">
      <!-- Comment type -->
      <template v-slot:cell(commentType)="data">
        <span class="text-nowrap"><span :style="`color: ${commentTypes[data.item.commentType].color()};`"><MdiIcon :path="commentTypes[data.item.commentType].path" /></span> {{ commentTypes[data.item.commentType].text() }}</span>
      </template>
      <!-- Additional actions column holding the delete button -->
      <template v-slot:cell(actions)="data">
        <div v-if="storeToken && storeToken.id === data.item.userId">
          <b-button size="sm" variant="outline-danger" v-b-tooltip:hover :title="$t('tooltipDelete')" @click="deleteComment(data.item)"><MdiIcon :path="mdiDelete" /></b-button>
        </div>
      </template>
    </BaseTable>

    <!-- Modal containing the input field for new comments -->
    <b-modal ref="commentModal"
             v-if="storeToken"
             :title="$t('modalTitleAddComment')"
             :ok-title="$t('buttonSubmit')"
             :cancel-title="$t('buttonCancel')"
             :ok-disabled="newComment === null"
             @ok="addNewComment">
      <b-form @submit.prevent.stop="addNewComment">
        <b-form-input v-model="newComment" required autofocus />
      </b-form>
    </b-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import MdiIcon from '@/components/icons/MdiIcon'
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props'
import { apiPutComment, apiDeleteComment } from '@/mixins/api/misc'
import { commentTypes } from '@/mixins/types'

import { mdiPlusBox, mdiDelete } from '@mdi/js'

export default {
  name: 'CommentTable',
  props: {
    ...defaultProps.BASE,
    commentTypeId: {
      type: Number,
      default: 1
    },
    referenceId: {
      type: Number,
      default: null
    }
  },
  data: function () {
    return {
      commentTypes,
      mdiDelete,
      options: {
        idColumn: 'commentId',
        tableName: 'comments',
        orderBy: 'updatedOn',
        orderByDesc: true
      },
      newComment: null,
      tableActions: [{
        id: 0,
        text: this.$t('tooltipAddNewComment'),
        variant: null,
        disabled: () => !this.storeToken,
        path: mdiPlusBox,
        callback: () => {
          this.newComment = ''

          this.$nextTick(() => this.$refs.commentModal.show())
        }
      }]
    }
  },
  watch: {
    commentTypeId: function () {
      this.refresh()
    },
    referenceId: function () {
      this.refresh()
    }
  },
  computed: {
    ...mapGetters([
      'storeToken'
    ]),
    columns: function () {
      return [{
        key: 'commentId',
        type: Number,
        class: 'text-right',
        sortable: true,
        label: this.$t('tableColumnCommentId')
      }, {
        key: 'commentTypeId',
        type: Number,
        sortable: true,
        label: this.$t('tableColumnCommentTypeId')
      }, {
        key: 'commentType',
        type: String,
        sortable: true,
        label: this.$t('tableColumnCommentType')
      }, {
        key: 'commentForeignId',
        type: Number,
        sortable: true,
        label: this.$t('tableColumnCommentForeignId')
      }, {
        key: 'userName',
        type: String,
        sortable: true,
        label: this.$t('tableColumnCommentUserName')
      }, {
        key: 'commentContent',
        type: 'json',
        sortable: true,
        label: this.$t('tableColumnCommentContent'),
        preferredSortingColumn: true
      }, {
        key: 'updatedOn',
        type: Date,
        sortable: true,
        label: this.$t('tableColumnCommentUpdatedOn'),
        formatter: value => value ? new Date(value).toLocaleString() : null
      }, {
        key: 'actions',
        type: undefined,
        class: 'text-right',
        sortable: false,
        label: ''
      }]
    }
  },
  components: {
    BaseTable,
    MdiIcon
  },
  methods: {
    getFilter: function () {
      return [{
        column: {
          name: 'commentTypeId',
          type: Number
        },
        comparator: 'equals',
        operator: 'and',
        values: [this.commentTypeId],
        canBeChanged: false
      }, {
        column: {
          name: 'commentForeignId',
          type: Number
        },
        comparator: 'equals',
        operator: 'and',
        values: [this.referenceId],
        canBeChanged: false
      }]
    },
    refresh: function () {
      this.$refs.commentTable.refresh()
    },
    deleteComment: function (comment) {
      // Ask for confirmation
      this.$bvModal.msgBoxConfirm(this.$t('modalTitleSure'), {
        okVariant: 'danger',
        okTitle: this.$t('genericYes'),
        cancelTitle: this.$t('genericNo')
      })
        .then(value => {
          if (value) {
            // Delete the comment
            apiDeleteComment(comment.commentId, () => {
              this.refresh()
            })
          }
        })
    },
    addNewComment: function () {
      if (this.newComment && this.newComment.length > 0) {
        // Submit the new comment
        const data = {
          commenttypeId: this.commentTypeId,
          userId: this.storeToken ? this.storeToken.id : null,
          description: this.newComment,
          referenceId: this.referenceId
        }
        apiPutComment(data, () => {
          this.refresh()
          this.$refs.commentModal.hide()
        })
      }
    }
  }
}
</script>

<style>
</style>
