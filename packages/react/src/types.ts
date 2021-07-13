import { ComponentType } from 'react'

export interface ComponentsProp {
  /**
   * Mapping of names for JSX components to React components
   */
  components?: ComponentDictionary
  /**
   * Turn off outer component context
   *
   * @defaultValue false
   */
  disableParentContext?: boolean

}

export interface ComponentDictionary {
  [name: string]: ComponentType<any>
}
