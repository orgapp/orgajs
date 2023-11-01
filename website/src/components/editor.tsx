import { EditorView } from '@codemirror/view'
import { makeEditor, type EditorConfig } from '@orgajs/editor'
import { forwardRef, useEffect, useRef, useState } from 'react'
import { useMergeRefs } from '../utils/merge-refs'
import { setEditor } from './global'

const OrgEditor = forwardRef<HTMLDivElement, Partial<EditorConfig>>(
  ({ content, onChange, ...props }, ref) => {
    const innerRef = useRef<HTMLDivElement>(null)
    const mergedRef = useMergeRefs(ref, innerRef)
    const [editorView, setEditorView] = useState<EditorView | null>(null)

    useEffect(() => {
      if (innerRef.current) {
        const { editor } = makeEditor({
          target: innerRef.current,
          content: content,
          onChange,
        })
        setEditorView(editor)
        setEditor(editor)
      }
    }, [innerRef])

    return <div ref={mergedRef} {...props} />
  }
)

OrgEditor.displayName = 'OrgEditor'
export default OrgEditor
