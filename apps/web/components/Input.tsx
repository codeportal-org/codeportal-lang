import React from "react"

export type InputProps = {
  ref?: React.Ref<HTMLInputElement>
  value?: string
  className?: string
} & React.InputHTMLAttributes<HTMLInputElement>

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={
          "time w-full rounded-md border border-gray-300 px-4 py-2 transition-colors hover:border-gray-400 focus-visible:border-gray-500" +
          (className ? " " + className : "")
        }
        {...props}
      />
    )
  },
)

Input.displayName = "Input"
