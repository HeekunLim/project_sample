"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import { SignupRequestDto } from "../application/usecases/member/dto/SignupRequestDto";
import { EmailVerificationDto } from "../application/usecases/member/dto/EmailVerificationDto";
import { RegisterMemberUseCase } from "../application/usecases/member/RegisterMemberUseCase";
import { SendVerificationCodeUseCase } from "../application/usecases/member/SendVerificationCodeUseCase";
import Link from "next/link";

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
      window.location.href = "/login";
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("회원가입 중 알 수 없는 오류가 발생했습니다");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="flex justify-center mb-6">
            <h1 className="text-3xl font-bold text-blue-600">
              YouTube Timeline Finder
            </h1>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            회원가입
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {!showProfileForm
              ? "계정 정보를 입력하세요"
              : "프로필 정보를 설정하세요"}
          </p>
        </div>

        <div className="card mt-8 p-6">
          {!showProfileForm ? (
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  이메일
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isVerified}
                    required
                    className="flex-grow focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-l-md p-2 border"
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={isVerified}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white ${
                      isVerified
                        ? "bg-gray-400"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    전송
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="verification"
                  className="block text-sm font-medium text-gray-700"
                >
                  인증번호
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    id="verification"
                    type="text"
                    placeholder="6자리 인증번호"
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    disabled={!isCodeSent || isVerified}
                    className="flex-grow focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-l-md p-2 border"
                  />
                  <button
                    onClick={handleVerify}
                    disabled={!isCodeSent || isVerified}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white ${
                      !isCodeSent || isVerified
                        ? "bg-gray-400"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    확인
                  </button>
                </div>
                {isVerified && (
                  <p className="mt-1 text-sm text-green-600">
                    이메일 인증이 완료되었습니다.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  비밀번호
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    id="password"
                    type={passwordType}
                    placeholder="안전한 비밀번호를 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-grow focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-l-md p-2 border"
                  />
                  <button
                    onClick={togglePasswordVisibility}
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100"
                  >
                    {passwordType === "password" ? "보기" : "숨기기"}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setShowProfileForm(true)}
                  disabled={!isVerified || !password}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    !isVerified || !password
                      ? "bg-gray-400"
                      : "bg-blue-600 hover:bg-blue-700"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  다음
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  프로필 사진
                </label>
                <div className="mt-2 flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 mb-4 flex items-center justify-center">
                    {profileImage ? (
                      <img
                        src={URL.createObjectURL(profileImage)}
                        alt="프로필 미리보기"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400">사진 없음</span>
                    )}
                  </div>
                  <label
                    htmlFor="profile-upload"
                    className="cursor-pointer py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    사진 선택
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setProfileImage(file);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label
                  htmlFor="profileName"
                  className="block text-sm font-medium text-gray-700"
                >
                  프로필 이름
                </label>
                <div className="mt-1">
                  <input
                    id="profileName"
                    type="text"
                    placeholder="사용할 이름을 입력하세요"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={() => setShowProfileForm(false)}
                  className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  이전
                </button>
                <button
                  onClick={handleRegister}
                  className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  회원가입 완료
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            이미 계정이 있으신가요?{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
