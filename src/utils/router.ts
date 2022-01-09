import { useEffect } from "react"
import { Location, NavigateOptions, To, useLocation, useNavigate } from "react-router-dom"
import { useBind } from "./hooks"

export function useLocationChanged(onChange: (location: Location) => void) {
    const location = useLocation()

    useEffect(() => {
        onChange(location)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location])
}

export function useNavigateTo(to: To, options?: NavigateOptions) {
    const navigate = useNavigate() as (to: To, options?: NavigateOptions) => void
    return useBind(navigate, to, options)
}