// app/api/mail/route.ts
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: Request) {
  const { name, email, message } = await req.json()

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: `📩 ${name}님으로 부터의 메일입니다.`,
    html: `
      <p>${message}</p>
    `,
  })

  return NextResponse.json({ message: 'Email sent!' }, { status: 200 })
}
