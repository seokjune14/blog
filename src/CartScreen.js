// CartScreen.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CartScreen = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [selectedItems, setSelectedItems] = useState([]); // 선택된 아이템 ID

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]); // 모두 해제
    } else {
      setSelectedItems(cart.map((item) => item.id)); // 모두 선택
    }
  };

  // 개별 선택/해제
  const toggleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  // 선택 항목 삭제
  const removeSelectedItems = () => {
    const updatedCart = cart.filter((item) => !selectedItems.includes(item.id));
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    setSelectedItems([]); // 선택 목록 초기화
  };

  return (
    <div style={styles.container}>
      {/* 상단 바 */}
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          〈
        </button>
        <h2>장바구니</h2>
        <button onClick={removeSelectedItems} style={styles.removeButton}>
          선택삭제
        </button>
      </div>

      {/* 전체 선택 */}
      <div style={styles.selectAllContainer}>
        <label>
          <input
            type="checkbox"
            checked={selectedItems.length === cart.length && cart.length > 0}
            onChange={handleSelectAll}
          />
          전체 선택 ({selectedItems.length}/{cart.length})
        </label>
      </div>

      {/* 장바구니 목록 */}
      {cart.length === 0 ? (
        <p style={styles.emptyMessage}>장바구니가 비어 있습니다.</p>
      ) : (
        cart.map((lesson) => (
          <div key={lesson.id} style={styles.cartItem}>
            <label>
              <input
                type="checkbox"
                checked={selectedItems.includes(lesson.id)}
                onChange={() => toggleSelectItem(lesson.id)}
              />
            </label>
            <div style={styles.lessonInfo}>
              <h3 style={styles.lessonTitle}>{lesson.place_name}</h3>
              {/* lesson.details가 있으면 표시 */}
              {lesson.details && (
                <p style={styles.lessonDetails}>{lesson.details}</p>
              )}
              {lesson.price && (
                <p style={styles.lessonPrice}>가격: {lesson.price}</p>
              )}
              {lesson.day && (
                <p style={styles.lessonDay}>요일: {lesson.day}</p>
              )}
            </div>
            <div style={styles.imageBox}>이미지</div>
          </div>
        ))
      )}

      {/* 결제 버튼 */}
      <button style={styles.paymentButton}>결제하기</button>

      {/* 하단 네비게이션 */}
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
    backgroundColor: '#ffffff', // 배경색만 흰색
    minHeight: '100vh',
    paddingBottom: '60px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: '#fff9c4', // 기존 색상 유지 (헤더)
    borderBottom: '1px solid #ccc',
  },
  backButton: {
    fontSize: '20px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
  },
  removeButton: {
    fontSize: '16px',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'red',
    cursor: 'pointer',
  },
  selectAllContainer: {
    padding: '10px 20px',
  },
  cartItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    borderBottom: '1px solid #ddd',
    backgroundColor: '#fff', // 아이템 배경
  },
  lessonInfo: {
    flex: 1,
    paddingLeft: '10px',
  },
  lessonTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '0 0 5px',
  },
  lessonDetails: {
    fontSize: '14px',
    color: '#555',
    margin: '0 0 5px',
  },
  lessonPrice: {
    fontSize: '14px',
    color: '#000',
    margin: '0 0 5px',
  },
  lessonDay: {
    fontSize: '14px',
    color: '#333',
    margin: 0,
  },
  imageBox: {
    width: '50px',
    height: '50px',
    backgroundColor: '#ddd',
    borderRadius: '5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
  },
  paymentButton: {
    width: '100%',
    padding: '15px 0',
    fontSize: '18px',
    fontWeight: 'bold',
    backgroundColor: '#fff9c4', // 결제 버튼 색상 유지
    border: 'none',
    cursor: 'pointer',
    position: 'fixed',
    bottom: '60px',
  },
  bottomNav: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff9c4', // 하단 네비게이션 색상 유지
    padding: '10px 0',
    position: 'fixed',
    bottom: 0,
    width: '100%',
    borderTop: '1px solid #ccc',
  },
  navButton: {
    fontSize: '20px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
  emptyMessage: {
    textAlign: 'center',
    padding: '20px 0',
    fontSize: '16px',
  },
};

export default CartScreen;
