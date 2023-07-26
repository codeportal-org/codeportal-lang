const ts = require("typescript")
const fs = require("fs")
const path = require("path")

function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach((file) => {
    const dirFile = path.join(dir, file)
    const dirent = fs.statSync(dirFile)

    if (dirent.isDirectory() && !dirFile.includes("node_modules") && !dirFile.includes(".next")) {
      filelist = walkSync(dirFile, filelist)
    } else if (
      path.extname(dirFile) === ".ts" ||
      path.extname(dirFile) === ".tsx" ||
      path.extname(dirFile) === ".js" ||
      path.extname(dirFile) === ".jsx"
    ) {
      // Only include *.ts or *.tsx files
      filelist = filelist.concat(dirFile)
    }
  })

  return filelist
}

function traverse(node, callback) {
  callback(node)
  ts.forEachChild(node, (child) => traverse(child, callback))
}

// const dirPath =
//   "/Users/carlosgalarza/Projects/ast-measures/conduit-realworld-example-app-react-express"
// const dirPath = "/Users/carlosgalarza/Projects/ast-measures/next-real-world-next-ts-apollo"
// const dirPath = "/Users/carlosgalarza/Projects/ast-measures/redwood-realworld-example-app"
const dirPath = "./"
// const dirPath = "/Users/carlosgalarza/Projects/ast-measures/cal.com/apps/"
// const dirPath = "/Users/carlosgalarza/Projects/ast-measures/cal.com/"

let count = 0
const fileList = walkSync(dirPath)

fileList.forEach((filePath) => {
  const fileContent = fs.readFileSync(filePath, "utf8")
  console.log("Parsing file:", filePath)
  const sourceFile = ts.createSourceFile(
    filePath,
    fileContent,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )
  let fileCount = 0
  traverse(sourceFile, (...args) => {
    fileCount++
  })
  console.log("Number of AST nodes:", fileCount)
  count += fileCount
})

console.log("Total number of AST nodes:", count)
