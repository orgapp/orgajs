type FunctionComponent<Props> = (props: Props) => React.JSX.Element | null
type ClassComponent<Props> = new (props: Props) => React.JSX.ElementClass
type Component<Props> =
	| FunctionComponent<Props>
	| ClassComponent<Props>
	| keyof React.JSX.IntrinsicElements

interface NestedOrgComponents {
	[key: string]: NestedOrgComponents | Component<any>
}

export type OrgComponents = NestedOrgComponents & {
	[Key in keyof React.JSX.IntrinsicElements]?: Component<
		React.JSX.IntrinsicElements[Key]
	>
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

export type OrgContent = (props: OrgProps) => React.JSX.Element

export interface OrgModule {
	/**
	 * This could be any value that is exported from the org file.
	 */
	[key: string]: unknown

	/**
	 * A functional React.JSX component which renders the content of the org file.
	 */
	default: OrgContent
}
