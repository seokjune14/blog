// src/App.js
import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate
} from 'react-router-dom';
import './App.css';
import FindAccount from "./FindAccount"; // 아이디/비밀번호 찾기
import Signup from './Signup';
import Map from './Map';                // 지도 페이지
import CategoryScreen from './CategoryScreen'; 
import RegionDetailScreen from './RegionDetailScreen'; 
import LessonListScreen from './LessonListScreen'; // <-- 새로 만든 레슨 목록 화면

// 위치 서비스 확인 컴포넌트
function LocationService() {
  const [permissionGranted, setPermissionGranted] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 위치 권한 요청
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('위치 권한 허용:', position);
          setPermissionGranted(true);
          navigate('/category'); // 허용 시 카테고리 화면으로 이동
        },
        (error) => {
          console.error('위치 권한 거부:', error);
          setPermissionGranted(false);
        }
      );
    } else {
      console.error('Geolocation을 지원하지 않는 브라우저입니다.');
      setPermissionGranted(false);
    }
  }, [navigate]);

  if (permissionGranted === null) {
    return <h2>위치 서비스를 확인 중입니다...</h2>;
  }

  if (permissionGranted === false) {
    return (
      <div style={{ margin: '20px' }}>
        <h2>위치 권한이 거부되었습니다.</h2>
        <p>앱 사용을 위해 위치 권한을 허용해주세요.</p>
        <Link to="/">돌아가기</Link>
      </div>
    );
  }

  return null; // 허용되면 자동으로 카테고리 화면으로 이동
}

// ─────────────────────────────────────────────────────────────
// App 컴포넌트 (로그인 화면 + 라우팅)
// ─────────────────────────────────────────────────────────────
function App() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://developers.kakao.com/sdk/js/kakao.js';
    script.async = true;
    script.onload = () => {
      if (window.Kakao) {
        window.Kakao.init('d808d4a8427f820f4844d337152cb842');
        console.log('Kakao init:', window.Kakao.isInitialized());
      }
    };
    document.body.appendChild(script);
  }, []);

  const handleKakaoLogin = () => {
    if (!window.Kakao) {
      console.error('Kakao SDK가 아직 로드되지 않음');
      return;
    }

    window.Kakao.Auth.login({
      scope: 'profile_nickname,profile_image,account_email',
      success: (authObj) => {
        console.log('카카오 로그인 성공:', authObj);

        window.Kakao.API.request({
          url: '/v2/user/me',
          success: (res) => {
            console.log('사용자 정보:', res);
            alert(`닉네임: ${res.kakao_account.profile.nickname}`);

            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('kakaoNickname', res.kakao_account.profile.nickname);

            // 위치 서비스 페이지로 이동
            window.location.href = '/location-service';
          },
          fail: (error) => {
            console.error('사용자 정보 요청 실패:', error);
          }
        });
      },
      fail: (error) => {
        console.error('카카오 로그인 실패:', error);
      }
    });
  };

  const handleNormalLogin = () => {
    const idInput = document.getElementById('normal-id');
    const pwInput = document.getElementById('normal-pw');
    const idValue = idInput ? idInput.value : '';
    const pwValue = pwInput ? pwInput.value : '';

    if (!idValue || !pwValue) {
      alert('ID/PW를 입력하세요.');
      return;
    }

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userId', idValue);

    // 위치 서비스 페이지로 이동
    window.location.href = '/location-service';
  };

  return (
    <Router>
      <Routes>
        {/* 1) "/" → 로그인 화면 */}
        <Route
          path="/"
          element={
            <div className="login-container">
              <div className="header-links">
                <Link to="/signup">회원가입 &gt;</Link>
                <Link to="/find-account">아이디/비밀번호 찾기 &gt;</Link>
              </div>
              <div className="profile-circle"></div>
              <div style={{ marginBottom: '20px' }}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleKakaoLogin();
                  }}
                >
                  <img
                    src="https://www.gb.go.kr/Main/Images/ko/member/certi_kakao_login.png"
                    alt="카카오 로그인 버튼"
                    style={{ width: '200px', cursor: 'pointer' }}
                  />
                </a>
              </div>
              <div className="login-form">
                <div className="remember-me">
                  <label>
                    <input type="checkbox" name="remember-me" />
                    자동로그인
                  </label>
                </div>
                <input id="normal-id" type="text" placeholder="ID" />
                <input id="normal-pw" type="password" placeholder="PASSWORD" />
                <button className="login-button" onClick={handleNormalLogin}>
                  LOGIN
                </button>
              </div>
            </div>
          }
        />

        {/* 2) 회원가입 페이지 */}
        <Route path="/signup" element={<Signup />} />

        {/* 3) 지도 페이지 */}
        <Route path="/map" element={<Map />} />

        {/* 4) 위치 서비스 페이지 */}
        <Route path="/location-service" element={<LocationService />} />

        {/* 5) 카테고리 페이지 */}
        <Route path="/category" element={<CategoryScreen />} />

        {/* 6) 아이디/비밀번호 찾기 페이지 */}
        <Route path="/find-account" element={<FindAccount />} />

        {/* 7) RegionDetailScreen 라우트 추가 */}
        <Route path="/region-detail" element={<RegionDetailScreen />} />

        {/* 8) LessonListScreen 라우트 추가 */}
        <Route path="/lesson-list" element={<LessonListScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
