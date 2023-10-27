import autoprefixer from "autoprefixer"
import postcss from "postcss"
import tailwindcss, { Config } from "tailwindcss"

import { VIRTUAL_HTML_FILENAME, VIRTUAL_SOURCE_PATH } from "../../polyfill/constants"

// just importing tailwind causes error

/**
 * @param {string} cssInput - tailwind css file with directives and optional custom styles
 * @param {string} htmlInput - HTML DOM markup to parse for Tailwind class names
 * @param {object} [options]
 */
export async function compileTailwindCSS(
  cssInput: string,
  htmlInput: string,
  {
    config = {} as any,
    plugins = [autoprefixer()],
  }: {
    config?: Config
    plugins?: any[]
  } = {},
) {
  // Tailwind scans the config.content for files to parse classNames -> set a virtual file here
  if (!config.content) {
    ;(self as any)[VIRTUAL_HTML_FILENAME] = htmlInput
    config.content = [VIRTUAL_HTML_FILENAME]
  }

  return await postcss([tailwindcss(config), formatNodes, ...plugins])
    .process(cssInput, {
      from: VIRTUAL_SOURCE_PATH,
    })
    .then((result) => result.css)
}

// https://github.com/tailwindlabs/tailwindcss/blob/315e3a2445d682b2da9ca93fda77252fe32879ff/src/cli.js#L26-L42
function formatNodes(root: any) {
  indentRecursive(root)
  if (root.first) {
    root.first.raws.before = ""
  }
}

function indentRecursive(node: any, indent = 0) {
  node.each &&
    node.each((child: any, i: number) => {
      if (!child.raws.before || !child.raws.before.trim() || child.raws.before.includes("\n")) {
        child.raws.before = `\n${node.type !== "rule" && i > 0 ? "\n" : ""}${"  ".repeat(indent)}`
      }
      child.raws.after = `\n${"  ".repeat(indent)}`
      indentRecursive(child, indent + 1)
    })
}

const memoizedCSS = new Map<string, string>()

export const memoizedCompileTailwindCSS = async (styles: string) => {
  if (memoizedCSS.has(styles)) {
    return Promise.resolve(memoizedCSS.get(styles)!)
  }

  const start = Date.now()
  const css = await compileTailwindCSS(baseCSS, styles)
  const end = Date.now()
  console.log(`Time taken to compile TailwindCSS: ${end - start}ms`)

  memoizedCSS.set(styles, css)

  return css
}

const baseCSS = `
/* Compiled CSS */
@tailwind base;
@tailwind components;
@tailwind utilities;
@layer base {}
`
