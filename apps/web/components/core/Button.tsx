import classnames from "classnames"
import Link from "next/link"

export type ButtonProps = {
  size?: "sm" | "md" | "lg"
  className?: string
  href?: string
  target?: React.AnchorHTMLAttributes<HTMLAnchorElement>["target"]
  rel?: React.AnchorHTMLAttributes<HTMLAnchorElement>["rel"]
  onClick?: () => void
  children: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export const Button = ({ className, size = "md", href, children, ...props }: ButtonProps) => {
  const classes = classnames("btn-primary", className, {
    "h-12 px-7 text-xl": size === "lg",
    "h-10 px-5 text-lg": size === "md",
    "h-8 px-3 text-base": size === "sm",
  })

  return href ? (
    <Link
      className={classes}
      href={href}
      {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
    >
      {children}
    </Link>
  ) : (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
