import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { useState, useEffect } from 'react';

export const Celebration = () => {
  const { width, height } = useWindowSize();
  const [pieces, setPieces] = useState(800);
  
  // Gradually reduce confetti pieces for a fade-out effect
  useEffect(() => {
    const timer = setInterval(() => {
      setPieces(prev => Math.max(0, prev - 50));
    }, 500);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Main burst */}
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={pieces}
        gravity={0.2}
        wind={0.05}
        initialVelocityY={40}
        tweenDuration={1000}
        colors={[
          '#FF577F', // Pink
          '#FF884B', // Orange
          '#FFB01D', // Gold
          '#3C79F5', // Blue
          '#20E3B2', // Teal
          '#FFD700', // Yellow
        ]}
        drawShape={ctx => {
          ctx.beginPath();
          for(let i = 0; i < 6; i++) {
            ctx.lineTo(
              Math.cos(2 * Math.PI * i / 6) * 6,
              Math.sin(2 * Math.PI * i / 6) * 6
            );
          }
          ctx.fill();
          ctx.closePath();
        }}
      />

      {/* Side bursts for extra drama */}
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={pieces / 2}
        gravity={0.3}
        initialVelocityX={15}
        initialVelocityY={30}
        confettiSource={{ x: 0, y: height / 2, w: 0, h: 0 }}
        colors={['#FFD700', '#FF577F', '#3C79F5']}
      />
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={pieces / 2}
        gravity={0.3}
        initialVelocityX={-15}
        initialVelocityY={30}
        confettiSource={{ x: width, y: height / 2, w: 0, h: 0 }}
        colors={['#FFB01D', '#20E3B2', '#FF884B']}
      />
    </>
  );
};