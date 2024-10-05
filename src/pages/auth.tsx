import { useState, useEffect } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import PersonalProfileForm from '../components/PersonalProfileForm'
import CompanyProfileForm from '../components/CompanyProfileForm'

export default function AuthPage() {
  const supabase = useSupabaseClient()
  const user = useUser()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>('candidate')
  const [registrationStep, setRegistrationStep] = useState<number>(1)

  useEffect(() => {
    if (user) {
      checkProfileCompletion()
    }
  }, [user])

  const checkProfileCompletion = async () => {
    if (user) {
      const { data: profile, error } = await supabase
        .from('users')
        .select('personal_profile_completed, company_profile_completed')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error checking profile completion:', error)
        return
      }

      if (!profile.personal_profile_completed) {
        setRegistrationStep(2)
      } else if (!profile.company_profile_completed && (userRole === 'employer' || userRole === 'agency')) {
        setRegistrationStep(3)
      } else {
        router.push('/dashboard')
      }
    }
  }

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_role: userRole,
        },
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setRegistrationStep(2)
    }
  }

  const handlePersonalProfileSubmit = async (personalData: any) => {
    if (user) {
      const { error } = await supabase
        .from('users')
        .update({ 
          ...personalData, 
          personal_profile_completed: true 
        })
        .eq('id', user.id)

      if (error) {
        setError(error.message)
      } else {
        if (userRole === 'employer' || userRole === 'agency') {
          setRegistrationStep(3)
        } else {
          router.push('/dashboard')
        }
      }
    }
  }

  const handleCompanyProfileSubmit = async (companyData: any) => {
    if (user) {
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({ ...companyData, owner_id: user.id })
        .select()
        .single()

      if (companyError) {
        setError(companyError.message)
        return
      }

      const { error: userError } = await supabase
        .from('users')
        .update({ 
          company_id: company.id,
          company_profile_completed: true 
        })
        .eq('id', user.id)

      if (userError) {
        setError(userError.message)
      } else {
        router.push('/dashboard')
      }
    }
  }

  if (registrationStep === 1) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-6 text-center">
            {router.query.action === 'signup' ? 'Sign Up' : 'Sign In'}
          </h1>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {router.query.action === 'signup' ? (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label htmlFor="user_role" className="block text-sm font-medium text-gray-700">
                  User Role
                </label>
                <select
                  id="user_role"
                  name="user_role"
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  <option value="candidate">Candidate</option>
                  <option value="employer">Employer</option>
                  <option value="agency">Agency</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign Up
              </button>
            </form>
          ) : (
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              theme="dark"
              providers={['google', 'github']}
              onError={(error) => setError(error.message)}
              redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
            />
          )}
        </div>
      </div>
    )
  }

  if (registrationStep === 2) {
    return <PersonalProfileForm onSubmit={handlePersonalProfileSubmit} />
  }

  if (registrationStep === 3) {
    return <CompanyProfileForm onSubmit={handleCompanyProfileSubmit} userRole={userRole} />
  }

  return null
}