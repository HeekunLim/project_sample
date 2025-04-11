'use client'

import { useState } from 'react'

export default function ContactForm() {
  const [form, setForm] = useState({ email: '', message: '' })
  const [status, setStatus] = useState('')
  const [checkNum, setCheckNum] = useState('')
  const [userCode, setUserCode] = useState('')
  const [verifyStatus, setVerifyStatus] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('전송 중...')

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    setCheckNum(code)

    const res = await fetch('/api/mail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, message: code }),
    })

    if (res.ok) {
      setStatus('인증번호 전송 완료')
      setForm({ email: form.email, message: '' })
    } else {
      setStatus('전송에 실패했습니다')
    }
  }

  const handleVerify = () => {
    if (userCode === checkNum) {
      setVerifyStatus('인증되었습니다')
    } else {
      setVerifyStatus('인증번호가 일치하지 않습니다')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        placeholder="가입할 이메일"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
      />
      <button type="submit">전송</button>
      <p>{status}</p>
      <input
        type="text"
        placeholder="인증번호 입력"
        value={userCode}
        onChange={(e) => setUserCode(e.target.value)}
        className="block"
      />
      <button type="button" onClick={handleVerify}>
        인증 확인
      </button>
      <p>{verifyStatus}</p>
    </form>
  )
}
