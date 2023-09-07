import css from "styled-jsx/css"

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

// common
import { cva } from "https://esm.sh/class-variance-authority@0.7.0"

${getUtilsImports()}

${getToastImports()}
${getCheckboxImports()}
${additionalImports}

${utils}

${components}
${getToastCode()}
${getCheckboxCode()}

function App() {${completion}

function reserved__ROOT_APP() {
  return html\`
    <div className="w-full h-full">
      <\${App} />
      <\${Toaster} />
    </div>
  \`
}

ReactDOM.createRoot(document.getElementById('root')).render(html\`<\${reserved__ROOT_APP} />\`);
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
  return `import { Slot } from "https://esm.sh/@radix-ui/react-slot@1.0.2"`
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

export function getTailwindConfigCode() {
  return `window.tailwind.config = {
  darkMode: ["class"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: \`var(--radius)\`,
        md: \`calc(var(--radius) - 2px)\`,
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
}`
}

function getToastImports() {
  return `import * as ToastPrimitives from "https://esm.sh/@radix-ui/react-toast@1.1.4"
import { X } from "https://esm.sh/lucide-react@0.274.0"`
}

function getToastCode() {
  return `
// import { useToast } from "@/components/ui/use-toast"
const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

const toastTimeouts = new Map()

const addToRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners = []

let memoryState = { toasts: [] }

function dispatch(action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

function toast({ ...props }) {
  const id = genId()

  const update = (props) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

//--

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
  html\`<\${ToastPrimitives.Viewport}
    ref=\${ref}
    className=\${cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    ...\${props}
  />\`
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
  return (
    html\`<\${ToastPrimitives.Root}
      ref=\${ref}
      className=\${cn(toastVariants({ variant }), className)}
      ...\${props}
    />\`
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
  html\`<\${ToastPrimitives.Action}
    ref=\${ref}
    className=\${cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    ...\${props}
  />\`
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  html\`<\${ToastPrimitives.Close}
    ref=\${ref}
    className=\${cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    )}
    toast-close=""
    ...\${props}
  >
    <\${X} className="h-4 w-4" />
  <//>\`
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  html\`<\${ToastPrimitives.Title}
    ref=\${ref}
    className=\${cn("text-sm font-semibold", className)}
    ...\${props}
  />\`
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  html\`<\${ToastPrimitives.Description}
    ref=\${ref}
    className=\${cn("text-sm opacity-90", className)}
    ...\${props}
  />\`
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

function Toaster() {
  const { toasts } = useToast()

  const toastEls = toasts.map(function ({ id, title, description, action, ...props }) {
    return (
      html\`<\${Toast} key=\${id} ...\${props}>
        <div className="grid gap-1">
          \${title && html\`<\${ToastTitle}>\${title}<//>\`}
          \${description && (
            html\`<\${ToastDescription}>\${description}<//>\`
          )}
        </div>
        \${action}
        <\${ToastClose} />
      <//>\`
    )
  })

  return (
    html\`<\${ToastProvider}>
      \${toastEls}
      <\${ToastViewport} />
    <//>\`
  )
}`
}

function getCheckboxImports() {
  return `import * as CheckboxPrimitive from "https://esm.sh/@radix-ui/react-checkbox@1.0.4"
import { Check } from "https://esm.sh/lucide-react@0.274.0"`
}

function getCheckboxCode() {
  return `const Checkbox = React.forwardRef(({ className, ...props }, ref) => (
    html\`<\${CheckboxPrimitive.Root}
      ref=\${ref}
      className=\${cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        className
      )}
      ...\${props}
    >
      <\${CheckboxPrimitive.Indicator}
        className=\${cn("flex items-center justify-center text-current")}
      >
        <\${Check} className="h-4 w-4" />
      <//>
    <//>\`
  ))
  Checkbox.displayName = CheckboxPrimitive.Root.displayName`
}

export type ThemeColor = "zinc" | "blue" | "green" | "orange"

export function getStyles(theme: { color?: ThemeColor; radius?: string }) {
  let themeClass: any

  const color = theme?.color || "zinc"

  if (color === "zinc") {
    themeClass = css.global`
      .zinc-theme {
        --background: 0 0% 100%;
        --foreground: 240 10% 3.9%;
        --card: 0 0% 100%;
        --card-foreground: 240 10% 3.9%;
        --popover: 0 0% 100%;
        --popover-foreground: 240 10% 3.9%;
        --primary: 240 5.9% 10%;
        --primary-foreground: 0 0% 98%;
        --secondary: 240 4.8% 95.9%;
        --secondary-foreground: 240 5.9% 10%;
        --muted: 240 4.8% 95.9%;
        --muted-foreground: 240 3.8% 46.1%;
        --accent: 240 4.8% 95.9%;
        --accent-foreground: 240 5.9% 10%;
        --destructive: 0 84.2% 60.2%;
        --destructive-foreground: 0 0% 98%;
        --border: 240 5.9% 90%;
        --input: 240 5.9% 90%;
        --ring: 240 5.9% 10%;
        --radius: 0.75rem;
      }

      .zinc-theme.dark {
        --background: 240 10% 3.9%;
        --foreground: 0 0% 98%;
        --card: 240 10% 3.9%;
        --card-foreground: 0 0% 98%;
        --popover: 240 10% 3.9%;
        --popover-foreground: 0 0% 98%;
        --primary: 0 0% 98%;
        --primary-foreground: 240 5.9% 10%;
        --secondary: 240 3.7% 15.9%;
        --secondary-foreground: 0 0% 98%;
        --muted: 240 3.7% 15.9%;
        --muted-foreground: 240 5% 64.9%;
        --accent: 240 3.7% 15.9%;
        --accent-foreground: 0 0% 98%;
        --destructive: 0 62.8% 30.6%;
        --destructive-foreground: 0 0% 98%;
        --border: 240 3.7% 15.9%;
        --input: 240 3.7% 15.9%;
        --ring: 240 4.9% 83.9%;
      }
    `
  }

  if (color === "blue") {
    themeClass = css.global`
      .blue-theme {
        --background: 0 0% 100%;
        --foreground: 222.2 84% 4.9%;
        --card: 0 0% 100%;
        --card-foreground: 222.2 84% 4.9%;
        --popover: 0 0% 100%;
        --popover-foreground: 222.2 84% 4.9%;
        --primary: 221.2 83.2% 53.3%;
        --primary-foreground: 210 40% 98%;
        --secondary: 210 40% 96.1%;
        --secondary-foreground: 222.2 47.4% 11.2%;
        --muted: 210 40% 96.1%;
        --muted-foreground: 215.4 16.3% 46.9%;
        --accent: 210 40% 96.1%;
        --accent-foreground: 222.2 47.4% 11.2%;
        --destructive: 0 84.2% 60.2%;
        --destructive-foreground: 210 40% 98%;
        --border: 214.3 31.8% 91.4%;
        --input: 214.3 31.8% 91.4%;
        --ring: 221.2 83.2% 53.3%;
        --radius: 0.75rem;
      }

      .blue-theme.dark {
        --background: 222.2 84% 4.9%;
        --foreground: 210 40% 98%;
        --card: 222.2 84% 4.9%;
        --card-foreground: 210 40% 98%;
        --popover: 222.2 84% 4.9%;
        --popover-foreground: 210 40% 98%;
        --primary: 217.2 91.2% 59.8%;
        --primary-foreground: 222.2 47.4% 11.2%;
        --secondary: 217.2 32.6% 17.5%;
        --secondary-foreground: 210 40% 98%;
        --muted: 217.2 32.6% 17.5%;
        --muted-foreground: 215 20.2% 65.1%;
        --accent: 217.2 32.6% 17.5%;
        --accent-foreground: 210 40% 98%;
        --destructive: 0 62.8% 30.6%;
        --destructive-foreground: 210 40% 98%;
        --border: 217.2 32.6% 17.5%;
        --input: 217.2 32.6% 17.5%;
        --ring: 224.3 76.3% 48%;
      }
    `
  }

  if (color === "green") {
    themeClass = css.global`
      .green-theme {
        --background: 0 0% 100%;
        --foreground: 240 10% 3.9%;
        --card: 0 0% 100%;
        --card-foreground: 240 10% 3.9%;
        --popover: 0 0% 100%;
        --popover-foreground: 240 10% 3.9%;
        --primary: 142.1 76.2% 36.3%;
        --primary-foreground: 355.7 100% 97.3%;
        --secondary: 240 4.8% 95.9%;
        --secondary-foreground: 240 5.9% 10%;
        --muted: 240 4.8% 95.9%;
        --muted-foreground: 240 3.8% 46.1%;
        --accent: 240 4.8% 95.9%;
        --accent-foreground: 240 5.9% 10%;
        --destructive: 0 84.2% 60.2%;
        --destructive-foreground: 0 0% 98%;
        --border: 240 5.9% 90%;
        --input: 240 5.9% 90%;
        --ring: 142.1 76.2% 36.3%;
        --radius: 0.75rem;
      }

      .green-theme.dark {
        --background: 20 14.3% 4.1%;
        --foreground: 0 0% 95%;
        --card: 24 9.8% 10%;
        --card-foreground: 0 0% 95%;
        --popover: 0 0% 9%;
        --popover-foreground: 0 0% 95%;
        --primary: 142.1 70.6% 45.3%;
        --primary-foreground: 144.9 80.4% 10%;
        --secondary: 240 3.7% 15.9%;
        --secondary-foreground: 0 0% 98%;
        --muted: 0 0% 15%;
        --muted-foreground: 240 5% 64.9%;
        --accent: 12 6.5% 15.1%;
        --accent-foreground: 0 0% 98%;
        --destructive: 0 62.8% 30.6%;
        --destructive-foreground: 0 85.7% 97.3%;
        --border: 240 3.7% 15.9%;
        --input: 240 3.7% 15.9%;
        --ring: 142.4 71.8% 29.2%;
      }
    `
  }

  if (color === "orange") {
    themeClass = css.global`
      .orange-theme {
        --background: 0 0% 100%;
        --foreground: 20 14.3% 4.1%;
        --card: 0 0% 100%;
        --card-foreground: 20 14.3% 4.1%;
        --popover: 0 0% 100%;
        --popover-foreground: 20 14.3% 4.1%;
        --primary: 24.6 95% 53.1%;
        --primary-foreground: 60 9.1% 97.8%;
        --secondary: 60 4.8% 95.9%;
        --secondary-foreground: 24 9.8% 10%;
        --muted: 60 4.8% 95.9%;
        --muted-foreground: 25 5.3% 44.7%;
        --accent: 60 4.8% 95.9%;
        --accent-foreground: 24 9.8% 10%;
        --destructive: 0 84.2% 60.2%;
        --destructive-foreground: 60 9.1% 97.8%;
        --border: 20 5.9% 90%;
        --input: 20 5.9% 90%;
        --ring: 24.6 95% 53.1%;
        --radius: 0.75rem;
      }

      .orange-theme.dark {
        --background: 20 14.3% 4.1%;
        --foreground: 60 9.1% 97.8%;
        --card: 20 14.3% 4.1%;
        --card-foreground: 60 9.1% 97.8%;
        --popover: 20 14.3% 4.1%;
        --popover-foreground: 60 9.1% 97.8%;
        --primary: 20.5 90.2% 48.2%;
        --primary-foreground: 60 9.1% 97.8%;
        --secondary: 12 6.5% 15.1%;
        --secondary-foreground: 60 9.1% 97.8%;
        --muted: 12 6.5% 15.1%;
        --muted-foreground: 24 5.4% 63.9%;
        --accent: 12 6.5% 15.1%;
        --accent-foreground: 60 9.1% 97.8%;
        --destructive: 0 72.2% 50.6%;
        --destructive-foreground: 60 9.1% 97.8%;
        --border: 12 6.5% 15.1%;
        --input: 12 6.5% 15.1%;
        --ring: 20.5 90.2% 48.2%;
      }
    `
  }

  return css.global`
    ${themeClass}

    #root {
      --radius: ${theme?.radius || "0.75rem"};
    }
  `
}
