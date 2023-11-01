type FunctionComponent<Props> = (props: Props) => JSX.Element | null
type ClassComponent<Props> = new (props: Props) => JSX.ElementClass
type Component<Props> =
  | FunctionComponent<Props>
  | ClassComponent<Props>
  | keyof JSX.IntrinsicElements

interface NestedOrgComponents {
  [key: string]: NestedOrgComponents | Component<any>
}

export type OrgComponents = NestedOrgComponents & {
  [Key in keyof JSX.IntrinsicElements]?: Component<JSX.IntrinsicElements[Key]>
} & {
  /**
   * If a wrapper component is defined, the org content will be wrapped inside of it.
   */
  wrapper?: Component<any>
}

export interface OrgProps {
  /**
   * Which props exactly may be passed into the component depends on the contents of the org
   * file.
   */
  [key: string]: unknown

  /**
   * This prop may be used to customize how certain components are rendered.
   */
  components?: OrgComponents
}

export type OrgContent = (props: OrgProps) => JSX.Element

export interface OrgModule {
  /**
   * This could be any value that is exported from the org file.
   */
  [key: string]: unknown

  /**
   * A functional JSX component which renders the content of the org file.
   */
  default: OrgContent
}
