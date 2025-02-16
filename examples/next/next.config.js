import orga from '@orgajs/next'

const withOrga = orga({})

export default withOrga({
	pageExtensions: ['js', 'jsx', 'tsx', 'org'],
})
