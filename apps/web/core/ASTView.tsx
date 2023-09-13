import { cn } from "@/lib/utils"

export const ASTView = ({ ast }: { ast: any }) => {
  return (
    <div className="h-full w-full overflow-auto whitespace-pre-wrap rounded-xl border px-4 py-2 text-lg">
      {ast.type === "Program" &&
        ast.body.map((node: any) => {
          return <StatementView node={node} key={node.start} root={true} />
        })}
    </div>
  )
}

export const StatementView = ({ node, root }: { node: any; root?: boolean }) => {
  return (
    <>
      {node.type === "FunctionDeclaration" && (
        <div className="flex cursor-pointer flex-col rounded-xl px-2 py-1 hover:bg-gray-100">
          <div className="flex flex-row">
            {root && <Keyword>component</Keyword>}
            {!root && <Keyword>function</Keyword>}
            <Callable> {node.id.name} </Callable>
            <div className="text-gray-500">
              ({node.params.map((param: any) => param.name).join(", ")})
            </div>
          </div>
          <StatementList>
            {node.body.body.map((node: any) => {
              // Display React.state as: state foo = 0
              if (
                node.type === "VariableDeclaration" &&
                node.declarations[0].init.type === "CallExpression" &&
                node.declarations[0].init.callee.object?.name === "React" &&
                node.declarations[0].init.callee.property?.name === "useState"
              ) {
                return (
                  <div className="flex flex-row">
                    <Keyword className="mr-2">state</Keyword>
                    <div className="text-gray-500">{node.declarations[0].id.elements[0].name}</div>
                    <CodeSymbol className="mx-2">=</CodeSymbol>
                    <ExpressionView node={node.declarations[0].init.arguments[0]} />
                  </div>
                )
              }

              return <StatementView node={node} key={node.start} />
            })}
          </StatementList>
        </div>
      )}
      {node.type === "VariableDeclaration" && (
        <>
          <div className="flex flex-row">
            <Keyword>var</Keyword>
            <div className="text-gray-500"> {node.declarations[0].id.name} </div>
            <div className="text-gray-500">=</div>
            {node.declarations[0].init.type !== "ArrowFunctionExpression" ||
              (node.declarations[0].init.expression && (
                <ExpressionView node={node.declarations[0].init} />
              ))}
          </div>
          <div className="ml-9">
            {node.declarations[0].init.type === "ArrowFunctionExpression" &&
              !node.declarations[0].init.expression && (
                <ExpressionView node={node.declarations[0].init} />
              )}
          </div>
        </>
      )}
      {node.type === "ExpressionStatement" && <ExpressionView node={node.expression} />}
    </>
  )
}

export const ExpressionView = ({ node }: { node: any }) => {
  return (
    <>
      {node.type === "Literal" && <div className="text-gray-500"> {node.value} </div>}
      {node.type === "Identifier" && <div className="text-gray-500"> {node.name} </div>}
      {node.type === "CallExpression" && (
        <div className="flex flex-row">
          <Callable> {node.callee.name} </Callable>
          <div className="text-gray-500"> (</div>
          {node.arguments.map((arg: any) => (
            <ExpressionView node={arg} key={arg.start} />
          ))}
          <div className="text-gray-500">) </div>
        </div>
      )}
      {node.type === "ArrowFunctionExpression" && (
        <>
          <div className="flex flex-row">
            <Keyword>function (</Keyword>
            {node.params.map((param: any) => (
              <ExpressionView node={param} key={param.start} />
            ))}
            <Keyword>)</Keyword>
            {node.expression && <ExpressionView node={node.body} />}
          </div>
          {!node.expression && (
            <StatementList>
              {node.body.body.map((node: any) => (
                <StatementView node={node} key={node.start} />
              ))}
            </StatementList>
          )}
        </>
      )}
      {node.type === "CallExpression" && (
        <div className="flex flex-row">
          <div className="text-gray-500"> {node.callee.name} </div>
          <div className="text-gray-500"> (</div>
          {node.arguments.map((arg: any) => (
            <ExpressionView node={arg} key={arg.start} />
          ))}
          <div className="text-gray-500">) </div>
        </div>
      )}
      {node.type === "MemberExpression" && (
        <div className="flex flex-row">
          <div className="text-gray-500"> {node.object.name} </div>
          <div className="text-gray-500">.</div>
          <div className="text-gray-500"> {node.property.name} </div>
        </div>
      )}
    </>
  )
}

function Callable({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("text-code-callable", className)}>{children}</span>
}

function Keyword({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("text-code-keyword", className)}>{children}</span>
}

function CodeSymbol({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("text-code-symbol", className)}>{children}</span>
}

function StatementList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col border-l border-l-slate-200 pl-9", className)}>
      {children}
    </div>
  )
}
