import { useEffect, useState } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import InviteTeamMember from '../components/InviteTeamMember'

// Placeholder components for different user roles
const EmployerDashboard = ({ companyId }: { companyId: string }) => (
  <div>
    <h2 className="text-xl font-semibold mb-4">Employer Dashboard</h2>
    <InviteTeamMember companyId={companyId} />
  </div>
)

const AgencyDashboard = ({ companyId }: { companyId: string }) => (
  <div>
    <h2 className="text-xl font-semibold mb-4">Agency Dashboard</h2>
    <InviteTeamMember companyId={companyId} />
  </div>
)

const CandidateDashboard = () => <div>Candidate Dashboard Content</div>

export default function Dashboard() {
  const supabase = useSupabaseClient()
  const user = useUser()
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/auth')
    } else {
      fetchUserRole()
    }
  }, [user])

  const fetchUserRole = async () => {
    try {
      setLoading(true)
      const { data: { user: userData }, error: userError } = await supabase.auth.getUser()
      
      if (userError) throw userError

      let role = userData?.user_metadata?.user_role

      if (!role) {
        const { data, error } = await supabase
          .from('users')
          .select('user_role, company_id')
          .eq('id', user?.id)
          .single()

        if (error) throw error
        role = data.user_role
        setCompanyId(data.company_id)
      }

      if (role) {
        setUserRole(role)
      } else {
        throw new Error('User role not found')
      }
    } catch (error) {
      console.error('Error fetching user role:', error)
      setUserRole(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user || !userRole) {
    return <div>Error: Unable to load user data. Please try signing in again.</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">Welcome to your Dashboard</h1>
          <p className="mb-4">You are logged in as: {user.email}</p>
          <p className="mb-4">Your role: {userRole}</p>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>

        {userRole === 'employer' && companyId && <EmployerDashboard companyId={companyId} />}
        {userRole === 'agency' && companyId && <AgencyDashboard companyId={companyId} />}
        {userRole === 'candidate' && <CandidateDashboard />}
      </div>
    </div>
  )
}