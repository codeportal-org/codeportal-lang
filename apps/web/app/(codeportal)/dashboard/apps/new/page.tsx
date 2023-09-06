"use client"

import { useNewApp } from "app/api/apps/hooks"
import { NewAppFormData } from "app/api/apps/types"
import { useRouter } from "next/navigation"
import { SubmitHandler, useForm } from "react-hook-form"

import { Button } from "@/components/Button"
import { Input } from "@/components/Input"

import { PageContainer } from "../../PageContainer"

export default function NewAppPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewAppFormData>()

  const router = useRouter()
  const newApp = useNewApp()

  const onSubmit: SubmitHandler<NewAppFormData> = (data) => {
    newApp.trigger(data).then((res) => {
      if (res) {
        router.push(`/dashboard/apps/${res.appId}`)
      }
    })
  }

  console.log("errors", errors)

  return (
    <PageContainer>
      <div className="sm:pl-52">
        <h1 className="mb-10 text-4xl text-gray-800">New app</h1>
        <form className="flex max-w-md flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Input
              placeholder="App name"
              className={errors.name ? "hover:border-alert-500 focus-visible:border-alert-500" : ""}
              {...register("name", { required: "true", minLength: 1, maxLength: 30 })}
            />
            {errors.name && (
              <span className="text-alert-500 m-1">
                {errors.name.type === "required" && "App name is required"}
                {errors.name.type === "minLength" && "App name must be at least 1 character"}
                {errors.name.type === "maxLength" && "App name cannot exceed 30 characters"}
              </span>
            )}
          </div>
          <Button type="submit">Create app</Button>
        </form>
      </div>
    </PageContainer>
  )
}
