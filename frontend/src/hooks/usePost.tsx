import { useState, useCallback } from "react"
import { useSession } from "./useSession"

import fetchApi from "@/api/fetchApi"



export interface usePostInterface {
  url: string
  body?: any
  method?: any
  hasFiles?: boolean
  qs?: any
}


export const usePost = () => {
  const { user, clearUser } = useSession()
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  const execute = useCallback(async ({
    url = "",
    body,
    method = "post",
    hasFiles = false,
    qs = {},
  }: usePostInterface) => {
    const abortController = new AbortController()
    const signal = abortController.signal
    let res, data, errors
    setLoading(true)

    try {
      res = await fetchApi[method]({
        url,
        body,
        headers: {},
        hasFiles,
        token: user?.token,
        qs,
        signal,
      })
      data = await res.json()

      if (!res.ok) {
        throw res
      }

      if (data.status === 401) {
        clearUser()
        return
      }

      if (!signal.aborted) {
        setResponse(data)
        setError(null)
      }
    } catch (error) {
      console.log("🚀 > usePost.tsx:63 > execute > error:", error);
      if (!signal.aborted) {
        setResponse(null)
        setError(error)
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false)
      }
    }

    return {
      ...data,
      res,
      errors
    }
  }, [user?.token, clearUser])

  return {
    execute,
    response,
    loading,
    error
  }
}


