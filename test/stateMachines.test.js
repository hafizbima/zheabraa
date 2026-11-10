import { describe, it, expect } from 'vitest'
import {
  createMachine,
  modalMachine,
  MODAL_TYPES,
  dangerResetMachine,
  RESET_STAGES,
  entityLifecycleMachine,
  ENTITY_LIFECYCLE,
} from '../src/lib/stateMachines.js'

describe('stateMachines infrastructure', () => {
  it('creates custom machine and transitions states correctly', () => {
    const trafficLight = createMachine({
      id: 'trafficLight',
      initial: 'green',
      states: {
        green: { on: { TIMER: 'yellow' } },
        yellow: { on: { TIMER: 'red' } },
        red: { on: { TIMER: 'green' } },
      },
    })

    let state = trafficLight.initialState
    expect(state.status).toBe('green')

    state = trafficLight.reducer(state, { type: 'TIMER' })
    expect(state.status).toBe('yellow')

    state = trafficLight.reducer(state, { type: 'TIMER' })
    expect(state.status).toBe('red')

    state = trafficLight.reducer(state, { type: 'TIMER' })
    expect(state.status).toBe('green')

    // Unknown action does not alter state
    state = trafficLight.reducer(state, { type: 'UNKNOWN' })
    expect(state.status).toBe('green')
  })

  it('modalMachine prevents impossible multi-modal states and transitions cleanly', () => {
    let state = modalMachine.initialState
    expect(state.status).toBe(MODAL_TYPES.NONE)

    // Open transaction modal with prefill
    state = modalMachine.reducer(state, {
      type: 'OPEN_TRANSACTION',
      payload: { prefill: { amount: 50000 } },
    })
    expect(state.status).toBe(MODAL_TYPES.TRANSACTION)
    expect(state.payload?.prefill?.amount).toBe(50000)
    expect(state.payload?.mode).toBe('new')

    // Close modal returns to NONE
    state = modalMachine.reducer(state, { type: 'CLOSE' })
    expect(state.status).toBe(MODAL_TYPES.NONE)

    // Open Wallet modal
    state = modalMachine.reducer(state, { type: 'OPEN_WALLET' })
    expect(state.status).toBe(MODAL_TYPES.WALLET)

    // Close Wallet modal
    state = modalMachine.reducer(state, { type: 'CLOSE' })
    expect(state.status).toBe(MODAL_TYPES.NONE)
  })

  it('dangerResetMachine enforces strict multi-step sequence', () => {
    let state = dangerResetMachine.initialState
    expect(state.status).toBe(RESET_STAGES.IDLE)

    // Cannot jump directly to STAGE_2 or WIPING from IDLE
    state = dangerResetMachine.reducer(state, { type: 'PROCEED' })
    expect(state.status).toBe(RESET_STAGES.IDLE)

    // Step 1: Warning
    state = dangerResetMachine.reducer(state, { type: 'START_RESET' })
    expect(state.status).toBe(RESET_STAGES.STAGE_1_WARNING)

    // Step 2: Challenge phrase
    state = dangerResetMachine.reducer(state, { type: 'PROCEED' })
    expect(state.status).toBe(RESET_STAGES.STAGE_2_CHALLENGE)

    // Step 3: Wiping
    state = dangerResetMachine.reducer(state, { type: 'EXECUTE_WIPE' })
    expect(state.status).toBe(RESET_STAGES.WIPING)

    // Complete returns to IDLE
    state = dangerResetMachine.reducer(state, { type: 'RESET_COMPLETE' })
    expect(state.status).toBe(RESET_STAGES.IDLE)
  })

  it('entityLifecycleMachine tracks pristine, dirty, saving, and saved_flash', () => {
    let state = entityLifecycleMachine.initialState
    expect(state.status).toBe(ENTITY_LIFECYCLE.PRISTINE)

    state = entityLifecycleMachine.reducer(state, { type: 'MARK_DIRTY' })
    expect(state.status).toBe(ENTITY_LIFECYCLE.DIRTY)

    state = entityLifecycleMachine.reducer(state, { type: 'START_SAVE' })
    expect(state.status).toBe(ENTITY_LIFECYCLE.SAVING)

    state = entityLifecycleMachine.reducer(state, { type: 'SAVE_SUCCESS' })
    expect(state.status).toBe(ENTITY_LIFECYCLE.SAVED_FLASH)

    state = entityLifecycleMachine.reducer(state, { type: 'FLASH_EXPIRED' })
    expect(state.status).toBe(ENTITY_LIFECYCLE.PRISTINE)
  })
})
