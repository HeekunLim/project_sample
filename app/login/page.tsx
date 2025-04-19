"use client";

import { useState } from "react";
import { LoginUseCase } from "../application/usecases/member/LoginUseCase";
import { LoginRequestDto } from "../application/usecases/member/dto/LoginRequestDto";

export default function LoginForm() {
  const [email, setEmail] = useState(""); // 사용자가 입력한 이메일
  const [password, setPassword] = useState(""); // 사용자가 입력한 비밀번호
  const [passwordType, setPasswordType] = useState("password");

  const togglePasswordVisibility = () => {
    setPasswordType((prevType) =>
      prevType === "password" ? "text" : "password"
    );
  };

  const handleVerify = async () => {
    const loginDto: LoginRequestDto = {
      email,
      password,
    };

    const loginUseCase = new LoginUseCase();

    try {
      const result = await loginUseCase.execute(loginDto);
      alert(result.message);
      console.log("로그인된 사용자 정보:", result.member);
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("알 수 없는 오류가 발생했습니다");
      }
    }
  };

  return (
    <div>
      <input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type={passwordType}
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button onClick={togglePasswordVisibility}>
        {passwordType === "password" ? "보기" : "숨기기"}
      </button>
      <button onClick={handleVerify}>로그인</button>
    </div>
  );
}
