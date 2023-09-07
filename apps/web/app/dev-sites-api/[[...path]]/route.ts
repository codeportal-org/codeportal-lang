import * as SitesAPI from "app/sites-api/[[...path]]/route"

type RequestArgs = {
  params: { path: string[] }
}

export async function GET(req: Request, reqArgs: RequestArgs) {
  return SitesAPI.GET(req, patchRequestArgs(reqArgs))
}

export async function POST(req: Request, reqArgs: RequestArgs) {
  return SitesAPI.POST(req, patchRequestArgs(reqArgs))
}

export async function DELETE(req: Request, reqArgs: RequestArgs) {
  return SitesAPI.DELETE(req, patchRequestArgs(reqArgs))
}

export async function PUT(req: Request, reqArgs: RequestArgs) {
  return SitesAPI.PUT(req, patchRequestArgs(reqArgs))
}

export async function PATCH(req: Request, reqArgs: RequestArgs) {
  return SitesAPI.PATCH(req, patchRequestArgs(reqArgs))
}

function patchRequestArgs(reqArgs: RequestArgs): RequestArgs {
  const newPath = [...reqArgs.params.path]
  if (newPath[0]) {
    newPath[0] = newPath[0].replace("dev-", "")
  }

  return { params: { path: newPath } }
}
