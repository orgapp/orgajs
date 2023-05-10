type FunctionComponent<Props> = (props: Props) => JSX.Element | null
type ClassComponent<Props> = new (props: Props) => JSX.ElementClass
type Component<Props> =
  | FunctionComponent<Props>
  | ClassComponent<Props>
  | keyof JSX.IntrinsicElements

interface NestedOrgaComponents {
  [key: string]: NestedOrgaComponents | Component<any>
}

export type OrgaComponents = NestedOrgaComponents & {
  [Key in keyof JSX.IntrinsicElements]?: Component<JSX.IntrinsicElements[Key]>
} & {
  /**
   * If a wrapper component is defined, the MDX content will be wrapped inside of it.
   */
  wrapper?: Component<any>
}

export interface OrgaProps {
  /**
   * Which props exactly may be passed into the component depends on the contents of the MDX
   * file.
   */
  [key: string]: unknown

  /**
   * This prop may be used to customize how certain components are rendered.
   */
  components?: OrgaComponents
}

export type OrgaContent = (props: OrgaProps) => JSX.Element
