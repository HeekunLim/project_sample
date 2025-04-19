'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import PlaylistCreator from '../components/PlaylistCreator'

export default function Home() {
  const { data: session } = useSession()

  return (
    <main>
      {session ? (
        <>
          <p>로그인됨: {session.user?.email}</p>
          <button onClick={() => signOut()}>로그아웃</button>
          <PlaylistCreator />
        </>
      ) : (
        <button onClick={() => signIn('google')}>Google 로그인</button>
      )}
    </main>
  )
}
