// src/LessonListScreen.js

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as turf from '@turf/turf';

const LessonListScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 1) CategoryScreen에서 넘어온 카테고리
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

  // 인접 구 정보
  const [nearbyGus, setNearbyGus] = useState([]);

  // 행정구역 GeoJSON 데이터
  const [adminGus, setAdminGus] = useState(null);

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
  // B) GeoJSON 데이터 Fetch
  // ─────────────────────────────────────────
  useEffect(() => {
    fetch('/data/adminGus.geojson')
      .then((response) => {
        if (!response.ok) {
          throw new Error('GeoJSON 데이터 로드 실패');
        }
        return response.json();
      })
      .then((data) => {
        setAdminGus(data);
        console.log('GeoJSON 데이터 로드 완료');
      })
      .catch((error) => {
        console.error('GeoJSON 데이터 로드 오류:', error);
      });
  }, []);

  // ─────────────────────────────────────────
  // C) userAddress를 이용해 주소를 위도/경도로 변환
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
  // D) 좌표가 설정되면 coord2RegionCode로 구(區) 찾기
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!kakaoReady || userLat === null || userLng === null) return;

    window.kakao.maps.load(() => {
      const geocoder = new window.kakao.maps.services.Geocoder();

      // coord2RegionCode(경도, 위도, callback)
      geocoder.coord2RegionCode(userLng, userLat, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
          const guName = result[0]?.region_2depth_name; // 예: "수성구"
          setMyGu(guName || '');
          console.log('내 위치 구:', guName);
        } else {
          setMyGu('');
          console.error('구 정보 검색 실패:', status);
        }
      });
    });
  }, [kakaoReady, userLat, userLng]);

  // ─────────────────────────────────────────
  // E) 내 구가 설정되면 인접 구 찾기 (GeoJSON 활용)
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!myGu || !adminGus) return;

    // 현재 구의 GeoJSON Feature 찾기
    const currentFeature = adminGus.features.find(
      (feature) => feature.properties.name === myGu
    );

    if (!currentFeature) {
      console.error(`GeoJSON 데이터에서 "${myGu}"를 찾을 수 없습니다.`);
      setNearbyGus([]);
      return;
    }

    // 인접 구 추출 함수
    const getAdjacentGus = (currentFeature) => {
      const adjacentGus = [];

      adminGus.features.forEach((feature) => {
        if (feature.properties.name === myGu) return;

        // 두 구의 경계가 접촉하는지 확인
        const touches = turf.booleanTouches(currentFeature, feature);
        if (touches) {
          adjacentGus.push(feature.properties.name);
        }
      });

      return adjacentGus.slice(0, 2); // 최대 2개 인접 구
    };

    const adjacentGus = getAdjacentGus(currentFeature);
    setNearbyGus(adjacentGus);
    console.log('인접 구:', adjacentGus);
  }, [myGu, adminGus]);

  // ─────────────────────────────────────────
  // F) Places keywordSearch ("카테고리 + 골프 레슨")
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
          // Places 검색 실패 시 샘플 데이터 설정
          const sampleData = [
            {
              id: 'A', // 상세화면 이동을 위해 ID 추가 (문자/숫자)
              place_name: '레슨명 A',
              star_rating: 5,
              reviews: 999,
             
              distance: '3km',
              road_address_name: 'A파크골프장 도로명 주소',
              address_name: 'A파크골프장 지번 주소',
              price: '150,000원~',
              description: '초보자를 위한 기본 스윙부터 자세 교정까지 진행합니다.',
              instructor_career: '프로 골퍼 10년 경력, KGA 정회원',
            },
            {
              id: 'B',
              place_name: '레슨명 B',
              star_rating: 4.8,
              reviews: 812,
             
              distance: '15km',
              road_address_name: 'B파크골프장 도로명 주소',
              address_name: 'B파크골프장 지번 주소',
              price: '120,000원~',
              description: '중급자를 위한 스윙 분석과 코스 공략법을 집중적으로 다룹니다.',
              instructor_career: 'KPGA 투어 3회 우승, SBS 골프해설 패널',
            },
            {
              id: 'C',
              place_name: '레슨명 C',
              star_rating: 4.4,
              reviews: 24,
             
              distance: '2.5km',
              road_address_name: 'C파크골프장 도로명 주소',
              address_name: 'C파크골프장 지번 주소',
              price: '100,000원~',
              description: '단체 레슨 및 주말 집중 코스. 스윙 폼 교정을 상세히 안내합니다.',
              instructor_career: '지역 골프 아카데미 전임 강사, PXG 서포터즈',
            },
            {
              id: 'D',
              place_name: '레슨명 D',
              star_rating: 4.7,
              reviews: 150,
             
              distance: '4km',
              road_address_name: 'D파크골프장 도로명 주소',
              address_name: 'D파크골프장 지번 주소',
              price: '140,000원~',
              description: '개인 레슨으로 집중도 높은 피드백을 제공합니다.',
              instructor_career: '유소년 골프 코치 5년, 국가대표 코치 경력',
            },
            // 필요시 더 추가...
          ];
          setLessonData(sampleData);
          console.log('샘플 데이터 설정:', sampleData);
        }
      }, options);
    });
  }, [kakaoReady, category, userLat, userLng]);

  // 뒤로가기 버튼
  const handleBack = () => {
    navigate(-1);
  };

  // 레슨 클릭 시 상세 화면으로 이동
  const handleLessonClick = (lesson) => {
    // LessonDetailScreen으로 lesson 정보 전달
    navigate('/lessonDetail', { state: { lesson } });
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
          인접 구 버튼들 (최대 3개: 현재 구 + 인접 2개)
          ───────────────────────────────────────── */}
      <div style={styles.regionButtons}>
        {myGu ? (
          <>
            <button style={styles.regionButton}>{myGu}</button>
            {nearbyGus.map((gu, idx) => (
              <button key={idx} style={styles.regionButton}>
                {gu}
              </button>
            ))}
          </>
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
            <div
              key={place.id || idx}
              style={styles.lessonItem}
              onClick={() => handleLessonClick(place)}
            >
              <div style={styles.imageBox}>이미지</div>
              <div style={styles.lessonInfo}>
                <div style={styles.lessonName}>
                  {place.place_name}
                  <span style={styles.star}>★</span> ({place.reviews}+)
                </div>
                <div style={styles.lessonDetails}>
                  {place.instructor} &nbsp;&nbsp; {place.distance} &nbsp;&nbsp;{' '}
                  {place.road_address_name || place.address_name}
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

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#ffffff',
    minHeight: '100vh',
    position: 'relative',
    paddingBottom: '60px',
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
    cursor: 'pointer',
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
