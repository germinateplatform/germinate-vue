import { authAxios, authForm } from '@/mixins/api/base'

const apiPostProjectTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: 'project/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostProjectTableIds = (queryData, onSuccess, onError) => {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'project/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostProject = (formData, onSuccess, onError) => authForm({ url: 'project', formData: formData, success: onSuccess, error: onError })

const apiPatchProject = (projectId, formData, onSuccess, onError) => authForm({ url: `project/${projectId}`, method: 'patch', formData: formData, success: onSuccess, error: onError })

const apiDeleteProject = (projectId, onSuccess, onError) => authAxios({ url: `project/${projectId}`, method: 'DELETE', success: onSuccess, error: onError })

const apiGetProjectStats = (projectId, onSuccess, onError) => authAxios({ url: `project/${projectId}/stats`, success: onSuccess, error: onError })

export {
  apiPostProjectTable,
  apiPostProjectTableIds,
  apiPostProject,
  apiPatchProject,
  apiDeleteProject,
  apiGetProjectStats
}
