import React, { useState } from 'react';
import './Signup.css';

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    verificationCode: '',
    id: '',
    password: '',
    confirmPassword: '',
    healthStatus: '',
    agree14: false,
    agreeTerms: false,
    agreePrivacy: false,
    rrnFront: '',  // 주민번호 앞 6자리
    rrnBack: '',   // 주민번호 뒷 7자리(실제 값)
  });

  // 주민번호 뒷자리를 마스킹해서 보여줄 상태
  const [maskedRrnBack, setMaskedRrnBack] = useState('');

  const [showModal, setShowModal] = useState({ visible: false, content: '' });
  const [isVerificationSent, setIsVerificationSent] = useState(false);

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // 주민번호 앞자리 입력 핸들러 (숫자만, 최대 6자리)
  const handleRrnFrontChange = (e) => {
    // 숫자만 남기고, 6자리로 제한
    const newValue = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFormData({
      ...formData,
      rrnFront: newValue,
    });
  };

  // 주민번호 뒷자리 입력 핸들러
  // - 실제 값은 formData.rrnBack 에 저장
  // - 화면에 표시될 값은 maskedRrnBack 에 저장
  const handleRrnBackChange = (e) => {
    // 숫자만 남기고, 7자리로 제한
    let newValue = e.target.value.replace(/\D/g, '').slice(0, 7);

    // 실제 값 저장
    setFormData({
      ...formData,
      rrnBack: newValue,
    });

    // 마스킹된 값 만들기
    if (newValue.length > 0) {
      // 첫 글자만 보이고 나머지는 x
      setMaskedRrnBack(newValue[0] + 'x'.repeat(newValue.length - 1));
    } else {
      setMaskedRrnBack('');
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    // 콘솔로 실제 주민번호 확인 가능(주의)
    console.log('실제 주민번호:', formData.rrnFront, '-', formData.rrnBack);
    alert('회원가입 정보가 제출되었습니다.');
  };

  // 약관 모달 열기/닫기
  const openModal = (content) => {
    setShowModal({ visible: true, content });
  };
  const closeModal = () => {
    setShowModal({ visible: false, content: '' });
  };

  // 인증번호 전송
  const sendVerificationCode = () => {
    if (!formData.phone) {
      alert('전화번호를 입력해주세요.');
      return;
    }
    alert(`인증번호가 ${formData.phone}로 전송되었습니다.`);
    setIsVerificationSent(true);
  };

  // 약관 내용 (예시)
  const termsOfService = 
  `
  제1장 총 칙

제1조 (이용약관)
...
  `;
  const privacyPolicy = 
  `
  제1조 (개인정보의 수집 항목 및 이용 목적)
  1. 회사는 회원 가입, 원활한 고객상담, 각종 서비스의 제공을 위해 
     최소한의 개인정보를 수집합니다.
  ...
  (개인정보 처리 방침 등 구체적인 내용)
  ...
  `;

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        {/* 이름 */}
        <label>이름 *</label>
        <input
          type="text"
          name="name"
          placeholder="이름을 입력해주세요"
          value={formData.name}
          onChange={handleChange}
          required
        />

        {/* 성별 */}
        <label>성별 *</label>
        <select
          name="healthStatus"
          value={formData.healthStatus}
          onChange={handleChange}
          required
        >
          <option value="" disabled>성별을 선택해주세요</option>
          <option value="남">남</option>
          <option value="여">여</option>
        </select>

        {/* 주민등록번호 */}
        <label>주민등록번호 *</label>
        <div className="rrn-input">
          <input
            type="text"
            name="rrnFront"
            value={formData.rrnFront}
            onChange={handleRrnFrontChange}
            maxLength={6}
            placeholder="앞 6자리 (예: 031122)"
            required
          />
          <span>-</span>
          <input
            type="text"
            name="rrnBack"
            value={maskedRrnBack}
            onChange={handleRrnBackChange}
            maxLength={1}
            placeholder="뒷 1자리(예 : 2)"
            required
          />
        </div>

        {/* 전화번호 */}
        <label>전화번호 *</label>
        <div className="phone-input">
          <input
            type="tel"
            name="phone"
            placeholder="전화번호를 입력해주세요"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <button 
            type="button" 
            className="verification-button" 
            onClick={sendVerificationCode}
          >
            인증번호 전송
          </button>
        </div>

        {/* 인증번호 입력 */}
        {isVerificationSent && (
          <>
            <label>인증번호 입력 *</label>
            <div className="phone-input">
              <input
                type="text"
                name="verificationCode"
                placeholder="인증번호 6자리를 입력해주세요"
                value={formData.verificationCode}
                onChange={handleChange}
                required
              />
              <button 
                type="button" 
                className="verification-button"
                onClick={() => alert('인증번호가 확인되었습니다!')}
              >
                인증번호 확인
              </button>
            </div>
          </>
        )}

        {/* 아이디 */}
        <label>아이디 *</label>
        <input
          type="text"
          name="id"
          placeholder="아이디를 입력해주세요"
          value={formData.id}
          onChange={handleChange}
          required
        />

        {/* 비밀번호 */}
        <label>비밀번호 *</label>
        <input
          type="password"
          name="password"
          placeholder="비밀번호를 입력해주세요"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <label>비밀번호 확인 *</label>
        <input
          type="password"
          name="confirmPassword"
          placeholder="비밀번호를 다시 입력해주세요"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        {/* 건강 상태 (기존에 있던 필드) */}
        <label>건강 상태</label>
        <select
          name="healthStatus"
          value={formData.healthStatus}
          onChange={handleChange}
          required
        >
          <option value="" disabled>건강 상태를 선택해주세요</option>
          <option value="엘보우">엘보우</option>
          <option value="기타">기타</option>
        </select>

        {/* 체크박스(이용약관 동의) */}
        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              name="agree14"
              checked={formData.agree14}
              onChange={handleChange}
              required
            />
            (필수) 만 14세 이상입니다
          </label>
          <label>
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              required
            />
            (필수) <span className="link" onClick={() => openModal(termsOfService)}>서비스 이용약관</span>에 동의합니다.
          </label>
          <label>
            <input
              type="checkbox"
              name="agreePrivacy"
              checked={formData.agreePrivacy}
              onChange={handleChange}
              required
            />
            (필수) <span className="link" onClick={() => openModal(privacyPolicy)}>개인정보 수집/이용</span>에 동의합니다.
          </label>
        </div>

        <button type="submit" className="submit-button">
          가입완료
        </button>
      </form>

      {/* 약관 모달 */}
      {showModal.visible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>약관</h3>
            <div className="modal-text">
              <p style={{ whiteSpace: 'pre-line', textAlign: 'left' }}>
                {showModal.content}
              </p>
            </div>
            <button className="modal-close-button" onClick={closeModal}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Signup;
