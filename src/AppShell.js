// src/AppShell.js
import React from 'react';
import { useNavigate, Outlet } from 'react-router-dom';

const AppShell = ({ headerExtra, children }) => {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    console.log("Home button clicked");
    navigate('/category');
  };

  return (
    <div>
      {/* 기본 공통 헤더 */}
      <header style={headerStyles}>
        <div style={headerLeftStyles}>
          <h1 style={{ margin: 0 }}>내 앱 제목</h1>
        </div>
        <div style={headerRightStyles}>
          <button style={cartButtonStyles} onClick={() => navigate('/cart')}>
            🛒 장바구니
          </button>
        </div>
      </header>

      {/* 선택적 추가 헤더 (예: CategoryScreen의 주소 정보) */}
      {headerExtra && <div style={headerExtraStyles}>{headerExtra}</div>}

      {/* 페이지별 내용 */}
      <main style={{ paddingBottom: '60px' }}>
        {children ? children : <Outlet />}
      </main>

      {/* 하단 내비게이션 바 */}
      <nav style={bottomNavStyles}>
        <button style={navButtonStyles} onClick={handleHomeClick}>
          🏠
        </button>
        <button style={navButtonStyles}>❤️</button>
        <button style={navButtonStyles}>📄</button>
        <button style={navButtonStyles}>MY</button>
      </nav>
    </div>
  );
};

const headerStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 20px',
  backgroundColor: '#fff9c4',
  borderBottom: '1px solid #ccc',
};

const headerLeftStyles = {
  flex: 1,
};

const headerRightStyles = {
  display: 'flex',
  gap: '10px',
};

const cartButtonStyles = {
  backgroundColor: 'transparent',
  border: 'none',
  fontSize: '20px',
  cursor: 'pointer',
};

const headerExtraStyles = {
  padding: '10px 20px',
  backgroundColor: '#fff9c4',
  borderBottom: '1px solid #ccc',
};

const bottomNavStyles = {
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
};

const navButtonStyles = {
  fontSize: '20px',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
};

export default AppShell;
