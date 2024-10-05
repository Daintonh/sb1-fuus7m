import { useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

interface InviteTeamMemberProps {
  companyId: string
}

export default function InviteTeamMember({ companyId }: InviteTeamMemberProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const [message, setMessage] = useState('')
  const supabase = useSupabaseClient()

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    try {
      // In a real-world scenario, you'd send an email invitation here
      // For this example, we'll just create a new user and associate them with the company
      const { data, error } = await supabase.auth.signUp({
        email,
        password: 'temporarypassword', // In reality, you'd generate a random password or use a different flow
        options: {
          data: {
            company_id: companyId,
            user_role: role,
          },
        },
      })

      if (error) throw error

      // Update the users table
      const { error: updateError } = await supabase
        .from('users')
        .update({ company_id: companyId, user_role: role })
        .eq('id', data.user?.id)

      if (updateError) throw updateError

      setMessage('Invitation sent successfully!')
      setEmail('')
      setRole('member')
    } catch (error) {
      console.error('Error inviting team member:', error)
      setMessage('Failed to send invitation. Please try again.')
    }
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Invite Team Member</h3>
      <form onSubmit={handleInvite} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Send Invitation
        </button>
      </form>
      {message && (
        <p className="mt-4 text-sm text-center font-medium text-green-600">
          {message}
        </p>
      )}
    </div>
  )
}