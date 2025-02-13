let timeout = null

function echo(msg: string) {
	console.log(`echo: ${msg}`)
	const minibuffer = document.getElementById('minibuffer')
	minibuffer.textContent = msg
	clearTimeout(timeout)
	timeout = setTimeout(() => (minibuffer.textContent = ''), 2000)
}

window.echo = echo
