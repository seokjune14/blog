// src/LessonDetailScreen.js

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const LessonDetailScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // LessonListScreen에서 넘겨받은 lesson 객체
  const lesson = location.state?.lesson;

  // lesson 정보가 없으면 예외 처리
  if (!lesson) {
    return (
      <div style={styles.container}>
        <p>레슨 정보가 없습니다. 다시 시도해주세요.</p>
      </div>
    );
  }

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
        {/* 오른쪽 상단 아이콘들 (공유, 장바구니, 좋아요 등) */}
        <div style={styles.topBarIcons}>
          <button style={styles.iconButton} onClick={() => alert('공유')}>
            ⤴
          </button>
          <button style={styles.iconButton} onClick={() => alert('장바구니')}>
            🛒
          </button>
          <button style={styles.iconButton} onClick={() => alert('좋아요')}>
            ❤️
          </button>
        </div>
      </div>

      {/* 상단 영역: 별점, 리뷰수, 골프장 위치 */}
      <div style={styles.profileSection}>
        <div style={styles.profileRating}>
          <span style={styles.star}>★</span> {lesson.star_rating} 리뷰 {lesson.reviews}+개
        </div>
        <div style={styles.profilePicture}>
          <div style={styles.profileImage}>이미지</div>
        </div>
        <div style={styles.profileFacility}>
          {lesson.road_address_name || lesson.address_name}
        </div>
      </div>

      {/* 레슨 제목, 강사 이름, 가격 */}
      <div style={styles.mainInfoSection}>
        <div style={styles.instructorText}>강사이름 &gt; {lesson.instructor}</div>
        <div style={styles.lessonName}>{lesson.place_name}</div>
        <div style={styles.lessonPrice}>{lesson.price || '가격 정보 없음'}</div>
      </div>

      {/* 상세 설명 */}
      <div style={styles.descriptionSection}>
        <div style={styles.descriptionBox}>
          <strong>레슨 설명</strong>
          <div style={{ marginTop: '6px' }}>{lesson.description || '없음'}</div>
        </div>
        <div style={styles.descriptionBox}>
          <strong>강사 경력 및 자격증</strong>
          <div style={{ marginTop: '6px' }}>
            {lesson.instructor_career || '정보 없음'}
          </div>
        </div>
      </div>

      {/* 시간 버튼 (예시) */}
      <button style={styles.timeButton}>시간</button>

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
    paddingBottom: '60px', // 하단 바 높이
    margin: 0,
  },
  topBar: {
    backgroundColor: '#fff9c4',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 20px',
    borderBottom: '1px solid #ccc',
  },
  backButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
  },
  topBarIcons: {
    display: 'flex',
    gap: '10px',
  },
  iconButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
  },
  profileSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '20px',
  },
  profileRating: {
    fontSize: '16px',
    marginBottom: '10px',
  },
  star: {
    color: '#fbc02d',
    marginRight: '5px',
  },
  profilePicture: {
    display: 'flex',
    alignItems: 'center',
  },
  profileImage: {
    width: '80px',
    height: '80px',
    backgroundColor: '#ccc',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileFacility: {
    marginTop: '10px',
    fontSize: '14px',
    color: '#777',
  },
  mainInfoSection: {
    margin: '20px',
    textAlign: 'center',
  },
  instructorText: {
    marginBottom: '5px',
    fontSize: '14px',
    color: '#333',
  },
  lessonName: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '10px',
    border: '1px solid #000',
    borderRadius: '24px',
    display: 'inline-block',
    padding: '5px 20px',
  },
  lessonPrice: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginTop: '10px',
  },
  descriptionSection: {
    margin: '0 20px 20px',
  },
  descriptionBox: {
    backgroundColor: '#f1f1f1',
    borderRadius: '8px',
    padding: '10px',
    marginBottom: '10px',
  },
  timeButton: {
    display: 'block',
    margin: '0 auto 20px',
    border: '1px solid #000',
    borderRadius: '24px',
    backgroundColor: '#fff',
    padding: '10px 20px',
    fontSize: '16px',
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

export default LessonDetailScreen;
