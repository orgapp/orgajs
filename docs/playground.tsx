import content from './_snippets/hey.org?raw'
export const title = 'Orga Playground'

export default function Playground() {
	return (
		<div>
			<orga-playground content={content} />
			<script type="module" src="/playground.js" />
		</div>
	)
}
