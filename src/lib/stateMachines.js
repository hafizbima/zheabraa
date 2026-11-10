/**
 * Explicit State Machines for Gimme Money
 * Elevating UX (zero impossible states), DX (predictable actions), and AX (machine-readable contracts).
 * Zero external dependencies, 100% pure JavaScript & React compatible.
 */

import { useReducer, useMemo, useCallback } from 'react'

/**
 * Lightweight helper to create a deterministic finite state machine definition
 * @param {Object} config - { id, initial, states }
 */
export function createMachine(config) {
  const { id = 'machine', initial, states = {} } = config

  const reducer = (currentState, action) => {
    const stateConfig = states[currentState.status] || {}
    const transition = stateConfig.on?.[action.type]

    if (!transition) {
      // In dev mode, unhandled actions are safely ignored
      return currentState
    }

    if (typeof transition === 'string') {
      return { ...currentState, status: transition, payload: action.payload || null }
    }

    if (typeof transition === 'function') {
      const nextStatus = transition(currentState, action)
      if (!nextStatus) return currentState
      if (typeof nextStatus === 'string') {
        return { ...currentState, status: nextStatus, payload: action.payload || null }
      }
      return { ...currentState, ...nextStatus }
    }

    if (typeof transition === 'object') {
      const target = transition.target || currentState.status
      const payload = transition.payload ? transition.payload(currentState, action) : (action.payload || currentState.payload)
      return { ...currentState, status: target, payload }
    }

    return currentState
  }

  const initialState = {
    status: initial,
    payload: null,
  }

  return { id, initial, states, reducer, initialState }
}

/**
 * React hook to consume a state machine with explicit methods
 * @param {Object} machine - created via createMachine
 * @param {Object} initialOverrides - optional overrides
 */
export function useMachine(machine, initialOverrides = {}) {
  const init = useMemo(() => ({
    ...machine.initialState,
    ...initialOverrides,
  }), [machine, initialOverrides])

  const [state, dispatch] = useReducer(machine.reducer, init)

  const send = useCallback((type, payload = null) => {
    dispatch({ type, payload })
  }, [])

  const matches = useCallback((status) => state.status === status, [state.status])

  return [state, send, matches]
}

/* ====================================================================
   1. APP SHELL MODAL ORCHESTRATOR MACHINE
   Eliminates the 7 disjointed boolean modal flags in App.jsx.
   Guarantees that at most 1 primary modal can be active at any time.
   ==================================================================== */

export const MODAL_TYPES = Object.freeze({
  NONE: 'NONE',
  TRANSACTION: 'TRANSACTION',
  CATEGORY: 'CATEGORY',
  BUDGET_TEMPLATE: 'BUDGET_TEMPLATE',
  WALLET: 'WALLET',
  RECURRING: 'RECURRING',
  TRANSFER: 'TRANSFER',
  INSTALL_PROMPT: 'INSTALL_PROMPT',
})

export const modalMachine = createMachine({
  id: 'shellModal',
  initial: MODAL_TYPES.NONE,
  states: {
    [MODAL_TYPES.NONE]: {
      on: {
        OPEN_TRANSACTION: {
          target: MODAL_TYPES.TRANSACTION,
          payload: (_, action) => ({
            mode: action.payload?.tx ? 'edit' : 'new',
            monthId: action.payload?.monthId || null,
            tx: action.payload?.tx || null,
            prefill: action.payload?.prefill || null,
          }),
        },
        OPEN_CATEGORY: MODAL_TYPES.CATEGORY,
        OPEN_BUDGET_TEMPLATE: MODAL_TYPES.BUDGET_TEMPLATE,
        OPEN_WALLET: MODAL_TYPES.WALLET,
        OPEN_RECURRING: MODAL_TYPES.RECURRING,
        OPEN_TRANSFER: MODAL_TYPES.TRANSFER,
        OPEN_INSTALL_PROMPT: MODAL_TYPES.INSTALL_PROMPT,
      },
    },
    [MODAL_TYPES.TRANSACTION]: {
      on: {
        CLOSE: MODAL_TYPES.NONE,
        // Allows switching modal directly if needed
        OPEN_CATEGORY: MODAL_TYPES.CATEGORY,
        OPEN_WALLET: MODAL_TYPES.WALLET,
        OPEN_TRANSFER: MODAL_TYPES.TRANSFER,
      },
    },
    [MODAL_TYPES.CATEGORY]: {
      on: { CLOSE: MODAL_TYPES.NONE },
    },
    [MODAL_TYPES.BUDGET_TEMPLATE]: {
      on: { CLOSE: MODAL_TYPES.NONE },
    },
    [MODAL_TYPES.WALLET]: {
      on: { CLOSE: MODAL_TYPES.NONE },
    },
    [MODAL_TYPES.RECURRING]: {
      on: { CLOSE: MODAL_TYPES.NONE },
    },
    [MODAL_TYPES.TRANSFER]: {
      on: { CLOSE: MODAL_TYPES.NONE },
    },
    [MODAL_TYPES.INSTALL_PROMPT]: {
      on: { CLOSE: MODAL_TYPES.NONE },
    },
  },
})

/* ====================================================================
   2. DANGER ZONE RESET MULTI-STEP MACHINE
   Governs the 2-stage irreversible data wipe in Header.jsx.
   Stage 0 (Idle) -> Stage 1 (Warning dialog) -> Stage 2 (Type phrase) -> Wiping -> Idle
   ==================================================================== */

export const RESET_STAGES = Object.freeze({
  IDLE: 'IDLE',
  STAGE_1_WARNING: 'STAGE_1_WARNING',
  STAGE_2_CHALLENGE: 'STAGE_2_CHALLENGE',
  WIPING: 'WIPING',
})

export const dangerResetMachine = createMachine({
  id: 'dangerReset',
  initial: RESET_STAGES.IDLE,
  states: {
    [RESET_STAGES.IDLE]: {
      on: {
        START_RESET: RESET_STAGES.STAGE_1_WARNING,
      },
    },
    [RESET_STAGES.STAGE_1_WARNING]: {
      on: {
        PROCEED: RESET_STAGES.STAGE_2_CHALLENGE,
        CANCEL: RESET_STAGES.IDLE,
      },
    },
    [RESET_STAGES.STAGE_2_CHALLENGE]: {
      on: {
        EXECUTE_WIPE: RESET_STAGES.WIPING,
        CANCEL: RESET_STAGES.IDLE,
      },
    },
    [RESET_STAGES.WIPING]: {
      on: {
        RESET_COMPLETE: RESET_STAGES.IDLE,
        RESET_FAILED: RESET_STAGES.IDLE,
      },
    },
  },
})

/* ====================================================================
   3. ENTITY DRAFT & PERSISTENCE LIFECYCLE MACHINE
   Used for complex draft & reorder entities (WalletManager, CategoryManager)
   Pristine -> Dirty -> Saving -> Saved Flash -> Pristine
   ==================================================================== */

export const ENTITY_LIFECYCLE = Object.freeze({
  PRISTINE: 'PRISTINE',
  DIRTY: 'DIRTY',
  SAVING: 'SAVING',
  SAVED_FLASH: 'SAVED_FLASH',
})

export const entityLifecycleMachine = createMachine({
  id: 'entityLifecycle',
  initial: ENTITY_LIFECYCLE.PRISTINE,
  states: {
    [ENTITY_LIFECYCLE.PRISTINE]: {
      on: {
        MARK_DIRTY: ENTITY_LIFECYCLE.DIRTY,
      },
    },
    [ENTITY_LIFECYCLE.DIRTY]: {
      on: {
        START_SAVE: ENTITY_LIFECYCLE.SAVING,
        RESET_PRISTINE: ENTITY_LIFECYCLE.PRISTINE,
      },
    },
    [ENTITY_LIFECYCLE.SAVING]: {
      on: {
        SAVE_SUCCESS: ENTITY_LIFECYCLE.SAVED_FLASH,
        SAVE_ERROR: ENTITY_LIFECYCLE.DIRTY,
      },
    },
    [ENTITY_LIFECYCLE.SAVED_FLASH]: {
      on: {
        FLASH_EXPIRED: ENTITY_LIFECYCLE.PRISTINE,
        MARK_DIRTY: ENTITY_LIFECYCLE.DIRTY,
      },
    },
  },
})
