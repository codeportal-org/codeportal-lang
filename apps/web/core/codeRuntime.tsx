export function buildFullCode(completion: string) {
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
          ${buildCode(completion)}
        </script>
      </body>
    </html>
    `
}

export const buildCode = (completion: string) => {
  let additionalImports = ""
  let components = ""

  let utils = getUtils()

  if (completion.includes("<${Button}")) {
    additionalImports += getButtonImports()
    components += getButtonCode() + "\n\n"
  }

  if (completion.includes("<${Input}")) {
    components += getInputCode() + "\n\n"
  }

  return `
import { html } from "https://esm.sh/htm@3.1.1/react"
import * as React from "https://esm.sh/react@18.2.0"
import * as ReactDOM from "https://esm.sh/react-dom@18.2.0/client"

${getUtilsImports()}

${additionalImports}

${utils}

${components}

${completion}
`
}

function getUtilsImports() {
  return `import { clsx } from "https://esm.sh/clsx@2.0.0"
import { twMerge } from "https://esm.sh/tailwind-merge@1.14.0"`
}

function getUtils() {
  return `function cn(...inputs) {
  return twMerge(clsx(inputs))
}`
}

function getButtonImports() {
  return `import { Slot } from "https://esm.sh/@radix-ui/react-slot@1.0.2"
import { cva } from "https://esm.sh/class-variance-authority@0.7.0"`
}

function getButtonCode() {
  return `const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      html\`<\${Comp} className=\${cn(buttonVariants({ variant, size, className }))} ref=\${ref} ...\${props} />\`
    )
  },
)
Button.displayName = "Button"`
}

function getInputCode() {
  return `const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => {
    return (
      html\`<input
        type={type}
        className=\${cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref=\${ref}
        ...\${props}
      />\`
    )
  }
)
Input.displayName = "Input"`
}
