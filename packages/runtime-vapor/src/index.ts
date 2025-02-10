// public APIs
export { createVaporApp } from './apiCreateApp'
export { defineVaporComponent } from './apiDefineComponent'
export { vaporInteropPlugin } from './vdomInterop'
export type { VaporDirective } from './directives/custom'

// compiler-use only
export { insert, prepend, remove } from './block'
export { createComponent, createComponentWithFallback } from './component'
export { renderEffect } from './renderEffect'
export { createSlot } from './componentSlots'
export { template, children, child, next, nextn } from './dom/template'
export { createTextNode } from './dom/node'
export {
  setText,
  setHtml,
  setClass,
  setStyle,
  setAttr,
  setValue,
  setProp,
  setDOMProp,
  setDynamicProps,
} from './dom/prop'
export { on, delegate, delegateEvents, setDynamicEvents } from './dom/event'
export { createIf } from './apiCreateIf'
export {
  createFor,
  createForSlots,
  getRestElement,
  getDefaultValue,
} from './apiCreateFor'
export { createTemplateRefSetter } from './apiTemplateRef'
export { createDynamicComponent } from './apiCreateDynamicComponent'
export { applyVShow } from './directives/vShow'
export {
  applyTextModel,
  applyRadioModel,
  applyCheckboxModel,
  applySelectModel,
  applyDynamicModel,
} from './directives/vModel'
export { withVaporDirectives } from './directives/custom'
