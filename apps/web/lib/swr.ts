import { useAuth } from "@clerk/nextjs"
import useSWR from "swr"
import useSWRMutation from "swr/mutation"

export function useClerkSWR<T>(url: string) {
  const { getToken } = useAuth()

  const fetcher = async (url: string) => {
    return fetch(url, {
      headers: { Authorization: `Bearer ${await getToken()}` },
    }).then((res) => res.json())
  }

  return useSWR<T>(url, fetcher)
}

export function useClerkSWRMutation<T, K>(url: string) {
  const { getToken } = useAuth()

  const mutate = async (url: string, { arg }: { arg: K }) => {
    return fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${await getToken()}` },
      body: JSON.stringify(arg),
    }).then((res) => res.json())
  }

  return useSWRMutation<T, any, any, K>(url, mutate)
}
