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

  const data = appData.data.entries[0].data || {}
  const columns = Object.keys(data)
  //   const cell = appData.data && appData.data.entries

  return (
    <div className="p-10">
      <Table>
        <TableCaption>Your apps data.</TableCaption>
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
              {Object.entries(entry.data || {}).map(([key, value]) => (
                <TableCell key={key}>{JSON.stringify(value)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
