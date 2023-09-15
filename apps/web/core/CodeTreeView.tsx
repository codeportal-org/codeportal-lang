import { cn } from "@/lib/utils"

import { Expression, ProgramNode, StatementNode } from "./interpreter"

export const CodeTreeView = ({ codeTree }: { codeTree: ProgramNode }) => {
  return (
    <div className="h-full w-full overflow-auto whitespace-pre-wrap rounded-xl border px-4 py-2">
      {codeTree.type === "program" &&
        codeTree.body.map((node, idx) => {
          return <StatementView node={node} key={idx} />
        })}
    </div>
  )
}

export const StatementView = ({ node }: { node: StatementNode }) => {
  if (!node) return null

  return (
    <>
      {node.type === "component" && (
        <div className="flex cursor-pointer flex-col rounded-xl px-2 py-1 hover:bg-gray-100">
          <div className="flex flex-row">
            <Keyword>component</Keyword>
            <Callable> {node.name} </Callable>
            <div className="text-gray-500">
              {/* ({node.props.map((param: any) => param.name).join(", ")}) */}
            </div>
          </div>
          <StatementList>
            {node.body.map((node, idx) => {
              return <StatementView node={node} key={idx} />
            })}
          </StatementList>
        </div>
      )}
      {node.type === "function" && (
        <div className="flex cursor-pointer flex-col rounded-xl px-2 py-1 hover:bg-gray-100">
          <div className="flex flex-row">
            <Keyword>fun</Keyword>
            <Callable> {node.name} </Callable>
            <div className="text-gray-500">
              {/* ({node.props.map((param: any) => param.name).join(", ")}) */}
            </div>
          </div>
          <StatementList>
            {node.body.map((node, idx) => {
              return <StatementView node={node} key={idx} />
            })}
          </StatementList>
        </div>
      )}
      {node.type === "var" && (
        <div className="flex flex-row">
          <Keyword>var</Keyword>
          <div className="text-gray-500"> {node.name} </div>
          <div className="text-gray-500">=</div>

          <ExpressionView node={node.value} />
        </div>
      )}
      {/* {node.type === "expression" && <ExpressionView node={node.expression} />} */}
    </>
  )
}

export const ExpressionView = ({ node }: { node: Expression }) => {
  if (!node) return null

  return (
    <>
      {node.type === "string" && <div className="text-gray-500"> {node.value} </div>}
      {node.type === "number" && <div className="text-gray-500"> {node.value} </div>}
      {node.type === "boolean" && <div className="text-gray-500"> {node.value} </div>}
      {/* {node.type === "Identifier" && <div className="text-gray-500"> {node.name} </div>} */}
      {/* {node.type === "CallExpression" && (
        <div className="flex flex-row">
          <Callable> {node.callee.name} </Callable>
          <div className="text-gray-500"> (</div>
          {node.arguments.map((arg: any) => (
            <ExpressionView node={arg} key={arg.start} />
          ))}
          <div className="text-gray-500">) </div>
        </div>
      )} */}
      {/* {node.type === "ArrowFunctionExpression" && (
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
      )} */}
      {/* {node.type === "CallExpression" && (
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
      )} */}
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
