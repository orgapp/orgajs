import type { OrgaComponents } from '@orgajs/orgx'
import Image from 'next/image'

// This file is required to use Orga in `app` directory.
export function useOrgComponents(components: OrgaComponents) {
	// Allows customizing built-in components, e.g. use next/image.
	return {
		...components,
		img: (props: any) => (
			<Image alt={''} sizes="100vw" width={100} height={100} {...props} />
		),
	}
}
