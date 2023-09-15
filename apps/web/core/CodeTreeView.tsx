import { Square, Text } from "lucide-react"

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
        <div className="flex cursor-pointer flex-col rounded-xl px-2 py-1">
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
        <div className="flex cursor-pointer flex-col rounded-xl px-2 py-1">
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
        <div className="flex flex-row gap-1.5">
          <Keyword>var</Keyword>
          <CodeName>{node.name}</CodeName>
          <CodeSymbol>=</CodeSymbol>

          <ExpressionView node={node.value} />
        </div>
      )}
      {/* {node.type === "expression" && <ExpressionView node={node.expression} />} */}
      {node.type === "return" && (
        <div className="flex flex-row gap-1.5">
          <Keyword>return</Keyword>
          <ExpressionView node={node.arg} />
        </div>
      )}
    </>
  )
}

export const ExpressionView = ({ node }: { node: Expression }) => {
  if (!node) return null

  return (
    <>
      {node.type === "string" && <div className="text-code-string"> {node.value} </div>}
      {node.type === "number" && <div className="text-code-number"> {node.value} </div>}
      {node.type === "boolean" && <div className="text-code-boolean"> {node.value} </div>}
      {node.type === "ref" && <CodeName>{node.name}</CodeName>}
      {node.type === "ui text" && node.text}
      {node.type === "ui element" && (
        <div className="flex flex-col">
          <div className="text-code-ui-element-name flex items-center gap-1.5">
            {node.name === "div" ? (
              <>
                <Square size={16} className="text-code-name" />
                Box
              </>
            ) : node.name === "p" ? (
              <>
                <Text size={16} className="text-code-name" />
                Text
              </>
            ) : node.name === "h1" ? (
              <>
                <div className="text-code-ui-element-name">Heading 1</div>
              </>
            ) : node.name === "h2" ? (
              <>
                <div className="text-code-ui-element-name">Heading 2</div>
              </>
            ) : (
              node.name
            )}
            <div className="text-gray-500">
              {/* ({node.props.map((param: any) => param.name).join(", ")}) */}
            </div>
          </div>
          {node.children && (
            <div className="flex flex-col gap-1.5 pl-9">
              {node.children.map((node, idx) => {
                return <ExpressionView node={node} key={idx} />
              })}
            </div>
          )}
        </div>
      )}
      {node.type === "ui expression" && (
        <div className="flex flex-row gap-1.5">
          {"{"}
          <ExpressionView node={node.expression} />
          {"}"}
        </div>
      )}
    </>
  )
}

function CodeName({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("text-code-name", className)}>{children}</span>
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
