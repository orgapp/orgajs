/**
 * Get current components from the org context.
 *
 * @param {Components | MergeComponents | null | undefined} [components]
 *   Additional components to use or a function that takes the current
 *   components and filters/merges/changes them.
 * @returns {Components}
 *   Current components.
 */
export function useOrgComponents(components?: Components | MergeComponents | null | undefined): Components;
/**
 * Provider for org context
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
export function OrgProvider({ components, children, disableParentContext }: Props): JSX.Element;
export type ReactNode = import('react').ReactNode;
export type Components = import('@orgajs/orgx').OrgComponents;
/**
 * Configuration.
 */
export type Props = {
    /**
     * Mapping of names for JSX components to React components.
     */
    components?: Components | MergeComponents | null | undefined;
    /**
     * Turn off outer component context.
     */
    disableParentContext?: boolean | null | undefined;
    /**
     * Children.
     */
    children?: ReactNode | null | undefined;
};
/**
 * Custom merge function.
 */
export type MergeComponents = (currentComponents: Components) => Components;
