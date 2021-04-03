import type { Store } from 'vuex'

const NAMESPACE = 'loading'

function onEffect({ type }, only, except) {
  return (
    (only.length === 0 && except.length === 0) ||
    (only.length > 0 && only.indexOf(type) > -1) ||
    (except.length > 0 && except.indexOf(type) === -1)
  )
}

interface CreateLoadingArgs {
  namespace?: string
  only?: string[]
  except?: string[]
}

export default function createLoading({ namespace = NAMESPACE, only = [], except = [] }: CreateLoadingArgs) {
  return (store: Store<any>) => {
    if (store.state[namespace]) {
      throw new Error(`createLoading: ${namespace} exited in current store`)
    }

    store.registerModule(namespace, {
      namespaced: true,
      state: {
        global: false,
        effects: {}
      },
      mutations: {
        SHOW(state, { payload }) {
          state.global = true
          state.effects = {
            ...state.effects,
            [payload]: true
          }
        },
        HIDE(state, { payload }) {
          state.global = false
          state.effects = {
            ...state.effects,
            [payload]: false
          }
        }
      }
    })

    store.subscribeAction({
      before: (action) => {
        if (onEffect(action, only, except)) {
          store.commit({ type: `${namespace}/SHOW`, payload: action.type })
        }
      },
      after: (action) => {
        if (onEffect(action, only, except)) {
          store.commit({ type: `${namespace}/HIDE`, payload: action.type })
        }
      }
    })
  }
}
