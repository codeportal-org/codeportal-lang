"use client"

import { PlusIcon } from "@heroicons/react/24/solid"
import { useGetAppsQuery } from "app/api/apps/hooks"
import { DateTime } from "luxon"

import { Card } from "./Card"
import { PageContainer } from "./PageContainer"

export default function DashboardRoot() {
  const { data, error, isLoading } = useGetAppsQuery()

  return (
    <PageContainer>
      <div className="sm:pl-52">
        <h1 className="mb-10 text-4xl text-gray-800">Applications</h1>
        <div className="flex flex-wrap gap-8">
          <Card className="flex flex-col gap-2" href="/dashboard/apps/new">
            <PlusIcon className="text-primary-500 h-8 w-8" />
            <span className="text-gray-700">Create application</span>
          </Card>
          {error && (
            <Card className="text-red-500">
              There is an error loading the apps, we will solve it soon.
            </Card>
          )}
          {isLoading && <Card className="animate-pulse bg-gray-200 text-lg">Loading...</Card>}
          {!isLoading &&
            !error &&
            data?.map((app) => (
              <Card key={app.id} href={`/dashboard/apps/${app.id}`} className="gap-2">
                <h2 className="text-xl text-gray-700">{app.name}</h2>
                <span className="text-gray-500">{app.id}</span>
                {app.lastOpenedAt && (
                  <span className="text-sm text-gray-500">
                    Last opened at {DateTime.fromISO(app.lastOpenedAt as any).toLocaleString()}
                  </span>
                )}
              </Card>
            ))}
        </div>
      </div>
    </PageContainer>
  )
}
