/**
 * @typedef {Object} EndpointContext
 * @property {URL} url
 * @property {Record<string, string>} params
 * @property {'dev' | 'build'} mode
 * @property {{ route: string }} route
 */

/**
 * @param {Record<string, any>} endpointModule
 * @param {EndpointContext} ctx
 * @param {string} method
 * @returns {Promise<Response>}
 */
export async function resolveEndpointResponse(endpointModule, ctx, method = 'GET') {
	const hasGet = typeof endpointModule.GET === 'function'
	const hasHead = typeof endpointModule.HEAD === 'function'

	if (method === 'HEAD' && hasHead) {
		const headResponse = await endpointModule.HEAD(ctx)
		if (headResponse instanceof Response) return headResponse
		throw new Error(`Endpoint route "${ctx.route.route}" HEAD must return Response`)
	}

	if (hasGet) {
		const getResponse = await endpointModule.GET(ctx)
		if (!(getResponse instanceof Response)) {
			throw new Error(
				`Endpoint route "${ctx.route.route}" GET must return Response`
			)
		}

		if (method === 'HEAD') {
			const headers = new Headers(getResponse.headers)
			return new Response(null, {
				status: getResponse.status,
				statusText: getResponse.statusText,
				headers
			})
		}

		return getResponse
	}

	throw new Error(
		`Endpoint route "${ctx.route.route}" must export GET(ctx) returning Response`
	)
}
