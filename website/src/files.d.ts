declare module '*.org' {
  import { OrgProps } from '@orgajs/orgx'
  export default function OrgContent(props: OrgProps): JSX.Element
}
