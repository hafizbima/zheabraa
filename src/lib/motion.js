/**
 * Shared motion tokens and class combinations.
 * Follows /appllama-app-design-skill:
 * - Single ease-out: cubic-bezier(0.23, 1, 0.32, 1)
 * - Durations: 120ms (press), 160ms (exit), 200ms (base/colors), 260ms (enter/sheet)
 * - Scale: 0.97 on press-in for buttons/cards/chips (never on list rows)
 * - Zero transition-all
 */

export const pressFeedback =
  'transition-[transform,background-color,border-color,color,opacity,box-shadow] duration-120 ease-out-expo active:scale-[0.97]'

export const pressHighlight =
  'transition-colors duration-120 ease-out-expo active:bg-slate-100 dark:active:bg-slate-800/80'

export const motionEnter = 'animate-fade-up'
export const motionExit = 'animate-fade-out'
export const motionShake = 'animate-shake'
export const motionCheck = 'animate-draw-check'
