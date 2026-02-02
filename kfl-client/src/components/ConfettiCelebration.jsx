import React, { useEffect, useRef } from 'react';

const ConfettiCelebration = ({ duration = 3000, onComplete }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confettiColors = ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#FF1493', '#9370DB', '#32CD32'];
    const confettiPieces = [];
    const confettiCount = 150;

    class ConfettiPiece {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height - canvas.height;
        this.width = Math.random() * 10 + 5;
        this.height = Math.random() * 6 + 3;
        this.color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 10 - 5;
        this.velocityY = Math.random() * 3 + 2;
        this.velocityX = Math.random() * 2 - 1;
        this.gravity = 0.1;
        this.opacity = 1;
        this.shape = Math.random() > 0.5 ? 'rect' : 'circle';
      }

      update() {
        this.velocityY += this.gravity;
        this.y += this.velocityY;
        this.x += this.velocityX;
        this.rotation += this.rotationSpeed;
        
        // Fade out near the bottom
        if (this.y > canvas.height * 0.8) {
          this.opacity -= 0.02;
        }
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);

        if (this.shape === 'rect') {
          ctx.fillStyle = this.color;
          ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.fill();
        }

        ctx.restore();
      }
    }

    // Create confetti pieces
    for (let i = 0; i < confettiCount; i++) {
      confettiPieces.push(new ConfettiPiece());
    }

    let animationFrameId;
    let startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed > duration) {
        cancelAnimationFrame(animationFrameId);
        if (onComplete) onComplete();
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      confettiPieces.forEach((piece) => {
        piece.update();
        piece.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [duration, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[60]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default ConfettiCelebration;
