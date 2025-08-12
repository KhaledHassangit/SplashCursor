"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function TunnelExperience() {
  const sceneRef = useRef<THREE.Scene>();
  const tubeRef = useRef<THREE.Mesh>();
  const wireframeRef = useRef<THREE.LineSegments>();

  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const canvas = document.querySelector("canvas.experience") as HTMLCanvasElement;
    if (!canvas) return;

    // 1. Initialize renderer with alpha
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true // Allow transparency
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 2. Create scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x194794, 0, 100);
    sceneRef.current = scene;

    // 3. Camera setup
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.001, 200);
    const cameraGroup = new THREE.Group();
    cameraGroup.position.z = 400;
    cameraGroup.add(camera);
    scene.add(cameraGroup);

    // 4. Create path
    const pointsArray = [
      [10, 89, 0],
      [50, 88, 10],
      [76, 139, 20],
      [126, 141, 12],
      [150, 112, 8],
      [157, 73, 0],
      [180, 44, 5],
      [207, 35, 10],
      [232, 36, 0],
    ].map(([x, z, y]) => new THREE.Vector3(x, y, z));

    const path = new THREE.CatmullRomCurve3(pointsArray);
    path.tension = 0.5;

    // 5. Texture loading with proper error handling
    const loadTexture = (url: string): Promise<THREE.Texture> => {
      return new Promise((resolve) => {
        new THREE.TextureLoader().load(
          url,
          (texture) => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(15, 2);
            resolve(texture);
          },
          undefined,
          () => {
            // Fallback texture
            const canvas = document.createElement('canvas');
            canvas.width = canvas.height = 256;
            const ctx = canvas.getContext('2d')!;
            ctx.fillStyle = '#001122';
            ctx.fillRect(0, 0, 256, 256);
            const fallback = new THREE.CanvasTexture(canvas);
            resolve(fallback);
          }
        );
      });
    };

    // 6. Create main tube with textures
    const tubeGeometry = new THREE.TubeGeometry(path, 300, 4, 32, false);
    
    Promise.all([
      loadTexture("/3d_space_5.jpg"),
      loadTexture("/waveform-bump3.jpg")
    ]).then(([texture, bumpMap]) => {
      const tubeMaterial = new THREE.MeshPhongMaterial({
        side: THREE.BackSide,
        map: texture,
        bumpMap: bumpMap,
        bumpScale: -0.03,
        specular: 0x0b2349,
        transparent: true,
        opacity: 1
      });
      
      if (tubeRef.current) {
        tubeRef.current.material = tubeMaterial;
      }
    });

    const tube = new THREE.Mesh(tubeGeometry, new THREE.MeshBasicMaterial({color: 0x194794}));
    scene.add(tube);
    tubeRef.current = tube;

    // 7. Create wireframe network (adjusted position)
    const innerTubeGeometry = new THREE.TubeGeometry(path, 150, 3.4, 32, false);
    const edgesGeometry = new THREE.EdgesGeometry(innerTubeGeometry);
    
    const wireframeMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.2,
      depthTest: true, // Enable depth testing
      depthWrite: false // But don't write to depth buffer
    });

    const wireframe = new THREE.LineSegments(edgesGeometry, wireframeMaterial);
    wireframe.renderOrder = 1; // Render after main tube
    scene.add(wireframe);
    wireframeRef.current = wireframe;

    // 8. Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1.5, 4, 0); // Increased intensity
    scene.add(pointLight);

    // 9. Animation setup
    const tubePerc = { percent: 0 };
    gsap.timeline({
      scrollTrigger: {
        trigger: ".scrollTarget",
        start: "top top",
        end: "bottom bottom",
        scrub: 5,
      },
    }).to(tubePerc, {
      percent: 0.96,
      onUpdate: () => {
        const p1 = path.getPointAt(tubePerc.percent);
        const p2 = path.getPointAt(tubePerc.percent + 0.03);
        cameraGroup.position.copy(p1);
        cameraGroup.lookAt(p2);
        pointLight.position.copy(p2);
      },
    });

    // 10. Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose();
    };
  }, []);

  return (
    <>
      <canvas className="experience"></canvas>
      <div className="scrollTarget" style={{ height: "400vh" }}></div>
      <div className="vignette-radial"></div>
    </>
  );
}