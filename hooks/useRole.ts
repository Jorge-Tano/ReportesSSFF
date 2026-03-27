// hooks/useRole.ts
import { useSession } from 'next-auth/react'

export function useRole() {
  const { data: session, status } = useSession()
  
  const isAdmin = session?.user?.role === 'administrador'
  const isUser = session?.user?.role === 'usuario'
  
  return {
    isAdmin,
    isUser,
    role: session?.user?.role,
    isLoading: status === 'loading',
  }
}