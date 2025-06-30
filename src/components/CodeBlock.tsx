import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import Prism from 'prismjs'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-markdown'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-python'
import 'prismjs/themes/prism.css'

interface CodeBlockProps {
  children: ReactNode
  className?: string
}

const CodeBlock = ({ children, className }: CodeBlockProps) => {
  const codeRef = useRef<HTMLElement>(null)

  // Extract language from className (format: "language-javascript")
  const language = className?.replace('language-', '') || 'text'
  const codeContent = String(children).replace(/\n$/, '')

  useEffect(() => {
    if (codeRef.current) {
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        Prism.highlightElement(codeRef.current!)
      }, 0)
    }
  }, [codeContent, language])

  return (
    <pre className="overflow-x-auto mb-1">
      <code
        ref={codeRef}
        className={`language-${language} text-sm`}
      >
        {codeContent}
      </code>
    </pre>
  )
}

export default CodeBlock 