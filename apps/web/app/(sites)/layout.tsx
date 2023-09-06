import "./styles.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
      </head>
      <body>
        <div id="root" className="zinc-theme"></div>
        {children}
      </body>
    </html>
  )
}
