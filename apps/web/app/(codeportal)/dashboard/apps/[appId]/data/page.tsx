"use client"

import { useGetAppData } from "app/api/apps/[appId]/data/hooks"

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function DataPage({ params }: { params: { appId: string } }) {
  const appData = useGetAppData(params.appId)

  if (appData.isLoading) {
    return (
      <div className="p-10">
        <div>Loading ...</div>
      </div>
    )
  }

  if (!appData.data) {
    return (
      <div className="p-10">
        <div>No data found.</div>
      </div>
    )
  }

  if (!appData.data.entries[0]) {
    return (
      <div className="p-10">
        <div>No data found.</div>
      </div>
    )
  }

  let columnsDict: Record<string, boolean> = {}
  appData.data.entries.forEach((entry) => {
    Object.keys(entry).forEach((key) => {
      columnsDict[key] = true
    })
  })
  columnsDict["id"] = false

  const columns = ["id", ...Object.keys(columnsDict).filter((key) => columnsDict[key])]

  return (
    <div className="mx-auto p-10 lg:max-w-7xl">
      <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
        Database
      </h2>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column}>{column}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {appData.data.entries.map((entry) => (
            <TableRow key={entry.id}>
              {columns.map((column) => (
                <TableCell key={column}>{JSON.stringify(entry[column])}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
