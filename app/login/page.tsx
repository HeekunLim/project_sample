"use client";

import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold text-center mb-6">로그인 페이지</h1>
      <LoginForm />
    </div>
  );
}
