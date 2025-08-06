"use client";

import * as React from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CUBIE_SIZE, CUBIE_GAP, solutionSteps, faceColors, colorMap } from '@/lib/cube-constants';
import type { RubiksCubeHandle } from '@/lib/types';

interface RubiksCubeViewProps {
  isRotating: boolean;
  setIsRotating: (isRotating: boolean) => void;
}

export const RubiksCubeView = React.forwardRef<RubiksCubeHandle, RubiksCubeViewProps>(({ isRotating, setIsRotating }, ref) => {
  const mountRef = React.useRef<HTMLDivElement>(null);
  
  // Using refs for three.js objects to prevent them from being re-created on every render
  const sceneRef = React.useRef<THREE.Scene>();
  const cameraRef = React.useRef<THREE.PerspectiveCamera>();
  const rendererRef = React.useRef<THREE.WebGLRenderer>();
  const controlsRef = React.useRef<OrbitControls>();
  const cubeGroupRef = React.useRef<THREE.Group>();
  const cubiesRef = React.useRef<THREE.Mesh[]>([]);
  const arrowHelperRef = React.useRef<THREE.Group | null>(null);

  const getInverseMove = (move: string): string => {
    if (move.endsWith("'")) return move.slice(0, -1);
    if (move.endsWith("2")) return move;
    return move + "'";
  };
  
  React.useImperativeHandle(ref, () => ({
    scramble: async () => {
      const fullSolution = solutionSteps.map(s => s.algorithm).join(' ');
      const scrambleMoves = fullSolution.split(' ').reverse().map(getInverseMove);
      
      for (const move of scrambleMoves) {
        if(move) await executeMove(move, 20);
      }
      
      const solutionSequence = fullSolution.split(' ').filter(m => m);
      return solutionSequence;
    },
    reset: () => {
      createRubiksCube();
    },
    executeMove: (move, duration) => {
        return executeMove(move, duration);
    },
    getInverseMove,
    getCubeState: async () => {
      let stateString = "Current cube state:\n";
      const worldVector = new THREE.Vector3();

      cubiesRef.current.forEach(cubie => {
          const pos = cubie.position.clone().divideScalar(CUBIE_SIZE + CUBIE_GAP).round();
          const stickers: string[] = [];
          
          cubie.children.forEach(sticker => {
              if (sticker instanceof THREE.Mesh) {
                  const stickerColorHex = (sticker.material as THREE.MeshStandardMaterial).color.getHex();
                  const colorName = colorMap[stickerColorHex] || 'unknown';

                  // Use object's world direction to determine face
                  sticker.getWorldDirection(worldVector);
                  worldVector.applyQuaternion(cubie.quaternion.clone().invert());
                  
                  let face = 'unknown';
                  if (worldVector.z > 0.9) face = 'front';
                  else if (worldVector.z < -0.9) face = 'back';
                  else if (worldVector.y > 0.9) face = 'top';
                  else if (worldVector.y < -0.9) face = 'bottom';
                  else if (worldVector.x > 0.9) face = 'right';
                  else if (worldVector.x < -0.9) face = 'left';

                  stickers.push(`${face}=${colorName}`);
              }
          });

          if(stickers.length > 0) {
            stateString += `Cubie at (${pos.x}, ${pos.y}, ${pos.z}): ${stickers.join(', ')}\n`;
          }
      });
      return stateString;
    },
  }));

  const createSticker = (color: number, face: string): THREE.Mesh => {
      const stickerGeometry = new THREE.PlaneGeometry(CUBIE_SIZE * 0.9, CUBIE_SIZE * 0.9);
      const sticker = new THREE.Mesh(stickerGeometry, new THREE.MeshStandardMaterial({ color, roughness: 0.2, side: THREE.DoubleSide }));
      const offset = CUBIE_SIZE / 2 + 0.001;
      switch(face) {
          case 'right': sticker.position.set(offset, 0, 0); sticker.rotation.y = Math.PI / 2; break;
          case 'left': sticker.position.set(-offset, 0, 0); sticker.rotation.y = -Math.PI / 2; break;
          case 'top': sticker.position.set(0, offset, 0); sticker.rotation.x = -Math.PI / 2; break;
          case 'bottom': sticker.position.set(0, -offset, 0); sticker.rotation.x = Math.PI / 2; break;
          case 'front': sticker.position.set(0, 0, offset); break;
          case 'back': sticker.position.set(0, 0, -offset); sticker.rotation.y = Math.PI; break;
      }
      return sticker;
  };

  const colorizeCubies = () => {
      cubiesRef.current.forEach(cubie => {
          while(cubie.children.length > 0){ cubie.remove(cubie.children[0]); }
          const pos = cubie.position.clone().normalize();
          if (pos.x > 0.5) cubie.add(createSticker(faceColors.right, 'right'));
          if (pos.x < -0.5) cubie.add(createSticker(faceColors.left, 'left'));
          if (pos.y > 0.5) cubie.add(createSticker(faceColors.top, 'top'));
          if (pos.y < -0.5) cubie.add(createSticker(faceColors.bottom, 'bottom'));
          if (pos.z > 0.5) cubie.add(createSticker(faceColors.front, 'front'));
          if (pos.z < -0.5) cubie.add(createSticker(faceColors.back, 'back'));
      });
  };

  const createRubiksCube = () => {
    if (cubeGroupRef.current) sceneRef.current?.remove(cubeGroupRef.current);
    cubeGroupRef.current = new THREE.Group();
    cubiesRef.current = [];
    const stickerMaterial = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.7, metalness: 0.1 });
    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
                if (x === 0 && y === 0 && z === 0) continue;
                const cubieGeometry = new THREE.BoxGeometry(CUBIE_SIZE, CUBIE_SIZE, CUBIE_SIZE);
                const cubie = new THREE.Mesh(cubieGeometry, stickerMaterial.clone());
                cubie.position.set(x, y, z).multiplyScalar(CUBIE_SIZE + CUBIE_GAP);
                cubiesRef.current.push(cubie);
                cubeGroupRef.current.add(cubie);
            }
        }
    }
    sceneRef.current?.add(cubeGroupRef.current);
    colorizeCubies();
  };
  
  const executeMove = (moveStr: string, duration = 300): Promise<void> => {
    return new Promise(resolve => {
      setIsRotating(true);
      if (arrowHelperRef.current) sceneRef.current?.remove(arrowHelperRef.current);
      if (duration > 100) showArrowForMove(moveStr[0], moveStr.includes("'") ? -1 : (moveStr.includes("2") ? 2 : 1));
      
      const face = moveStr[0].toUpperCase();
      const dir = moveStr.includes("'") ? -1 : (moveStr.includes("2") ? 2 : 1);
      const rotationMap: { [key: string]: { axis: 'x' | 'y' | 'z', layer: number, dir: number } } = {
          'U': { axis: 'y', layer: 1,  dir: -1 }, 'D': { axis: 'y', layer: -1, dir: 1 },
          'R': { axis: 'x', layer: 1,  dir: -1 }, 'L': { axis: 'x', layer: -1, dir: 1 },
          'F': { axis: 'z', layer: 1,  dir: -1 }, 'B': { axis: 'z', layer: -1, dir: 1 }
      };

      const moveParams = rotationMap[face];
      if (!moveParams) {
          console.warn(`Invalid move: ${face}`);
          setIsRotating(false);
          resolve();
          return;
      }

      const angle = dir * moveParams.dir * Math.PI / 2;
      const layer = cubiesRef.current.filter(c => Math.abs(c.position[moveParams.axis] / (CUBIE_SIZE + CUBIE_GAP) - moveParams.layer) < 0.1);
      rotateLayer(layer, moveParams.axis, angle, duration, resolve);
    });
  }

  const rotateLayer = (layer: THREE.Mesh[], axis: 'x' | 'y' | 'z', angle: number, duration: number, onComplete: () => void) => {
    const pivot = new THREE.Group();
    sceneRef.current?.add(pivot);
    layer.forEach(c => pivot.attach(c));
    const targetQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3().setComponent("xyz".indexOf(axis), 1), angle);
    const startQuaternion = pivot.quaternion.clone();
    let t = 0;
    const frameDuration = duration > 0 ? 1 / (duration / 1000 * 60) : 1;
    
    function animateRotation() {
        t += frameDuration;
        if (t >= 1) {
            pivot.quaternion.copy(targetQuaternion);
            finishRotation();
            return;
        }
        pivot.quaternion.slerp(targetQuaternion, t);
        requestAnimationFrame(animateRotation);
    }

    function finishRotation() {
        if (!cubeGroupRef.current || !sceneRef.current) return;
        pivot.updateMatrixWorld(true);
        while (pivot.children.length > 0) cubeGroupRef.current.attach(pivot.children[0]);
        sceneRef.current.remove(pivot);
        layer.forEach(c => c.position.round());
        if (arrowHelperRef.current) sceneRef.current.remove(arrowHelperRef.current);
        arrowHelperRef.current = null;
        setIsRotating(false);
        if (onComplete) onComplete();
    }

    if (duration > 0) animateRotation();
    else {
        pivot.quaternion.copy(targetQuaternion);
        finishRotation();
    }
  }

  const showArrowForMove = (face: string, direction: number) => {
      if (arrowHelperRef.current) sceneRef.current?.remove(arrowHelperRef.current);
      const color = 0x32d74b;
      const material = new THREE.LineBasicMaterial({ color: color, linewidth: 3 });
      const curve = new THREE.CubicBezierCurve3(
          new THREE.Vector3(-0.7, 0, 0), new THREE.Vector3(-1.2, 0, 0),
          new THREE.Vector3(-1.2, 1.2, 0), new THREE.Vector3(0, 1.2, 0)
      );
      const points = curve.getPoints(20);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, material);
      const coneGeometry = new THREE.ConeGeometry(0.2, 0.4, 16);
      const cone = new THREE.Mesh(coneGeometry, new THREE.MeshBasicMaterial({color: color}));
      cone.position.copy(points[points.length - 1]);
      const tangent = curve.getTangent(1);
      cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
      arrowHelperRef.current = new THREE.Group();
      arrowHelperRef.current.add(line);
      arrowHelperRef.current.add(cone);
      const pos = 1.6;
      const scale = 0.8;
      switch (face) {
          case 'F': arrowHelperRef.current.position.set(0, 0, pos); if (direction === -1) arrowHelperRef.current.rotation.z = Math.PI; break;
          case 'B': arrowHelperRef.current.position.set(0, 0, -pos); arrowHelperRef.current.rotation.y = Math.PI; if (direction === -1) arrowHelperRef.current.rotation.z = Math.PI; break;
          case 'U': arrowHelperRef.current.position.set(0, pos, 0); arrowHelperRef.current.rotation.x = -Math.PI / 2; if (direction === -1) arrowHelperRef.current.rotation.z = Math.PI; break;
          case 'D': arrowHelperRef.current.position.set(0, -pos, 0); arrowHelperRef.current.rotation.x = Math.PI / 2; if (direction === -1) arrowHelperRef.current.rotation.z = Math.PI; break;
          case 'R': arrowHelperRef.current.position.set(pos, 0, 0); arrowHelperRef.current.rotation.y = Math.PI / 2; if (direction === -1) arrowHelperRef.current.rotation.z = Math.PI; break;
          case 'L': arrowHelperRef.current.position.set(-pos, 0, 0); arrowHelperRef.current.rotation.y = -Math.PI / 2; if (direction === -1) arrowHelperRef.current.rotation.z = Math.PI; break;
      }
      arrowHelperRef.current.scale.set(scale, scale, scale);
      sceneRef.current?.add(arrowHelperRef.current);
  }


  React.useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) return;

    // Initialize scene
    sceneRef.current = new THREE.Scene();
    sceneRef.current.background = new THREE.Color(0x111827);

    // Initialize camera
    cameraRef.current = new THREE.PerspectiveCamera(50, mountNode.clientWidth / mountNode.clientHeight, 0.1, 1000);
    cameraRef.current.position.set(5, 5, 5);
    cameraRef.current.lookAt(0, 0, 0);

    // Initialize renderer
    rendererRef.current = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current.setSize(mountNode.clientWidth, mountNode.clientHeight);
    rendererRef.current.setPixelRatio(window.devicePixelRatio);
    mountNode.appendChild(rendererRef.current.domElement);
    
    // Controls
    controlsRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
    controlsRef.current.enableDamping = true;
    controlsRef.current.dampingFactor = 0.05;
    controlsRef.current.minDistance = 5;
    controlsRef.current.maxDistance = 20;
    controlsRef.current.enablePan = false;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    sceneRef.current.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(2, 5, 3);
    sceneRef.current.add(directionalLight);

    // Initial cube
    createRubiksCube();

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controlsRef.current?.update();
      rendererRef.current?.render(sceneRef.current!, cameraRef.current!);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (rendererRef.current && cameraRef.current && mountNode) {
        cameraRef.current.aspect = mountNode.clientWidth / mountNode.clientHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(mountNode.clientWidth, mountNode.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mountNode && rendererRef.current) {
        mountNode.removeChild(rendererRef.current.domElement);
      }
      // You can add more cleanup here (disposing geometries, materials, etc.) if needed
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
});

RubiksCubeView.displayName = "RubiksCubeView";
