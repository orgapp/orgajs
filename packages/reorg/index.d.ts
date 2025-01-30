/// <reference types="reorg-parse" />

import type { Document } from 'orga'
import type { Processor } from 'unified'

/**
 * Create a new unified processor that already uses `reorg-parse`.
 */
export const remark: Processor<
  Document,
  undefined,
  undefined,
  undefined,
  undefined
>
