import { useSelector } from 'react-redux'
import type { RootState } from '../store'
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

type PrivateRouteProps = {
    children: ReactNode
  }
  
  const PrivateRoute = ({ children }: PrivateRouteProps) => {
    const token = useSelector((state: RootState) => state.auth.token)
    return token ? children : <Navigate to="/login" />
  }

export default PrivateRoute