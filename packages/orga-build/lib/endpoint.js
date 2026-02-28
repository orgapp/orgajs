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
export async function resolveEndpointResponse(
	endpointModule,
	ctx,
	method = 'GET'
) {
	const route = ctx.route.route

	if (method === 'HEAD' && typeof endpointModule.HEAD === 'function') {
		const res = await endpointModule.HEAD(ctx)
		if (!(res instanceof Response))
			throw new Error(`Endpoint route "${route}" HEAD must return Response`)
		return res
	}

	if (typeof endpointModule.GET !== 'function') {
		throw new Error(
			`Endpoint route "${route}" must export GET(ctx) returning Response`
		)
	}

	const res = await endpointModule.GET(ctx)
	if (!(res instanceof Response)) {
		throw new Error(`Endpoint route "${route}" GET must return Response`)
	}

	if (method === 'HEAD') {
		return new Response(null, {
			status: res.status,
			statusText: res.statusText,
			headers: new Headers(res.headers)
		})
	}

	return res
}
