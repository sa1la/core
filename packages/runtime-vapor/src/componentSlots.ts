import { EMPTY_OBJ, NO, hasOwn, isArray, isFunction } from '@vue/shared'
import { type Block, type BlockFn, DynamicFragment } from './block'
import {
  type RawProps,
  getAttrFromRawProps,
  getKeysFromRawProps,
  hasAttrFromRawProps,
} from './componentProps'
import { currentInstance } from '@vue/runtime-core'
import type { LooseRawProps, VaporComponentInstance } from './component'
import { renderEffect } from './renderEffect'

export type RawSlots = Record<string, Slot> & {
  $?: DynamicSlotSource[]
}

export type StaticSlots = Record<string, Slot>

export type Slot = BlockFn
export type DynamicSlot = { name: string; fn: Slot }
export type DynamicSlotFn = () => DynamicSlot | DynamicSlot[]
export type DynamicSlotSource = StaticSlots | DynamicSlotFn

export const dynamicSlotsProxyHandlers: ProxyHandler<RawSlots> = {
  get: getSlot,
  has: (target, key: string) => !!getSlot(target, key),
  getOwnPropertyDescriptor(target, key: string) {
    const slot = getSlot(target, key)
    if (slot) {
      return {
        configurable: true,
        enumerable: true,
        value: slot,
      }
    }
  },
  ownKeys(target) {
    const keys = Object.keys(target)
    const dynamicSources = target.$
    if (dynamicSources) {
      for (const source of dynamicSources) {
        if (isFunction(source)) {
          const slot = source()
          if (isArray(slot)) {
            for (const s of slot) keys.push(s.name)
          } else {
            keys.push(slot.name)
          }
        } else {
          keys.push(...Object.keys(source))
        }
      }
    }
    return keys
  },
  set: NO,
  deleteProperty: NO,
}

export function getSlot(target: RawSlots, key: string): Slot | undefined {
  if (key === '$') return
  const dynamicSources = target.$
  if (dynamicSources) {
    let i = dynamicSources.length
    let source
    while (i--) {
      source = dynamicSources[i]
      if (isFunction(source)) {
        const slot = source()
        if (isArray(slot)) {
          for (const s of slot) {
            if (s.name === key) return s.fn
          }
        } else if (slot.name === key) {
          return slot.fn
        }
      } else if (hasOwn(source, key)) {
        return source[key]
      }
    }
  }
  if (hasOwn(target, key)) {
    return target[key]
  }
}

const dynamicSlotsPropsProxyHandlers: ProxyHandler<RawProps> = {
  get: getAttrFromRawProps,
  has: hasAttrFromRawProps,
  ownKeys: getKeysFromRawProps,
  getOwnPropertyDescriptor(target, key: string) {
    if (hasAttrFromRawProps(target, key)) {
      return {
        configurable: true,
        enumerable: true,
        get: () => getAttrFromRawProps(target, key),
      }
    }
  },
}

// TODO how to handle empty slot return blocks?
// e.g. a slot renders a v-if node that may toggle inside.
// we may need special handling by passing the fallback into the slot
// and make the v-if use it as fallback
export function createSlot(
  name: string | (() => string),
  rawProps?: LooseRawProps | null,
  fallback?: Slot,
): Block {
  const instance = currentInstance as VaporComponentInstance
  const fragment = new DynamicFragment('slot')
  const slotProps = rawProps
    ? new Proxy(rawProps, dynamicSlotsPropsProxyHandlers)
    : EMPTY_OBJ

  // always create effect because a slot may contain dynamic root inside
  // which affects fallback
  renderEffect(() => {
    const slot = getSlot(instance.rawSlots, isFunction(name) ? name() : name)
    if (slot) {
      fragment.update(
        () => slot(slotProps) || (fallback && fallback()),
        // TODO this key needs to account for possible fallback (v-if)
        // inside the slot
        slot,
      )
    } else {
      fragment.update(fallback)
    }
  })

  return fragment
}
