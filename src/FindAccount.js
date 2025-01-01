import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // useNavigate 추가
import "./FindAccount.css";

function FindAccount() {
  const [activeTab, setActiveTab] = useState("id"); // 현재 활성화된 탭 (id 또는 password)
  const [verificationSent, setVerificationSent] = useState(false); // 인증번호 전송 상태
  const [verified, setVerified] = useState(false); // 인증 성공 상태
  const [newPassword, setNewPassword] = useState(""); // 새 비밀번호
  const [passwordChanged, setPasswordChanged] = useState(false); // 비밀번호 변경 성공 상태
  const navigate = useNavigate(); // 네비게이션 사용

  const handleSendVerification = () => {
    // 인증번호 전송 로직 (API 호출 등)
    alert("인증번호가 전송되었습니다.");
    setVerificationSent(true);
  };

  const handleVerifyCode = () => {
    // 인증번호 확인 로직 (API 호출 등)
    const correctCode = true; // 예: 서버에서 인증 성공 응답
    if (correctCode) {
      alert("인증번호가 확인되었습니다.");
      setVerified(true);
    } else {
      alert("인증번호가 일치하지 않습니다.");
    }
  };

  const handleChangePassword = () => {
    if (!newPassword) {
      alert("새 비밀번호를 입력해주세요.");
      return;
    }
    // 비밀번호 변경 로직 (API 호출 등)
    setPasswordChanged(true); // 비밀번호 변경 성공 상태로 전환
  };

  const handleBackToLogin = () => {
    navigate("/"); // 루트 경로로 이동
  };

  const handleExit = () => {
    navigate("/"); // "나가기" 버튼 클릭 시 로그인 화면으로 이동
  };

  return (
    <div className="find-account-container">
      <header className="header">
        <button className="back-button" onClick={handleExit}>←</button> {/* 나가기 버튼 */}
        <h1>아이디 / 비밀번호 찾기</h1>
      </header>
      <div className="tabs">
        <button
          className={`tab ${activeTab === "id" ? "active" : ""}`}
          onClick={() => setActiveTab("id")}
        >
          아이디 찾기
        </button>
        <button
          className={`tab ${activeTab === "password" ? "active" : ""}`}
          onClick={() => setActiveTab("password")}
        >
          비밀번호 찾기
        </button>
      </div>

      {/* 아이디 찾기 */}
      {activeTab === "id" && (
        <div className="form">
          <label>
            휴대전화번호 입력 <span>(-제외)</span>
          </label>
          <div className="input-group">
            <input type="text" placeholder="휴대전화번호 입력" />
            <button className="send-button">인증번호 전송</button>
          </div>
          <label>인증번호 입력</label>
          <div className="input-group">
            <input type="text" placeholder="인증번호 입력" />
            <button className="verify-button">확인</button>
          </div>
          <button className="submit-button">아이디 찾기</button>
        </div>
      )}

      {/* 비밀번호 찾기 */}
      {activeTab === "password" && (
        <div className="form">
          {passwordChanged ? (
            <div className="password-changed">
              <p>비밀번호가 성공적으로 변경되었습니다.</p>
              <button className="submit-button" onClick={handleBackToLogin}>
                확인
              </button>
            </div>
          ) : !verified ? (
            <>
              <label>
                휴대전화번호 입력 <span>(-제외)</span>
              </label>
              <div className="input-group">
                <input type="text" placeholder="휴대전화번호 입력" />
                <button className="send-button" onClick={handleSendVerification}>
                  인증번호 전송
                </button>
              </div>
              {verificationSent && (
                <>
                  <label>인증번호 입력</label>
                  <div className="input-group">
                    <input type="text" placeholder="인증번호 입력" />
                    <button className="verify-button" onClick={handleVerifyCode}>
                      확인
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <label>새 비밀번호 입력</label>
              <input
                type="password"
                placeholder="새 비밀번호 입력"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button className="submit-button" onClick={handleChangePassword}>
                비밀번호 변경
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default FindAccount;
