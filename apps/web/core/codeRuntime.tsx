export function buildFullCode(completion: string) {
  const processedCompletion = completion.trim().split("\n").slice(1, -1).join("\n")

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"
          rel="stylesheet"
        />
        <title>My app</title>
      </head>
      <body>
        <div id="root"></div>

        <script type="module">
          ${buildCode(processedCompletion)}
        </script>
      </body>
    </html>
    `
}

export const buildCode = (completion: string) => {
  return `
import { html } from "https://esm.sh/htm@3.1.1/react"
import * as react from "https://esm.sh/react@18.2.0"
import * as ReactDOM from "https://esm.sh/react-dom@18.2.0/client"

${completion}
`
}
