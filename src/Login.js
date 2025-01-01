import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const navigate = useNavigate(); // Router 내부에서 호출 가능

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://developers.kakao.com/sdk/js/kakao.js';
    script.async = true;
    script.onload = () => {
      if (window.Kakao) {
        window.Kakao.init('YOUR_KAKAO_API_KEY');
        console.log('카카오 초기화 완료:', window.Kakao.isInitialized());
      }
    };
    document.body.appendChild(script);
  }, []);

  const handleKakaoLogin = () => {
    if (window.Kakao) {
      window.Kakao.Auth.login({
        scope: 'profile_nickname,profile_image,account_email',
        success: function (authObj) {
          console.log('로그인 성공:', authObj);
          navigate('/lesson-map'); // 로그인 성공 후 지도 화면으로 이동
        },
        fail: function (error) {
          console.error('로그인 실패:', error);
        },
      });
    } else {
      console.error('Kakao SDK가 아직 로드되지 않았습니다.');
    }
  };

  return (
    <div className="login-container">
      <div className="header-links">
        <Link to="/signup">회원가입 &gt;</Link>
        <a href="/find-id-password">아이디/비밀번호 찾기 &gt;</a>
      </div>
      <div className="profile-circle"></div>
      <div style={{ marginBottom: '20px' }}>
        <a href="#" onClick={handleKakaoLogin}>
          <img
            src="https://www.gb.go.kr/Main/Images/ko/member/certi_kakao_login.png"
            alt="카카오 로그인 버튼"
            style={{ width: '200px', cursor: 'pointer' }}
          />
        </a>
      </div>
      <div className="login-form">
        <label>
          <input type="checkbox" name="remember-me" /> 자동로그인
        </label>
        <input type="text" placeholder="ID" />
        <input type="password" placeholder="PASSWORD" />
        <button className="login-button">LOGIN</button>
      </div>
    </div>
  );
}

export default Login;
