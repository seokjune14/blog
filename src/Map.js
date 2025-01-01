import React, { useEffect, useRef, useState } from 'react';

const Map = () => {
    const mapContainerRef = useRef(null); // 지도를 표시할 div를 참조하기 위한 ref
    const mapRef = useRef(null); // 지도 인스턴스를 저장하기 위한 ref
    const markerRef = useRef(null); // 마커 인스턴스를 저장하기 위한 ref
    const [currentPosition, setCurrentPosition] = useState(null); // 현재 위치 상태
    const [permissionStatus, setPermissionStatus] = useState(null); // 권한 상태

    // 1. 지도 로드 및 초기화 useEffect
    useEffect(() => {
        const loadMap = () => {
            if (window.kakao && window.kakao.maps) {
                window.kakao.maps.load(() => {
                    console.log('카카오 지도 API 로드 완료');

                    const container = mapContainerRef.current;
                    if (!container) {
                        console.error('지도 컨테이너를 찾을 수 없습니다.');
                        return;
                    }

                    // 초기 위치 설정 (기본값 또는 현재 위치)
                    const defaultLat = 35.88096;
                    const defaultLng = 128.7159808;
                    const center = currentPosition
                        ? new window.kakao.maps.LatLng(currentPosition.lat, currentPosition.lng)
                        : new window.kakao.maps.LatLng(defaultLat, defaultLng);

                    const options = {
                        center: center,
                        level: 3
                    };

                    // 지도 인스턴스 생성 및 저장 (한 번만 생성)
                    if (!mapRef.current) { // 지도가 아직 생성되지 않았다면
                        const map = new window.kakao.maps.Map(container, options);
                        mapRef.current = map;

                        // 마커 설정 및 저장
                        const markerPosition = currentPosition
                            ? new window.kakao.maps.LatLng(currentPosition.lat, currentPosition.lng)
                            : new window.kakao.maps.LatLng(defaultLat, defaultLng);

                        const marker = new window.kakao.maps.Marker({
                            position: markerPosition,
                            map: map
                        });
                        markerRef.current = marker;

                        console.log('지도 및 마커 생성 완료!');
                    } else { // 지도가 이미 생성되었다면
                        const newCenter = currentPosition
                            ? new window.kakao.maps.LatLng(currentPosition.lat, currentPosition.lng)
                            : new window.kakao.maps.LatLng(defaultLat, defaultLng);

                        mapRef.current.setCenter(newCenter);

                        if (markerRef.current) {
                            const newPosition = currentPosition
                                ? new window.kakao.maps.LatLng(currentPosition.lat, currentPosition.lng)
                                : new window.kakao.maps.LatLng(defaultLat, defaultLng);
                            markerRef.current.setPosition(newPosition);
                        }

                        console.log('지도 중심 및 마커 위치 업데이트 완료!');
                    }
                });
            } else {
                console.error('카카오 지도 API 로드 실패');
            }
        };

        const scriptSrc = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=d808d4a8427f820f4844d337152cb842&autoload=false&libraries=clusterer,services`;

        if (!document.querySelector(`script[src="${scriptSrc}"]`)) {
            const script = document.createElement('script');
            script.src = scriptSrc;
            // async 속성 제거하여 동기적으로 로드
            script.onload = loadMap;
            script.onerror = () => {
                console.error('카카오 지도 API 스크립트 로드 실패');
            };
            document.body.appendChild(script);
        } else {
            console.log('카카오 지도 스크립트가 이미 로드됨');
            loadMap();
        }
    }, [currentPosition]); // currentPosition이 변경될 때마다 useEffect 실행

    // 2. 현재 위치 가져오기 useEffect
    useEffect(() => {
        // Geolocation API 사용하여 현재 위치 가져오기
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCurrentPosition({ lat: latitude, lng: longitude });
                    setPermissionStatus('granted');
                    console.log('현재 위치 가져오기 성공:', latitude, longitude);
                },
                (error) => {
                    console.error('현재 위치 가져오기 실패:', error);
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            setPermissionStatus('denied');
                            break;
                        case error.POSITION_UNAVAILABLE:
                            setPermissionStatus('unavailable');
                            break;
                        case error.TIMEOUT:
                            setPermissionStatus('timeout');
                            break;
                        default:
                            setPermissionStatus('unknown');
                            break;
                    }
                }
            );
        } else {
            console.error('Geolocation을 지원하지 않는 브라우저입니다.');
            setPermissionStatus('unsupported');
        }
    }, []); // 컴포넌트 마운트 시 한 번 실행

    // 3. 실시간 위치 추적 useEffect
    useEffect(() => {
        let watchId;
        if (navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCurrentPosition({ lat: latitude, lng: longitude });
                    console.log('실시간 위치 업데이트:', latitude, longitude);

                    // 지도 중심 이동
                    if (mapRef.current) {
                        const newCenter = new window.kakao.maps.LatLng(latitude, longitude);
                        mapRef.current.setCenter(newCenter);
                    }

                    // 마커 위치 업데이트
                    if (markerRef.current) {
                        const newPosition = new window.kakao.maps.LatLng(latitude, longitude);
                        markerRef.current.setPosition(newPosition);
                    }
                },
                (error) => {
                    console.error('실시간 위치 업데이트 실패:', error);
                }
            );
        }

        return () => {
            if (watchId !== undefined) {
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, []);

    return (
        <div>
            <h2>현재 위치 지도</h2>
            {permissionStatus === 'denied' && (
                <p>위치 권한이 거부되었습니다. 지도를 표시할 수 없습니다.</p>
            )}
            {permissionStatus === 'unsupported' && (
                <p>이 브라우저는 위치 추적을 지원하지 않습니다.</p>
            )}
            <div 
                ref={mapContainerRef} 
                style={{ width: '100%', height: '500px', border: '1px solid black' }}
            ></div>
        </div>
    );
};

export default Map;
