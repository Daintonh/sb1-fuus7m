import Head from 'next/head'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Head>
        <title>SOS Jobs</title>
        <meta name="description" content="Connect employers, agencies, and job seekers" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-4xl font-bold mb-8">Welcome to SOS Jobs</h1>
        <div className="flex space-x-4">
          <Link href="/auth" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Sign In
          </Link>
          <Link href="/auth?action=signup" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            Sign Up
          </Link>
        </div>
      </main>
    </>
  )
}