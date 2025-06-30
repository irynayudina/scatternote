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
import 'prismjs/themes/prism-tomorrow.css'

interface CodeBlockProps {
  children: ReactNode
  className?: string
}

const CodeBlock = ({ children, className }: CodeBlockProps) => {
  const codeRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current)
    }
  }, [children])

  // Extract language from className (format: "language-javascript")
  const language = className?.replace('language-', '') || 'text'

  return (
    <pre className="bg-gray-900 p-4 rounded-md overflow-x-auto mb-3">
      <code
        ref={codeRef}
        className={`language-${language} text-sm`}
      >
        {children}
      </code>
    </pre>
  )
}

export default CodeBlock 