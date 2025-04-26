'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import PlaylistCreator from '../components/PlaylistCreator'

export default function Home() {
  const { data: session } = useSession()

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      {session ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg font-semibold text-gray-700">
            로그인됨: {session.user?.email}
          </p>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            로그아웃
          </button>
          <PlaylistCreator />
        </div>
      ) : (
        <button
          onClick={() => signIn('google')}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-lg"
        >
          Google 로그인
        </button>
      )}
    </main>
  )
}
