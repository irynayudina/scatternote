import type { ReactNode } from 'react'

interface InlineCodeProps {
  children: ReactNode
}

const InlineCode = ({ children }: InlineCodeProps) => {
  return (
    <code className="text-pink-600 px-2 py-1 rounded text-sm font-mono border border-gray-200">
      {children}
    </code>
  )
}

export default InlineCode 