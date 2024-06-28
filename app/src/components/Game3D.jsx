import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Game3D = () => {
  const mountRef = useRef(null);
  const playerRef = useRef({ health: 5, position: new THREE.Vector3() });
  const enemiesRef = useRef([]);
  const bulletsRef = useRef([]);
  const gameOverRef = useRef(false);

  useEffect(() => {
    // Three.jsのセットアップ
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // mountRef.currentを一時変数にコピー
    const currentMount = mountRef.current;
    currentMount.appendChild(renderer.domElement);

    // プレイヤーの作成
    const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
    const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
    scene.add(playerMesh);
    camera.position.z = 5;

    // 敵の作成
    const createEnemy = () => {
      const enemyGeometry = new THREE.BoxGeometry(1, 1, 1);
      const enemyMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const enemyMesh = new THREE.Mesh(enemyGeometry, enemyMaterial);
      enemyMesh.position.set(
        Math.random() * 10 - 5,
        Math.random() * 10 - 5,
        Math.random() * 10 - 15
      );
      scene.add(enemyMesh);
      enemiesRef.current.push(enemyMesh);
    };

    // 初期敵の生成
    for (let i = 0; i < 5; i++) {
      createEnemy();
    }

    // キー入力の処理
    const handleKeyDown = (e) => {
      const speed = 0.1;
      switch(e.key) {
        case 'w': playerMesh.position.z -= speed; break;
        case 's': playerMesh.position.z += speed; break;
        case 'a': playerMesh.position.x -= speed; break;
        case 'd': playerMesh.position.x += speed; break;
      }
      playerRef.current.position.copy(playerMesh.position);
    };

    // 弾の発射
    const handleShoot = (event) => {
      const bulletGeometry = new THREE.SphereGeometry(0.1, 32, 32);
      const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      const bulletMesh = new THREE.Mesh(bulletGeometry, bulletMaterial);
      bulletMesh.position.copy(playerMesh.position);

      // マウス位置に基づいて弾の方向を計算
      const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      bulletMesh.velocity = raycaster.ray.direction.multiplyScalar(0.5);

      scene.add(bulletMesh);
      bulletsRef.current.push(bulletMesh);
    };

    // イベントリスナーの追加
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleShoot);

    // ゲームループ
    const animate = () => {
      if (gameOverRef.current) return;

      // 弾の移動と衝突判定
      bulletsRef.current.forEach((bullet, bulletIndex) => {
        bullet.position.add(bullet.velocity);

        // 画面外に出た弾を削除
        if (bullet.position.length() > 100) {
          scene.remove(bullet);
          bulletsRef.current.splice(bulletIndex, 1);
        }

        // 敵との衝突判定
        enemiesRef.current.forEach((enemy, enemyIndex) => {
          if (bullet.position.distanceTo(enemy.position) < 1) {
            scene.remove(enemy);
            scene.remove(bullet);
            enemiesRef.current.splice(enemyIndex, 1);
            bulletsRef.current.splice(bulletIndex, 1);
            createEnemy(); // 新しい敵を生成
          }
        });
      });

      // 敵の移動と攻撃
      enemiesRef.current.forEach((enemy) => {
        enemy.position.x += (Math.random() - 0.5) * 0.1;
        enemy.position.y += (Math.random() - 0.5) * 0.1;
        enemy.position.z += (Math.random() - 0.5) * 0.1;

        // プレイヤーとの衝突判定
        if (enemy.position.distanceTo(playerMesh.position) < 1) {
          playerRef.current.health -= 1;
          if (playerRef.current.health <= 0) {
            gameOverRef.current = true;
            console.log("Game Over");
          }
        }
      });

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // クリーンアップ
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleShoot);
      currentMount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef}></div>;
};

export default Game3D;


// import { useEffect, useRef } from 'react';
// import * as THREE from 'three';

// const Game3D = () => {
//   const mountRef = useRef(null);
//   const playerRef = useRef({ health: 5, position: new THREE.Vector3() });
//   const enemiesRef = useRef([]);
//   const bulletsRef = useRef([]);
//   const gameOverRef = useRef(false);

//   useEffect(() => {
//     // Three.jsのセットアップ
//     const scene = new THREE.Scene();
//     const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//     const renderer = new THREE.WebGLRenderer();
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     mountRef.current.appendChild(renderer.domElement);

//     // プレイヤーの作成
//     const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
//     const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
//     const playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
//     scene.add(playerMesh);
//     camera.position.z = 5;

//     // 敵の作成
//     const createEnemy = () => {
//       const enemyGeometry = new THREE.BoxGeometry(1, 1, 1);
//       const enemyMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
//       const enemyMesh = new THREE.Mesh(enemyGeometry, enemyMaterial);
//       enemyMesh.position.set(
//         Math.random() * 10 - 5,
//         Math.random() * 10 - 5,
//         Math.random() * 10 - 15
//       );
//       scene.add(enemyMesh);
//       enemiesRef.current.push(enemyMesh);
//     };

//     // 初期敵の生成
//     for (let i = 0; i < 5; i++) {
//       createEnemy();
//     }

//     // キー入力の処理
//     const handleKeyDown = (e) => {
//       const speed = 0.1;
//       switch(e.key) {
//         case 'w': playerMesh.position.z -= speed; break;
//         case 's': playerMesh.position.z += speed; break;
//         case 'a': playerMesh.position.x -= speed; break;
//         case 'd': playerMesh.position.x += speed; break;
//       }
//       playerRef.current.position.copy(playerMesh.position);
//     };

//     // 弾の発射
//     const handleShoot = (event) => {
//       const bulletGeometry = new THREE.SphereGeometry(0.1, 32, 32);
//       const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
//       const bulletMesh = new THREE.Mesh(bulletGeometry, bulletMaterial);
//       bulletMesh.position.copy(playerMesh.position);

//       // マウス位置に基づいて弾の方向を計算
//       const mouse = new THREE.Vector2(
//         (event.clientX / window.innerWidth) * 2 - 1,
//         -(event.clientY / window.innerHeight) * 2 + 1
//       );
//       const raycaster = new THREE.Raycaster();
//       raycaster.setFromCamera(mouse, camera);
//       bulletMesh.velocity = raycaster.ray.direction.multiplyScalar(0.5);

//       scene.add(bulletMesh);
//       bulletsRef.current.push(bulletMesh);
//     };

//     // イベントリスナーの追加
//     window.addEventListener('keydown', handleKeyDown);
//     window.addEventListener('click', handleShoot);

//     // ゲームループ
//     const animate = () => {
//       if (gameOverRef.current) return;

//       // 弾の移動と衝突判定
//       bulletsRef.current.forEach((bullet, bulletIndex) => {
//         bullet.position.add(bullet.velocity);

//         // 画面外に出た弾を削除
//         if (bullet.position.length() > 100) {
//           scene.remove(bullet);
//           bulletsRef.current.splice(bulletIndex, 1);
//         }

//         // 敵との衝突判定
//         enemiesRef.current.forEach((enemy, enemyIndex) => {
//           if (bullet.position.distanceTo(enemy.position) < 1) {
//             scene.remove(enemy);
//             scene.remove(bullet);
//             enemiesRef.current.splice(enemyIndex, 1);
//             bulletsRef.current.splice(bulletIndex, 1);
//             createEnemy(); // 新しい敵を生成
//           }
//         });
//       });

//       // 敵の移動と攻撃
//       enemiesRef.current.forEach((enemy) => {
//         enemy.position.x += (Math.random() - 0.5) * 0.1;
//         enemy.position.y += (Math.random() - 0.5) * 0.1;
//         enemy.position.z += (Math.random() - 0.5) * 0.1;

//         // プレイヤーとの衝突判定
//         if (enemy.position.distanceTo(playerMesh.position) < 1) {
//           playerRef.current.health -= 1;
//           if (playerRef.current.health <= 0) {
//             gameOverRef.current = true;
//             console.log("Game Over");
//           }
//         }
//       });

//       renderer.render(scene, camera);
//       requestAnimationFrame(animate);
//     };

//     animate();

//     // クリーンアップ
//     return () => {
//       window.removeEventListener('keydown', handleKeyDown);
//       window.removeEventListener('click', handleShoot);
//       mountRef.current.removeChild(renderer.domElement);
//     };
//   }, []);

//   return <div ref={mountRef}></div>;
// };

// export default Game3D;