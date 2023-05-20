declare module '*.org' {
  import { OrgaProps } from '@orgajs/orgx'
  export default function OrgaContent(props: OrgaProps): JSX.Element
}
