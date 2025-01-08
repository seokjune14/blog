// src/LessonListScreen.js

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const LessonListScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 1) CategoryScreen에서 넘어온 카테고리 (초보자, 중급자, 전문가, 자격증)
  const category = location.state?.category || '초보자';

  // 2) 상단바에 표시할 주소 (location.state?.userAddress 사용, 없으면 localStorage)
  const userAddress =
    location.state?.userAddress ||
    localStorage.getItem('selectedAddress') ||
    '위치 미설정';

  // 3) 사용자 위치 (동적으로 설정할 예정, 초기값은 null)
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);

  // 4) 카카오맵 Places 검색 결과
  const [lessonData, setLessonData] = useState([]);
  const [kakaoReady, setKakaoReady] = useState(false);

  // "내 위치가 속한 구" 정보
  const [myGu, setMyGu] = useState('');

  // ─────────────────────────────────────────
  // A) 컴포넌트 마운트 시 카카오맵 로드 여부 체크
  // ─────────────────────────────────────────
  useEffect(() => {
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      setKakaoReady(true);
    } else {
      console.warn('카카오맵 라이브러리가 아직 로드되지 않았습니다.');
    }
  }, []);

  // ─────────────────────────────────────────
  // B) userAddress를 이용해 주소를 위도/경도로 변환
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!kakaoReady || userAddress === '위치 미설정') return;

    window.kakao.maps.load(() => {
      const geocoder = new window.kakao.maps.services.Geocoder();

      // 주소로 좌표 변환 (addressSearch)
      geocoder.addressSearch(userAddress, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
          const { y: lat, x: lng } = result[0]; // y: latitude, x: longitude
          setUserLat(parseFloat(lat));
          setUserLng(parseFloat(lng));
          console.log(`주소 "${userAddress}"의 좌표: (${lat}, ${lng})`);
        } else {
          alert('주소를 찾을 수 없습니다. 다시 확인해주세요.');
          console.error('주소 검색 실패:', status);
        }
      });
    });
  }, [kakaoReady, userAddress]);

  // ─────────────────────────────────────────
  // C) 좌표가 설정되면 coord2RegionCode로 구(區) 찾기
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!kakaoReady || userLat === null || userLng === null) return;

    window.kakao.maps.load(() => {
      const geocoder = new window.kakao.maps.services.Geocoder();

      // coord2RegionCode(경도, 위도, callback)
      geocoder.coord2RegionCode(userLng, userLat, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
          const guName = result[0]?.region_2depth_name; // 예: "수성구"
          setMyGu(guName || '구 정보 없음');
          console.log('내 위치 구:', guName);
        } else {
          setMyGu('구 정보 없음');
          console.error('구 정보 검색 실패:', status);
        }
      });
    });
  }, [kakaoReady, userLat, userLng]);

  // ─────────────────────────────────────────
  // D) 구(區) 설정 후 Places 검색
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!kakaoReady || userLat === null || userLng === null) return;

    window.kakao.maps.load(() => {
      const ps = new window.kakao.maps.services.Places();
      const center = new window.kakao.maps.LatLng(userLat, userLng);

      const options = {
        location: center,
        radius: 5000, // 5km 반경
      };

      const keyword = `${category} 골프 레슨`; 
      ps.keywordSearch(keyword, (data, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          setLessonData(data);
          console.log(`레슨 검색 결과 (${data.length}개):`, data);
        } else {
          setLessonData([]);
          console.warn('레슨 검색 실패:', status);
        }
      }, options);
    });
  }, [kakaoReady, category, userLat, userLng]);

  // 뒤로가기 버튼
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div style={styles.container}>
      {/* 상단 바 */}
      <div style={styles.topBar}>
        <button style={styles.backButton} onClick={handleBack}>
          〈
        </button>
        {/* 상단에 사용자 주소 표시 */}
        <h1 style={styles.title}>{userAddress}</h1>
        <button style={styles.cartButton}>🛒</button>
      </div>

      {/* 카테고리 제목 */}
      <div style={styles.categoryTitle}>{category}</div>

      {/* 검색창 (UI만 유지) */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="레슨을 입력해주세요"
          style={styles.searchInput}
        />
        <button style={styles.searchButton}>🔍</button>
      </div>

      {/* ─────────────────────────────────────────
          내 위치 구(區) 버튼 (단일 버튼)
          ───────────────────────────────────────── */}
      <div style={styles.regionButtons}>
        {myGu ? (
          <button style={styles.regionButton}>{myGu}</button>
        ) : (
          <button style={styles.regionButton}>구 정보 없음</button>
        )}
      </div>

      {/* 정렬 버튼들 (추천, 인기, 가까운) */}
      <div style={styles.sortButtons}>
        <button style={styles.sortButton}>추천순</button>
        <button style={styles.sortButton}>인기순</button>
        <button style={styles.sortButton}>가까운 순</button>
      </div>

      {/* 레슨 목록 */}
      <div style={styles.lessonList}>
        {lessonData.length === 0 ? (
          <div style={{ padding: '10px' }}>레슨 정보를 찾을 수 없습니다.</div>
        ) : (
          lessonData.map((place, idx) => (
            <div key={idx} style={styles.lessonItem}>
              <div style={styles.imageBox}>이미지</div>
              <div style={styles.lessonInfo}>
                <div style={styles.lessonName}>
                  {place.place_name} 
                  <span style={styles.star}>★</span> (999+)
                </div>
                <div style={styles.lessonDetails}>
                  강사명   3km   {place.road_address_name || place.address_name}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 하단 바 */}
      <div style={styles.bottomNav}>
        <button style={styles.navButton}>🏠</button>
        <button style={styles.navButton}>❤️</button>
        <button style={styles.navButton}>📄</button>
        <button style={styles.navButton}>MY</button>
      </div>
    </div>
  );
};

// 스타일 정의
const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#ffffff',
    minHeight: '100vh',
    position: 'relative',
    paddingBottom: '60px', // 하단 바 높이
    margin: 0,
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff9c4',
    padding: '10px 20px',
    borderBottom: '1px solid #ccc',
  },
  backButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    margin: 0,
  },
  cartButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
  },
  categoryTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'left',
    padding: '10px 20px',
  },
  searchContainer: {
    display: 'flex',
    gap: '8px',
    padding: '0 20px',
  },
  searchInput: {
    flex: 1,
    border: '1px solid #ccc',
    borderRadius: '24px',
    padding: '8px 15px',
    outline: 'none',
  },
  searchButton: {
    border: '1px solid #ccc',
    borderRadius: '24px',
    padding: '8px 14px',
    backgroundColor: '#fff9c4',
    cursor: 'pointer',
  },
  regionButtons: {
    display: 'flex',
    gap: '10px',
    padding: '10px 20px',
  },
  regionButton: {
    flex: 1,
    border: '1px solid #000',
    borderRadius: '8px',
    padding: '8px',
    cursor: 'pointer',
    backgroundColor: '#fff',
  },
  sortButtons: {
    display: 'flex',
    gap: '10px',
    padding: '0 20px 20px',
  },
  sortButton: {
    flex: 1,
    border: '1px solid #000',
    borderRadius: '8px',
    padding: '8px',
    cursor: 'pointer',
    backgroundColor: '#fff',
  },
  lessonList: {
    padding: '0 20px',
  },
  lessonItem: {
    display: 'flex',
    gap: '10px',
    borderBottom: '1px solid #ccc',
    padding: '10px 0',
    alignItems: 'center',
  },
  imageBox: {
    width: '60px',
    height: '60px',
    backgroundColor: '#f1f1f1',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonInfo: {
    flex: 1,
    textAlign: 'left',
  },
  lessonName: {
    fontSize: '16px',
    fontWeight: 'bold',
  },
  star: {
    color: '#fbc02d',
    marginLeft: '6px',
  },
  lessonDetails: {
    fontSize: '14px',
    color: '#555',
  },
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    backgroundColor: '#fff9c4',
    borderTop: '1px solid #ccc',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '10px 0',
  },
  navButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
  },
};

export default LessonListScreen;
