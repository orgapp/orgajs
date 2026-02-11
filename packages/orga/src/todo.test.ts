import { describe, it } from 'node:test'
import assert from 'node:assert'
import { parseTodoKeywords } from './todo.ts'

describe('todo manager', () => {
	it('works', () => {
		const t = parseTodoKeywords('TODO NEXT | DONE')
		assert.deepEqual(t.keywords, ['TODO', 'NEXT', 'DONE'])
		assert.equal(t.next('TODO'), 'NEXT')
		assert.equal(t.next('NEXT'), 'DONE')
		assert.equal(t.next('DONE'), 'TODO')
		assert.equal(t.next('TODO', true), 'DONE')
		assert.equal(t.next('NEXT', true), 'TODO')
		assert.equal(t.next('DONE', true), 'NEXT')
		assert.equal(t.next('MISSING'), undefined)
		assert.equal(t.actionable('TODO'), true)
		assert.equal(t.actionable('NEXT'), true)
		assert.equal(t.actionable('DONE'), false)
		assert.equal(t.actionable('MISSING'), false)
	})

	it('last one as done without |', () => {
		const t = parseTodoKeywords('TODO NEXT DONE')
		assert.deepEqual(t.keywords, ['TODO', 'NEXT', 'DONE'])
		assert.equal(t.next('TODO'), 'NEXT')
		assert.equal(t.next('NEXT'), 'DONE')
		assert.equal(t.next('DONE'), 'TODO')
		assert.equal(t.next('TODO', true), 'DONE')
		assert.equal(t.next('NEXT', true), 'TODO')
		assert.equal(t.next('DONE', true), 'NEXT')
		assert.equal(t.next('MISSING'), undefined)
		assert.equal(t.actionable('TODO'), true)
		assert.equal(t.actionable('NEXT'), true)
		assert.equal(t.actionable('DONE'), false)
		assert.equal(t.actionable('MISSING'), false)
	})
})
