import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { lucario } from "react-syntax-highlighter/dist/esm/styles/prism";
import a11yDark from "react-syntax-highlighter/dist/esm/styles/prism/a11y-dark";
import atomDark from "react-syntax-highlighter/dist/esm/styles/prism/atom-dark";
import base16AteliersulphurpoolLight from "react-syntax-highlighter/dist/esm/styles/prism/base16-ateliersulphurpool.light";
import cb from "react-syntax-highlighter/dist/esm/styles/prism/cb";
import coldarkCold from "react-syntax-highlighter/dist/esm/styles/prism/coldark-cold";
import coldarkDark from "react-syntax-highlighter/dist/esm/styles/prism/coldark-dark";
import coyWithoutShadows from "react-syntax-highlighter/dist/esm/styles/prism/coy-without-shadows";
import coy from "react-syntax-highlighter/dist/esm/styles/prism/coy";
import darcula from "react-syntax-highlighter/dist/esm/styles/prism/darcula";
import dark from "react-syntax-highlighter/dist/esm/styles/prism/dark";
import dracula from "react-syntax-highlighter/dist/esm/styles/prism/dracula";
import duotoneDark from "react-syntax-highlighter/dist/esm/styles/prism/duotone-dark";
import duotoneEarth from "react-syntax-highlighter/dist/esm/styles/prism/duotone-earth";
import duotoneForest from "react-syntax-highlighter/dist/esm/styles/prism/duotone-forest";
import duotoneLight from "react-syntax-highlighter/dist/esm/styles/prism/duotone-light";
import duotoneSea from "react-syntax-highlighter/dist/esm/styles/prism/duotone-sea";
import duotoneSpace from "react-syntax-highlighter/dist/esm/styles/prism/duotone-space";
import funky from "react-syntax-highlighter/dist/esm/styles/prism/funky";
import ghcolors from "react-syntax-highlighter/dist/esm/styles/prism/ghcolors";
import gruvboxDark from "react-syntax-highlighter/dist/esm/styles/prism/gruvbox-dark";
import gruvboxLight from "react-syntax-highlighter/dist/esm/styles/prism/gruvbox-light";
import holiTheme from "react-syntax-highlighter/dist/esm/styles/prism/holi-theme";
import hopscotch from "react-syntax-highlighter/dist/esm/styles/prism/hopscotch";
import materialDark from "react-syntax-highlighter/dist/esm/styles/prism/material-dark";
import materialLight from "react-syntax-highlighter/dist/esm/styles/prism/material-light";
import materialOceanic from "react-syntax-highlighter/dist/esm/styles/prism/material-oceanic";
import nightOwl from "react-syntax-highlighter/dist/esm/styles/prism/night-owl";
import nord from "react-syntax-highlighter/dist/esm/styles/prism/nord";
import okaidia from "react-syntax-highlighter/dist/esm/styles/prism/okaidia";
import oneDark from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";
import oneLight from "react-syntax-highlighter/dist/esm/styles/prism/one-light";
import pojoaque from "react-syntax-highlighter/dist/esm/styles/prism/pojoaque";
import prism from "react-syntax-highlighter/dist/esm/styles/prism/prism";
import shadesOfPurple from "react-syntax-highlighter/dist/esm/styles/prism/shades-of-purple";
import solarizedDarkAtom from "react-syntax-highlighter/dist/esm/styles/prism/solarized-dark-atom";
import solarizedlight from "react-syntax-highlighter/dist/esm/styles/prism/solarizedlight";
import synthwave84 from "react-syntax-highlighter/dist/esm/styles/prism/synthwave84";
import tomorrow from "react-syntax-highlighter/dist/esm/styles/prism/tomorrow";
import twilight from "react-syntax-highlighter/dist/esm/styles/prism/twilight";
import vs from "react-syntax-highlighter/dist/esm/styles/prism/vs";
import vscDarkPlus from "react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus";
import xonokai from "react-syntax-highlighter/dist/esm/styles/prism/xonokai";
import zTouch from "react-syntax-highlighter/dist/esm/styles/prism/z-touch";

// Theme mapping object
const themeMap: { [key: string]: any } = {
  a11yDark,
  atomDark,
  base16AteliersulphurpoolLight,
  cb,
  coldarkCold,
  coldarkDark,
  coyWithoutShadows,
  coy,
  darcula,
  dark,
  dracula,
  duotoneDark,
  duotoneEarth,
  duotoneForest,
  duotoneLight,
  duotoneSea,
  duotoneSpace,
  funky,
  ghcolors,
  gruvboxDark,
  gruvboxLight,
  holiTheme,
  hopscotch,
  lucario,
  materialDark,
  materialLight,
  materialOceanic,
  nightOwl,
  nord,
  okaidia,
  oneDark,
  oneLight,
  pojoaque,
  prism,
  shadesOfPurple,
  solarizedDarkAtom,
  solarizedlight,
  synthwave84,
  tomorrow,
  twilight,
  vs,
  vscDarkPlus,
  xonokai,
  zTouch
};

interface CodeBlockProps {
  className: string;
  children: string;
  theme?: string;
}

const CodeBlock = ({ className, children, theme = 'coldarkCold' }: CodeBlockProps) => {
  const languageMatch = /language-(\w+)/.exec(className || "");
  const language = languageMatch ? languageMatch[1] : "text";

  // Get theme from the mapping
  const selectedTheme = themeMap[theme] || coldarkCold;

  return (
    <SyntaxHighlighter
      language={language}
      style={selectedTheme}
      PreTag="div"
      customStyle={{ borderRadius: "0.5rem", padding: "1rem", fontSize: "0.85rem" }}
    >
      {children}
    </SyntaxHighlighter>
  );
};

export default CodeBlock;
