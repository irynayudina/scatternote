import { lazy, Suspense, useState, useEffect } from "react"
import remarkGfm from "remark-gfm"
import CodeBlock from "./CodeBlock"
import InlineCode from "./InlineCode"

// Lazy load ReactMarkdown component
const ReactMarkdown = lazy(() => import("react-markdown"))

// All available themes from react-syntax-highlighter
const availableThemes = [
  { value: 'a11yDark', label: 'A11y Dark' },
  { value: 'atomDark', label: 'Atom Dark' },
  { value: 'base16AteliersulphurpoolLight', label: 'Base16 Ateliersulphurpool Light' },
  { value: 'cb', label: 'CB' },
  { value: 'coldarkCold', label: 'Coldark Cold' },
  { value: 'coldarkDark', label: 'Coldark Dark' },
  { value: 'coyWithoutShadows', label: 'Coy Without Shadows' },
  { value: 'coy', label: 'Coy' },
  { value: 'darcula', label: 'Darcula' },
  { value: 'dark', label: 'Dark' },
  { value: 'dracula', label: 'Dracula' },
  { value: 'duotoneDark', label: 'Duotone Dark' },
  { value: 'duotoneEarth', label: 'Duotone Earth' },
  { value: 'duotoneForest', label: 'Duotone Forest' },
  { value: 'duotoneLight', label: 'Duotone Light' },
  { value: 'duotoneSea', label: 'Duotone Sea' },
  { value: 'duotoneSpace', label: 'Duotone Space' },
  { value: 'funky', label: 'Funky' },
  { value: 'ghcolors', label: 'GitHub Colors' },
  { value: 'gruvboxDark', label: 'Gruvbox Dark' },
  { value: 'gruvboxLight', label: 'Gruvbox Light' },
  { value: 'holiTheme', label: 'Holi Theme' },
  { value: 'hopscotch', label: 'Hopscotch' },
  { value: 'lucario', label: 'Lucario' },
  { value: 'materialDark', label: 'Material Dark' },
  { value: 'materialLight', label: 'Material Light' },
  { value: 'materialOceanic', label: 'Material Oceanic' },
  { value: 'nightOwl', label: 'Night Owl' },
  { value: 'nord', label: 'Nord' },
  { value: 'okaidia', label: 'Okaidia' },
  { value: 'oneDark', label: 'One Dark' },
  { value: 'oneLight', label: 'One Light' },
  { value: 'pojoaque', label: 'Pojoaque' },
  { value: 'prism', label: 'Prism' },
  { value: 'shadesOfPurple', label: 'Shades of Purple' },
  { value: 'solarizedDarkAtom', label: 'Solarized Dark Atom' },
  { value: 'solarizedlight', label: 'Solarized Light' },
  { value: 'synthwave84', label: 'Synthwave84' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'twilight', label: 'Twilight' },
  { value: 'vs', label: 'VS' },
  { value: 'vscDarkPlus', label: 'VS Code Dark Plus' },
  { value: 'xonokai', label: 'Xonokai' },
  { value: 'zTouch', label: 'Z Touch' }
]

interface MarkdownTestComponentProps {
  theme?: string;
  showThemeSelector?: boolean;
  onThemeChange?: (theme: string) => void;
}

const MarkdownTestComponent = ({ 
  theme = 'coldarkCold', 
  showThemeSelector = true, 
  onThemeChange 
}: MarkdownTestComponentProps) => {
  const [selectedTheme, setSelectedTheme] = useState(theme)

  // Update internal state when theme prop changes
  useEffect(() => {
    setSelectedTheme(theme)
  }, [theme])

  const handleThemeChange = (newTheme: string) => {
    setSelectedTheme(newTheme)
    onThemeChange?.(newTheme)
  }

  const testMarkdown = `# Markdown Test Component

This is a **bold text** and this is *italic text*. Here's some normal paragraph text to see how it looks with the prose styling.

## Code Examples

Here's a JavaScript function:

\`\`\`javascript
function greet(name) {
  const message = \`Hello, \${name}!\`;
  console.log(message);
  return message;
}

const user = "World";
const result = greet(user);
\`\`\`

And here's a TypeScript React component (tsx):

\`\`\`tsx
interface UserProps {
  name: string;
  age: number;
  isActive?: boolean;
}

const UserCard: React.FC<UserProps> = ({ name, age, isActive = true }) => {
  const handleClick = () => {
    console.log(\`Clicked on \${name}\`);
  };

  return (
    <div className="user-card" onClick={handleClick}>
      <h3>{name}</h3>
      <p>Age: {age}</p>
      <span className={isActive ? 'active' : 'inactive'}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    </div>
  );
};
\`\`\`

You can also use inline code like \`const x = 42\` or \`console.log("Hello")\`.

## Lists

- First item
- Second item with **bold text**
- Third item with \`inline code\`

1. Numbered item
2. Another numbered item
3. Yet another one

## Links and More

Visit [GitHub](https://github.com) for more information.

> This is a blockquote with some important information.

\`\`\`json
{
  "name": "test",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "typescript": "^4.9.0"
  }
}
\`\`\`
`

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 max-w-4xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Markdown Theme Test</h2>
          <p className="text-gray-600">This component shows how different syntax highlighting themes look with various code examples.</p>
        </div>
        
        {showThemeSelector && (
          <div className="flex items-center gap-2">
            <label htmlFor="theme-select" className="text-sm font-medium text-gray-700">
              Theme:
            </label>
            <select
              id="theme-select"
              value={selectedTheme}
              onChange={(e) => handleThemeChange(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              {availableThemes.map((theme) => (
                <option key={theme.value} value={theme.value}>
                  {theme.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      <div className="prose prose-sm max-w-none">
        <Suspense fallback={<div className="text-gray-500">Loading markdown...</div>}>
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              code: ({ className, children, ...props }: any) => {
                const match = /language-(\w+)/.exec(className || '')
                const isInline = !match
                const language = match ? match[1] : 'text'
                
                return !isInline ? (
                  <CodeBlock className={`language-${language}`} {...props} theme={selectedTheme}>
                    {String(children).replace(/\n$/, '')}
                  </CodeBlock>
                ) : (
                  <InlineCode {...props}>
                    {children}
                  </InlineCode>
                )
              }
            }}
          >
            {testMarkdown}
          </ReactMarkdown>
        </Suspense>
      </div>
    </div>
  )
}

export default MarkdownTestComponent 