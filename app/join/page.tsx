"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import { SignupRequestDto } from "../application/usecases/member/dto/SignupRequestDto";
import { EmailVerificationDto } from "../application/usecases/member/dto/EmailVerificationDto";
import { RegisterMemberUseCase } from "../application/usecases/member/RegisterMemberUseCase";
import { SendVerificationCodeUseCase } from "../application/usecases/member/SendVerificationCodeUseCase";

export default function JoinForm() {
  const [email, setEmail] = useState(""); // 사용자가 입력한 이메일
  const [checkNum, setCheckNum] = useState(""); // 생성된 인증번호
  const [userCode, setUserCode] = useState(""); // 사용자가 입력한 인증번호
  const [password, setPassword] = useState(""); // 사용자가 입력한 비밀번호
  const [isVerified, setIsVerified] = useState(false); // 인증이 되었는지 유무
  const [isCodeSent, setIsCodeSent] = useState(false); // 메인 전송 성공, 실패 여부
  const [passwordType, setPasswordType] = useState("password"); // 비밀번호 필드의 type 상태 추가
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);

  // 인증번호 메일 전송
  const handleSubmit = async () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setCheckNum(code);

    const sendVerificationCodeUseCase = new SendVerificationCodeUseCase();
    const verificationDto: EmailVerificationDto = { email, code };

    try {
      await sendVerificationCodeUseCase.execute(verificationDto);
      setIsCodeSent(true);
      alert("인증번호가 전송되었습니다");
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("알 수 없는 에러가 발생했습니다.");
      }
    }
  };

  // 입력한 인증번호 일치 여부 안내
  const handleVerify = () => {
    if (userCode === checkNum) {
      alert("인증되었습니다");
      setIsVerified(true);
    } else {
      alert("인증번호가 일치하지 않습니다");
    }
  };

  // 버튼을 통해 비밀번호 입력란 타입 변경
  const togglePasswordVisibility = () => {
    setPasswordType((prevType) =>
      prevType === "password" ? "text" : "password"
    );
  };

  const handleImageUpload = async () => {
    if (!profileImage) return "";

    const fileExt = profileImage.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `profile/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(filePath, profileImage);

    if (uploadError) {
      console.error("이미지 업로드 실패:", uploadError.message);
      return "";
    }

    const { data: urlData } = supabase.storage
      .from("images")
      .getPublicUrl(filePath);
    return urlData.publicUrl;
  };

  // 멤버 테이블에 등록
  const handleRegister = async () => {
    const uploadedUrl = await handleImageUpload();
    const signupRequestDto: SignupRequestDto = {
      email,
      password,
      profileName,
      profilePicUrl: uploadedUrl,
    };

    const registerMemberUseCase = new RegisterMemberUseCase();

    try {
      await registerMemberUseCase.execute(signupRequestDto);
      alert("회원가입이 완료되었습니다!");
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("회원가입 중 알 수 없는 오류가 발생했습니다");
      }
    }
  };

  return (
    <div>
      {!showProfileForm ? (
        <>
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isVerified}
          />
          <button onClick={handleSubmit} disabled={isVerified}>
            전송
          </button>
          <input
            type="text"
            placeholder="인증번호 입력"
            value={userCode}
            onChange={(e) => setUserCode(e.target.value)}
            disabled={!isCodeSent || isVerified}
          />
          <button onClick={handleVerify} disabled={!isCodeSent || isVerified}>
            인증 확인
          </button>
          <div>
            <input
              type={passwordType}
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={togglePasswordVisibility}>
              {passwordType === "password" ? "보기" : "숨기기"}
            </button>
          </div>
          <button
            onClick={() => setShowProfileForm(true)}
            disabled={!isVerified || !password}
          >
            다음
          </button>
        </>
      ) : (
        <>
          <label>프로필 사진</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setProfileImage(file);
            }}
          />
          {profileImage && (
            <img src={URL.createObjectURL(profileImage)} alt="preview" />
          )}
          <input
            type="text"
            placeholder="프로필 이름"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
          />
          <button onClick={handleRegister}>회원가입</button>
        </>
      )}
    </div>
  );
}
