// src/RegionDetailScreen.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// 로컬 스토리지 키들
const STORAGE_KEY = 'savedAddresses';
const SELECTED_KEY = 'selectedAddress';

const RegionDetailScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ------------------------------------------
  // 1) 로컬 스토리지에서 주소 목록 불러오기
  // ------------------------------------------
  const [savedAddresses, setSavedAddresses] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (err) {
        console.error('로컬 스토리지 파싱 오류:', err);
      }
    }
    return [];
  });

  // 2) 카카오맵 라이브러리 준비 여부
  const [kakaoReady, setKakaoReady] = useState(false);

  // 3) 검색창 텍스트
  const [searchText, setSearchText] = useState('');

  // 4) 편집 모드 토글
  const [isEditMode, setIsEditMode] = useState(false);

  // 5) 현재 수정 중인 주소 인덱스, 수정 텍스트
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState('');

  // --------------------------------------------------
  // (A) 컴포넌트 마운트 시 카카오맵 라이브러리 체크
  // --------------------------------------------------
  useEffect(() => {
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      setKakaoReady(true);
    } else {
      console.warn('카카오맵이 아직 준비되지 않았습니다.');
    }
    // 초기 로드(로컬 스토리지)는 useState에서 이미 처리
  }, []);

  // --------------------------------------------------
  // (B) savedAddresses가 바뀔 때마다 로컬 스토리지에 저장
  // --------------------------------------------------
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedAddresses));
      console.log('Saving savedAddresses to localStorage:', savedAddresses);
    } catch (err) {
      console.error('로컬 스토리지 저장 오류:', err);
    }
  }, [savedAddresses]);

  // --------------------------------------------------
  // (C) location(라우터 state)이 변경될 때마다 주소 재로드
  //     뒤로가기나 다른 라우트 변화에 대응 (선택 사항)
  // --------------------------------------------------
  useEffect(() => {
    loadAddressesFromStorage();
  }, [location]);

  // 로컬 스토리지에서 다시 읽어오는 함수
  const loadAddressesFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('Loaded addresses from storage:', parsed);
        if (Array.isArray(parsed)) {
          setSavedAddresses(parsed);
        }
      }
    } catch (err) {
      console.error('로컬 스토리지 파싱 오류:', err);
    }
  };

  // ------------------------------------------
  // (1) 주소 검색
  // ------------------------------------------
  const handleSearch = () => {
    if (!searchText) {
      alert('검색어를 입력하세요.');
      return;
    }
    if (!kakaoReady) {
      alert('카카오맵 라이브러리가 아직 준비되지 않았습니다.');
      return;
    }

    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.addressSearch(searchText, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const first = result[0];
        if (!first) {
          alert('검색 결과가 없습니다.');
          return;
        }
        const road = first.road_address?.address_name;
        const jibun = first.address?.address_name;
        const finalAddr = road || jibun || '알 수 없는 주소';

        if (savedAddresses.includes(finalAddr)) {
          alert('이미 저장된 주소입니다!');
          return;
        }
        setSavedAddresses((prev) => [...prev, finalAddr]);
      } else {
        alert('검색 결과가 없습니다.');
      }
    });
  };

  // ------------------------------------------
  // (2) 현재 위치로 추가
  // ------------------------------------------
  const handleAddCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('이 브라우저는 위치 정보를 지원하지 않습니다.');
      return;
    }
    if (!kakaoReady) {
      alert('카카오맵 라이브러리가 아직 준비되지 않았습니다.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.coord2Address(longitude, latitude, (result, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const road = result[0].road_address?.address_name;
            const jibun = result[0].address?.address_name;
            const finalAddr = road || jibun || '알 수 없는 위치';

            if (savedAddresses.includes(finalAddr)) {
              alert('이미 저장된 주소입니다!');
              return;
            }
            setSavedAddresses((prev) => [...prev, finalAddr]);
          } else {
            alert('현재 위치 주소를 찾지 못했습니다.');
          }
        });
      },
      (err) => {
        console.error('위치 권한 거부/오류:', err);
        alert('위치 권한이 거부되었거나 오류가 발생했습니다.');
      }
    );
  };

  // ------------------------------------------
  // (3) 주소 선택 → CategoryScreen으로 이동
  // ------------------------------------------
  const handleSelectAddress = (addr) => {
    if (isEditMode) return; // 편집 모드 중에는 선택 막기
    localStorage.setItem(SELECTED_KEY, addr);
    // CategoryScreen에 { selectedAddress: addr }를 넘겨서 상단에 표시
    navigate('/category', { state: { selectedAddress: addr } });
  };

  // ------------------------------------------
  // (4) 편집 모드 토글
  // ------------------------------------------
  const toggleEditMode = () => {
    if (isEditMode) {
      // 편집 모드 종료 시, 수정 상태 초기화
      setEditingIndex(null);
      setEditingText('');
    }
    setIsEditMode(!isEditMode);
  };

  // ------------------------------------------
  // (5) 주소 삭제
  // ------------------------------------------
  const handleDeleteAddress = (index) => {
    const confirmDelete = window.confirm('정말 이 주소를 삭제하시겠습니까?');
    if (confirmDelete) {
      setSavedAddresses((prev) => prev.filter((_, idx) => idx !== index));
    }
  };

  // ------------------------------------------
  // (6) 주소 수정
  // ------------------------------------------
  const handleEditAddress = (index) => {
    setEditingIndex(index);
    setEditingText(savedAddresses[index]);
  };

  // 수정 완료 저장
  const handleSaveEdit = (index) => {
    if (!editingText.trim()) {
      alert('주소를 입력하세요.');
      return;
    }
    if (savedAddresses.includes(editingText.trim())) {
      alert('이미 저장된 주소입니다!');
      return;
    }
    const updated = [...savedAddresses];
    updated[index] = editingText.trim();
    setSavedAddresses(updated);
    setEditingIndex(null);
    setEditingText('');
  };

  // 수정 취소
  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingText('');
  };

  return (
    <div style={styles.container}>
      {/* 상단 바 */}
      <div style={styles.topBar}>
        <div style={styles.leftSection}>
          {/* 뒤로가기 버튼 */}
          <button style={styles.backButton} onClick={() => navigate(-1)}>
            〈
          </button>
          <h1 style={styles.headerTitle}>주소 설정</h1>
        </div>
        {/* 편집 모드 토글 버튼 (완료/편집) */}
        <span style={styles.editText} onClick={toggleEditMode}>
          {isEditMode ? '완료' : '편집'}
        </span>
      </div>

      {/* 검색 영역 */}
      <div style={styles.searchContainer}>
        <div style={{ display: 'flex', gap: '6px', width: '90%', maxWidth: '500px' }}>
          <input
            type="text"
            placeholder="도로명 또는 지번 검색"
            style={styles.searchInput}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
          />
          <button style={styles.searchButton} onClick={handleSearch}>
            검색
          </button>
        </div>
        <button style={styles.currentLocationButton} onClick={handleAddCurrentLocation}>
          현재 위치로 추가
        </button>
      </div>

      {/* 저장된 주소 목록 */}
      <div style={styles.addressList}>
        {savedAddresses.length === 0 ? (
          <div>아직 저장된 주소가 없습니다.</div>
        ) : (
          savedAddresses.map((addr, idx) => (
            <div key={idx} style={styles.addressItem}>
              {isEditMode ? (
                <>
                  {/* 편집 모드일 때 */}
                  {editingIndex === idx ? (
                    <>
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        style={styles.editInput}
                      />
                      <div style={styles.editButtons}>
                        <button
                          style={styles.saveButton}
                          onClick={() => handleSaveEdit(idx)}
                        >
                          저장
                        </button>
                        <button
                          style={styles.cancelButton}
                          onClick={handleCancelEdit}
                        >
                          취소
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span
                        onClick={() => handleEditAddress(idx)}
                        style={styles.addressText}
                      >
                        {addr}
                      </span>
                      <button
                        style={styles.deleteButton}
                        onClick={() => handleDeleteAddress(idx)}
                      >
                        삭제
                      </button>
                    </>
                  )}
                </>
              ) : (
                // 편집 모드가 아닐 때 → 주소 클릭 시 선택
                <span
                  onClick={() => handleSelectAddress(addr)}
                  style={styles.addressText}
                >
                  {addr}
                </span>
              )}
            </div>
          ))
        )}
      </div>

      {/* 하단 고정 바 */}
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
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  backButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
  },
  headerTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 'bold',
  },
  editText: {
    fontSize: '16px',
    cursor: 'pointer',
    userSelect: 'none',
  },
  searchContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    gap: '10px',
  },
  searchInput: {
    flex: 1,
    padding: '10px 15px',
    fontSize: '16px',
    borderRadius: '24px',
    border: '1px solid #ccc',
    outline: 'none',
  },
  searchButton: {
    padding: '0 14px',
    border: 'none',
    borderRadius: '24px',
    backgroundColor: '#fff9c4',
    cursor: 'pointer',
    fontSize: '16px',
  },
  currentLocationButton: {
    width: '90%',
    maxWidth: '500px',
    padding: '10px 0',
    fontSize: '16px',
    backgroundColor: '#eee',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  addressList: {
    padding: '10px 20px',
  },
  addressItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '8px',
    marginBottom: '6px',
    cursor: 'pointer',
    backgroundColor: '#f9f9f9',
  },
  addressText: {
    flex: 1,
    cursor: 'pointer',
    userSelect: 'none',
  },
  deleteButton: {
    backgroundColor: '#e57373',
    border: 'none',
    color: '#fff',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginLeft: '10px',
  },
  editInput: {
    flex: 1,
    padding: '6px 10px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    outline: 'none',
  },
  editButtons: {
    display: 'flex',
    gap: '6px',
    marginLeft: '10px',
  },
  saveButton: {
    backgroundColor: '#81c784',
    border: 'none',
    color: '#fff',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    border: 'none',
    color: '#333',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
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

export default RegionDetailScreen;
