"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import { SignupRequestDto } from "../application/usecases/member/dto/SignupRequestDto";
import { EmailVerificationDto } from "../application/usecases/member/dto/EmailVerificationDto";
import { RegisterMemberUseCase } from "../application/usecases/member/RegisterMemberUseCase";
import { SendVerificationCodeUseCase } from "../application/usecases/member/SendVerificationCodeUseCase";

export default function EmailVerifyForm() {
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
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");

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

    const { error: uploadError } = await supabase.storage.from("images").upload(filePath, profileImage);

    if (uploadError) {
      console.error("이미지 업로드 실패:", uploadError.message);
      return "";
    }

    const { data: urlData } = supabase.storage.from("images").getPublicUrl(filePath);
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
    <div style={styles.container}>
      {!showProfileForm ? (
        <>
          {/* 기존 이메일, 인증번호, 비밀번호 입력 UI */}
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={
              isVerified
                ? { ...styles.input, ...styles.disabledInput }
                : styles.input
            }
            required
            disabled={isVerified}
          />
          <button
            onClick={handleSubmit}
            style={
              isVerified
                ? { ...styles.button, ...styles.disabledButton }
                : styles.button
            }
            disabled={isVerified}
          >
            전송
          </button>
          <input
            type="text"
            placeholder="인증번호 입력"
            value={userCode}
            onChange={(e) => setUserCode(e.target.value)}
            style={
              isVerified
                ? { ...styles.input, ...styles.disabledInput }
                : isCodeSent
                ? styles.input
                : { ...styles.input, ...styles.disabledInput }
            }
            disabled={!isCodeSent || isVerified}
          />
          <button
            onClick={handleVerify}
            style={
              isCodeSent && !isVerified
                ? styles.button
                : { ...styles.button, ...styles.disabledButton }
            }
            disabled={!isCodeSent || isVerified}
          >
            인증 확인
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type={passwordType}
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
            <button onClick={togglePasswordVisibility} style={styles.button}>
              {passwordType === "password" ? "보기" : "숨기기"}
            </button>
          </div>
          <button
            onClick={() => setShowProfileForm(true)}
            style={
              isVerified && password
                ? styles.button
                : { ...styles.button, ...styles.disabledButton }
            }
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
            <img
              src={URL.createObjectURL(profileImage)}
              alt="preview"
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          )}
          <input
            type="text"
            placeholder="프로필 이름"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleRegister} style={styles.button}>
            회원가입
          </button>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
    maxWidth: "320px",
    margin: "2rem auto",
    padding: "1rem",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontFamily: "sans-serif",
  },
  input: {
    padding: "0.5rem",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
  button: {
    padding: "0.5rem",
    fontSize: "1rem",
    backgroundColor: "#0070f3",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  disabledInput: {
    backgroundColor: "#f0f0f0",
    color: "#888",
    cursor: "not-allowed",
  },
  disabledButton: {
    backgroundColor: "#ccc",
    color: "#666",
    cursor: "not-allowed",
  },
  label: {
    fontWeight: "bold",
    fontSize: "0.9rem",
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
  },
};
