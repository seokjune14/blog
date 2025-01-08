// src/CategoryScreen.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const CategoryScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // RegionDetailScreen에서 넘겨받은 주소
  const passedAddress = location.state?.selectedAddress;

  // 화면에 표시할 주소 (RegionDetailScreen에서 왔으면 해당 주소, 없으면 "위치 확인 중...")
  const [address, setAddress] = useState(passedAddress || '위치 확인 중...');

  useEffect(() => {
    // 만약 passedAddress가 없다면 지오로케이션으로 현재 위치를 가져옴
    if (!passedAddress) {
      if (!navigator.geolocation) {
        setAddress('이 브라우저는 위치 정보를 지원하지 않습니다.');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
            window.kakao.maps.load(() => {
              const geocoder = new window.kakao.maps.services.Geocoder();
              const coord = new window.kakao.maps.LatLng(latitude, longitude);

              geocoder.coord2Address(
                coord.getLng(),
                coord.getLat(),
                (result, status) => {
                  if (status === window.kakao.maps.services.Status.OK) {
                    // 도로명 주소가 있으면 사용, 아니면 지번 주소 사용
                    if (result[0].road_address) {
                      setAddress(result[0].road_address.address_name);
                    } else if (result[0].address) {
                      setAddress(result[0].address.address_name);
                    } else {
                      setAddress('알 수 없는 위치');
                    }
                  } else {
                    setAddress('역지오코딩 실패');
                  }
                }
              );
            });
          } else {
            setAddress('카카오 지도 라이브러리가 로드되지 않았습니다.');
          }
        },
        (error) => {
          console.error('위치 권한 거부/오류:', error);
          setAddress('위치 권한이 거부되었거나 오류가 발생했습니다.');
        }
      );
    }
  }, [passedAddress]);

  // 역삼각형 버튼 클릭 시 → regionDetail로 이동
  const handleTriangleClick = () => {
    navigate('/region-detail');
  };

  // 카테고리 버튼 클릭 시 → lesson-list로 이동 + 카테고리 state 전달
  const handleCategoryClick = (category) => {
    // 예: "/lesson-list" 라우트로 이동하고, { state: { category: '초보자' } } 같이 전달
    navigate('/lesson-list', { state: { category } });
  };

  return (
    <div style={styles.container}>
      {/* 상단 바 */}
      <div style={styles.topBar}>
        {/* 주소와 역삼각형 버튼 */}
        <div style={styles.regionContainer}>
          <h1 style={styles.regionName}>{address}</h1>
          <button
            style={styles.triangleButton}
            aria-label="지역 선택"
            onClick={handleTriangleClick}
          >
            ▼
          </button>
        </div>
        <div style={styles.topIcons}>
          <button style={styles.iconButton}>📅</button>
          <button style={styles.iconButton}>🔔</button>
          <button style={styles.iconButton}>🛒</button>
        </div>
      </div>

      {/* 2×2 정사각형 카테고리 영역 */}
      <div style={styles.categoryContainer}>
        {['초보자', '중급자', '전문가', '자격증'].map((category) => (
          <button
            key={category}
            style={styles.categoryButton}
            onClick={() => handleCategoryClick(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* 하단 고정 내비게이션 바 */}
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
    textAlign: 'center',
    backgroundColor: '#ffffff',
    minHeight: '100vh',
    paddingBottom: '60px',
    boxSizing: 'border-box',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: '#fff9c4',
    borderBottom: '1px solid #ccc',
    position: 'relative',
  },
  regionContainer: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
  },
  regionName: {
    fontSize: '20px',
    fontWeight: 'bold',
    margin: 0,
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    maxWidth: '300px',
    textAlign: 'left',
  },
  triangleButton: {
    marginLeft: '8px',
    fontSize: '16px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    color: '#000',
    lineHeight: 1,
  },
  topIcons: {
    display: 'flex',
    gap: '10px',
  },
  iconButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
  },
  categoryContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    padding: '20px',
    maxWidth: '400px',
    margin: '140px auto',
    width: '100%',
    boxSizing: 'border-box',
    transform: 'translateY(10px)',
  },
  categoryButton: {
    aspectRatio: '1',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 'bold',
    borderRadius: '8px',
    border: '2px solid #000',
    boxShadow: '3px 3px 6px rgba(0, 0, 0, 0.2)',
    backgroundColor: '#fff',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, background-color 0.2s ease',
  },
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: '#fff9c4',
    borderTop: '1px solid #ccc',
  },
  navButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
  },
};

export default CategoryScreen;
