'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

export default function PlaylistCreator() {
  const { data: session } = useSession()
  const [title, setTitle] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const extractVideoIds = (input: string): string[] => {
    return input
      .split(/\s|,/) // 공백 또는 쉼표 기준 분리
      .map((str) => str.trim())
      .filter(Boolean)
      .map((item) => {
        try {
          const url = new URL(item)
          if (url.hostname.includes('youtube.com')) {
            return url.searchParams.get('v') || ''
          }
          if (url.hostname === 'youtu.be') {
            return url.pathname.slice(1)
          }
        } catch {
          return item
        }
      })
      .filter(Boolean) as string[]
  }

  const handleClick = async () => {
    if (!session?.accessToken) {
      alert('로그인이 필요합니다.')
      return
    }

    const videoIds = extractVideoIds(inputValue)

    if (videoIds.length === 0) {
      alert('영상 ID나 유튜브 링크를 입력해 주세요.')
      return
    }

    if (!title.trim()) {
      alert('재생목록 제목을 입력해 주세요.')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/create-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ videoIds, title }),
      })

      const data = await res.json()

      if (res.ok) {
        alert(data.message || '재생목록이 생성되었습니다.')
        await signOut()
      } else {
        alert(data.message || '실패')
      }
    } catch (err) {
      console.error(err)
      alert('에러가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 mt-8">
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">재생목록 제목:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 내 유튜브 큐"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">
          영상 ID 또는 유튜브 링크 (쉼표 또는 줄바꿈 구분):
        </label>
        <textarea
          rows={6}
          placeholder="예: https://www.youtube.com/watch?v=abc123 또는 abc123"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleClick}
          disabled={isLoading}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '생성 중...' : '재생목록 생성'}
        </button>
      </div>
    </div>
  )
}
