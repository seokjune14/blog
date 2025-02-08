// LessonListScreen.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as turf from '@turf/turf'; // 거리 계산용 turf 라이브러리

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

  // 3) 사용자 위치 (주소 → 좌표 변환)
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);

  // 카카오맵 Places 검색 결과
  const [lessonData, setLessonData] = useState([]);
  const [kakaoReady, setKakaoReady] = useState(false);

  // "내 위치가 속한 구" 정보
  const [myGu, setMyGu] = useState('');
  // 인접 구 정보
  const [nearbyGus, setNearbyGus] = useState([]);
  // 행정구역 GeoJSON 데이터
  const [adminGus, setAdminGus] = useState(null);

  // ─────────────────────────────────────────
  // 장바구니 상태 추가 (localStorage 연동)
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // ─────────────────────────────────────────
  // A) 카카오맵 로드 여부 체크
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
  // C) userAddress → 좌표 변환
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!kakaoReady || userAddress === '위치 미설정') return;

    window.kakao.maps.load(() => {
      const geocoder = new window.kakao.maps.services.Geocoder();

      geocoder.addressSearch(userAddress, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
          const { y: lat, x: lng } = result[0];
          setUserLat(parseFloat(lat));
          setUserLng(parseFloat(lng));
          console.log(`주소 "${userAddress}" → 좌표: (${lat}, ${lng})`);
        } else {
          alert('주소를 찾을 수 없습니다. 다시 확인해주세요.');
          console.error('주소 검색 실패:', status);
        }
      });
    });
  }, [kakaoReady, userAddress]);

  // ─────────────────────────────────────────
  // D) 좌표 설정되면 → 내 구 찾기
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!kakaoReady || userLat === null || userLng === null) return;

    window.kakao.maps.load(() => {
      const geocoder = new window.kakao.maps.services.Geocoder();

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
  // E) 내 구가 설정되면 인접 구 찾기
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!myGu || !adminGus) return;

    const currentFeature = adminGus.features.find(
      (feature) => feature.properties.name === myGu
    );

    if (!currentFeature) {
      console.error(`GeoJSON에서 "${myGu}"를 찾을 수 없음`);
      setNearbyGus([]);
      return;
    }

    const getAdjacentGus = (currentFeature) => {
      const adjacent = [];
      adminGus.features.forEach((feature) => {
        if (feature.properties.name === myGu) return;
        const touches = turf.booleanTouches(currentFeature, feature);
        if (touches) {
          adjacent.push(feature.properties.name);
        }
      });
      return adjacent.slice(0, 2); // 최대 2개
    };

    const foundGus = getAdjacentGus(currentFeature);
    setNearbyGus(foundGus);
    console.log('인접 구:', foundGus);
  }, [myGu, adminGus]);

  // ─────────────────────────────────────────
  // F) Places keywordSearch + 거리 계산
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
          // 검색 성공: 각 place에 거리 계산
          const updatedData = data.map((place) => {
            const placeLat = parseFloat(place.y);
            const placeLng = parseFloat(place.x);

            // Turf로 거리 계산 (km 단위)
            const distKm = calculateDistance(userLat, userLng, placeLat, placeLng);
            const distStr = distKm.toFixed(1) + 'km';

            return {
              ...place,
              // UI에 표시할 거리 (문자열)
              distance: distStr,
              // 정렬용 숫자 (km)
              distanceValue: distKm,
            };
          });

          setLessonData(updatedData);
          console.log(`레슨 검색 결과 (${updatedData.length}개):`, updatedData);
        } else {
          // 검색 실패 시 샘플 데이터 
          const sampleData = [
            {
              id: 1,
              place_name: '레슨명 샘플1',
              distance: '2.5km',
              distanceValue: 2.5,
              star_rating: 4.5,
              reviews: 100,
              instructor: '샘플강사 A',
              road_address_name: '샘플1 골프장 도로명 주소',
              address_name: '샘플1 골프장 지번 주소',
              price: '50,000원',
              day: '월요일',
            },
            {
              id: 2,
              place_name: '레슨명 샘플2',
              distance: '3.2km',
              distanceValue: 3.2,
              star_rating: 4.2,
              reviews: 80,
              instructor: '샘플강사 B',
              road_address_name: '샘플2 골프장 도로명 주소',
              address_name: '샘플2 골프장 지번 주소',
              price: '55,000원',
              day: '화요일',
            },
            {
              id: 3,
              place_name: '레슨명 샘플3',
              distance: '1.8km',
              distanceValue: 1.8,
              star_rating: 4.8,
              reviews: 150,
              instructor: '샘플강사 C',
              road_address_name: '샘플3 골프장 도로명 주소',
              address_name: '샘플3 골프장 지번 주소',
              price: '60,000원',
              day: '수요일',
            },
            {
              id: 4,
              place_name: '레슨명 샘플4',
              distance: '4.0km',
              distanceValue: 4.0,
              star_rating: 4.0,
              reviews: 60,
              instructor: '샘플강사 D',
              road_address_name: '샘플4 골프장 도로명 주소',
              address_name: '샘플4 골프장 지번 주소',
              price: '45,000원',
              day: '목요일',
            },
            {
              id: 5,
              place_name: '레슨명 샘플5',
              distance: '2.0km',
              distanceValue: 2.0,
              star_rating: 4.7,
              reviews: 120,
              instructor: '샘플강사 E',
              road_address_name: '샘플5 골프장 도로명 주소',
              address_name: '샘플5 골프장 지번 주소',
              price: '70,000원',
              day: '금요일',
            },
          ];
          setLessonData(sampleData);
          console.warn('레슨 검색 실패, 샘플 데이터 사용:', status);
        }
      }, options);
    });
  }, [kakaoReady, category, userLat, userLng]);

  // Turf distance 계산 함수 (km 단위)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const from = turf.point([lng1, lat1]);
    const to = turf.point([lng2, lat2]);
    const options = { units: 'kilometers' };
    return turf.distance(from, to, options); // km
  };

  // 뒤로가기 버튼
  const handleBack = () => {
    navigate(-1);
  };

  // ─────────────────────────────────────────
  // 가까운 순 정렬 버튼
  // ─────────────────────────────────────────
  const handleSortByNearest = () => {
    if (lessonData.length === 0) return;
    const sorted = [...lessonData].sort((a, b) => {
      const distA = a.distanceValue || parseFloat(a.distance) || 999999;
      const distB = b.distanceValue || parseFloat(b.distance) || 999999;
      return distA - distB;
    });
    setLessonData(sorted);
  };

  // ─────────────────────────────────────────
  // 장바구니에 담기 함수
  // ─────────────────────────────────────────
  const addToCart = (lesson) => {
    setCart((prevCart) => {
      // 중복 체크: 이미 있는 레슨이면 추가하지 않음
      if (prevCart.some((item) => item.id === lesson.id)) {
        alert('이미 장바구니에 추가된 레슨입니다.');
        return prevCart;
      }
      const updatedCart = [...prevCart, lesson];
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  return (
    <div style={styles.container}>
      {/* 상단 바 */}
      <div style={styles.topBar}>
        <button style={styles.backButton} onClick={handleBack}>
          〈
        </button>
        <h1 style={styles.title}>{userAddress}</h1>
        <button style={styles.cartButton} onClick={() => navigate('/cart')}>
          🛒  ({cart.length})
        </button>
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

      {/* 인접 구 버튼 */}
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

      {/* 정렬 버튼들 */}
      <div style={styles.sortButtons}>
        <button style={styles.sortButton}>추천순</button>
        <button style={styles.sortButton}>인기순</button>
        <button style={styles.sortButton} onClick={handleSortByNearest}>
          가까운 순
        </button>
      </div>

      {/* 레슨 목록 */}
      <div style={styles.lessonList}>
        {lessonData.length === 0 ? (
          <div style={{ padding: '10px' }}>레슨 정보를 찾을 수 없습니다.</div>
        ) : (
          lessonData.map((place, idx) => (
            <div key={place.id || idx} style={styles.lessonItem}>
              <div style={styles.imageBox}>이미지</div>
              <div style={styles.lessonInfo}>
                <div style={styles.lessonName}>
                  {place.place_name}
                  <span style={styles.star}>★</span> ({place.reviews}+)
                </div>
                <div style={styles.lessonDetails}>
                  {place.instructor} &nbsp;&nbsp; {place.distance} &nbsp;&nbsp; 
                  {place.road_address_name || place.address_name}
                </div>
                {/* 가격과 요일 추가 */}
                <div style={styles.lessonExtra}>
                  <span style={styles.price}>{place.price}</span> &nbsp;&nbsp;
                  <span style={styles.day}>{place.day}</span>
                </div>
              </div>
              <button style={styles.cartButton} onClick={() => addToCart(place)}>
                🛒 장바구니 담기
              </button>
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
  lessonExtra: {
    fontSize: '14px',
    color: '#555',
    marginTop: '5px',
  },
  price: {
    fontWeight: 'bold',
  },
  day: {
    fontStyle: 'italic',
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
