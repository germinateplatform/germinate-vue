import { authAxios, type ErrorHandler } from '@/plugins/api/base'
import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'

export type CountResult = { [index: string]: number }

function apiGetVariableMethodClassCounts (onSuccess?: GerminateResponseHandler<CountResult>, onError?: ErrorHandler) {
  return authAxios<CountResult>({ url: 'variable/methodclass/count', success: onSuccess, error: onError })
}

function apiGetVariableTraitClassCounts (onSuccess?: GerminateResponseHandler<CountResult>, onError?: ErrorHandler) {
  return authAxios<CountResult>({ url: 'variable/traitclass/count', success: onSuccess, error: onError })
}

function apiGetVariableScaleDataTypeCounts (onSuccess?: GerminateResponseHandler<CountResult>, onError?: ErrorHandler) {
  return authAxios<CountResult>({ url: 'variable/scaledatatype/count', success: onSuccess, error: onError })
}

export {
  apiGetVariableMethodClassCounts,
  apiGetVariableTraitClassCounts,
  apiGetVariableScaleDataTypeCounts,
}
