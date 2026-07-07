import React, { useState, useRef } from "react";
import { motion } from "framer-motion";

interface ThreeDProductCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function ThreeDProductCard({ children, className = "" }: ThreeDProductCardProps) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glareX, setGlareX] = useState(50);
  const [glareY, setGlareY] = useState(50);
  const [isHovered, setIsHovered] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Mouse coordinates relative to card center
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;

    // Maximum tilt angles (degrees)
    const maxTilt = 12;
    const rX = -(mouseY / (height / 2)) * maxTilt;
    const rY = (mouseX / (width / 2)) * maxTilt;

    setRotateX(rX);
    setRotateY(rY);

    // Glare position (percentage)
    const gX = ((e.clientX - rect.left) / width) * 100;
    const gY = ((e.clientY - rect.top) / height) * 100;
    setGlareX(gX);
    setGlareY(gY);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      style={{ perspective: "1000px" }}
      className="w-full h-full"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`relative w-full h-full rounded-2xl overflow-hidden transition-all duration-300 ${className}`}
        style={{
          transformStyle: "preserve-3d",
        }}
        animate={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          scale: isHovered ? 1.02 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 250,
          damping: 20,
        }}
      >
        {/* Dynamic Glare Reflection Overlay */}
        {isHovered && (
          <div
            className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-300 opacity-20"
            style={{
              background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 60%)`,
            }}
          />
        )}
        
        {/* Children components wrapped (enable translateZ on children for depth) */}
        {children}
      </motion.div>
    </div>
  );
}
