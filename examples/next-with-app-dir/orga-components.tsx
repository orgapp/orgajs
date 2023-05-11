import { OrgaComponents } from '@orgajs/orgx'
import Image from 'next/image'

export function useOrgaComponents(components: OrgaComponents) {
  return {
    ...components,
    img: (props: any) => (
      <div>
        <pre>{JSON.stringify(props, null, 2)}</pre>
        <Image alt={''} sizes="100vw" width={100} height={100} {...props} />
      </div>
    ),
  }
}
