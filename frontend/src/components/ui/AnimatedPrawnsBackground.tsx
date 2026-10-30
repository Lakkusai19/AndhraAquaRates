import React, { useEffect, useRef } from 'react';

interface AnimatedPrawnsBackgroundProps {
  intensity?: 'subtle' | 'vibrant' | 'deep';
  showBubbles?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const AnimatedPrawnsBackground: React.FC<AnimatedPrawnsBackgroundProps> = ({
  intensity = 'vibrant',
  showBubbles = true,
  className = '',
  children,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const getWidth = () => canvas.parentElement?.clientWidth || window.innerWidth;
    const getHeight = () => canvas.parentElement?.clientHeight || window.innerHeight;

    let width = (canvas.width = getWidth());
    let height = (canvas.height = getHeight());

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = getWidth();
      height = canvas.height = getHeight();
    };
    window.addEventListener('resize', handleResize);

    // ========================================================
    // REAL LIVE VANNAMEI SHRIMP BIOMECHANICAL SIMULATION CLASS
    // ========================================================
    class LiveVannameiPrawn {
      x: number;
      y: number;
      depth: number; // 0.25 (distant) to 1.0 (foreground)
      length: number;
      direction: number; // 1 = right, -1 = left
      speed: number;
      swimCycle: number;
      cycleSpeed: number;
      buoyancyPhase: number;
      kickVelocity: number;

      // Antenna wave memory points
      antennaHistory: { y1: number; y2: number }[] = [];

      constructor(initRandom = true) {
        this.depth = 0.3 + Math.random() * 0.7; // 0.3 to 1.0
        // Natural sizes: far prawns ~85px, foreground prawns ~200px
        this.length = 85 + this.depth * 115;
        this.direction = Math.random() > 0.4 ? 1 : -1;
        this.speed = (0.65 + this.depth * 0.85) * this.direction;
        this.swimCycle = Math.random() * Math.PI * 2;
        this.cycleSpeed = 0.04 + Math.random() * 0.025;
        this.buoyancyPhase = Math.random() * Math.PI * 2;
        this.kickVelocity = 0;

        this.x = initRandom ? Math.random() * width : this.direction === 1 ? -160 : width + 160;
        this.y = 80 + Math.random() * (height * 0.8);

        // Pre-fill antenna history
        for (let i = 0; i < 15; i++) {
          this.antennaHistory.push({ y1: 0, y2: 0 });
        }
      }

      update() {
        this.swimCycle += this.cycleSpeed;
        this.buoyancyPhase += 0.02;

        // Propulsion pulse (tail kick thrust + recovery glide)
        const kickStroke = Math.sin(this.swimCycle);
        if (kickStroke > 0.8) {
          this.kickVelocity += 0.12 * this.direction;
        }
        this.kickVelocity *= 0.94; // Water friction damping

        // Move forward with natural glide & gentle vertical buoyancy
        this.x += this.speed + this.kickVelocity;
        this.y += Math.sin(this.buoyancyPhase) * (0.35 * this.depth);

        // Update antenna lag history for fluid trailing whip motion
        this.antennaHistory.unshift({
          y1: Math.sin(this.swimCycle * 1.5) * 6,
          y2: Math.sin(this.swimCycle * 1.5 + 0.6) * 5,
        });
        if (this.antennaHistory.length > 15) {
          this.antennaHistory.pop();
        }

        // Viewport wrapping
        const buffer = this.length * 2;
        if (this.direction === 1 && this.x > width + buffer) {
          this.reset(-buffer);
        } else if (this.direction === -1 && this.x < -buffer) {
          this.reset(width + buffer);
        }
      }

      reset(newX: number) {
        this.x = newX;
        this.y = 60 + Math.random() * (height * 0.8);
        this.depth = 0.3 + Math.random() * 0.7;
        this.length = 85 + this.depth * 115;
        this.speed = (0.65 + this.depth * 0.85) * this.direction;
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        c.translate(this.x, this.y);

        // Flip horizontally if swimming left
        if (this.direction === -1) {
          c.scale(-1, 1);
        }

        // Slight natural pitch as it pulses forward
        const pitch = Math.sin(this.swimCycle) * 0.07;
        c.rotate(pitch);

        const s = this.length / 120; // Scale unit

        // Depth-based opacity & soft atmospheric water haze
        const alpha = 0.55 + this.depth * 0.42;
        c.globalAlpha = alpha;

        // ========================================================
        // 1. WHISKER ANTENNAE (Flowing Gracefully Backward with Fluid Drag)
        // ========================================================
        c.beginPath();
        c.strokeStyle = 'rgba(230, 245, 255, 0.75)';
        c.lineWidth = 1 * s;

        // Primary long antenna (arching gracefully back over the carapace)
        c.moveTo(38 * s, -6 * s);
        c.bezierCurveTo(
          65 * s,
          -22 * s + this.antennaHistory[2].y1,
          -10 * s,
          -36 * s + this.antennaHistory[6].y1,
          -85 * s,
          -28 * s + this.antennaHistory[12].y1
        );

        // Secondary antenna (lower whisker)
        c.moveTo(38 * s, -2 * s);
        c.bezierCurveTo(
          55 * s,
          2 * s + this.antennaHistory[2].y2,
          -5 * s,
          -14 * s + this.antennaHistory[6].y2,
          -65 * s,
          -8 * s + this.antennaHistory[12].y2
        );
        c.stroke();

        // Antennular flagella (small forward sensory feelers)
        c.beginPath();
        c.strokeStyle = 'rgba(230, 245, 255, 0.6)';
        c.lineWidth = 0.8 * s;
        c.moveTo(40 * s, -4 * s);
        c.lineTo(52 * s, -7 * s);
        c.moveTo(40 * s, -3 * s);
        c.lineTo(49 * s, -2 * s);
        c.stroke();

        // ========================================================
        // 2. CEPHALOTHORAX (Head & Carapace - Translucent Shell with Internal Organs)
        // ========================================================
        // Biological Vannamei shell gradient (pearly translucent with amber-sepia internal core)
        const shellGrad = c.createLinearGradient(0, -14 * s, 45 * s, 10 * s);
        shellGrad.addColorStop(0, 'rgba(240, 250, 255, 0.9)'); // Dorsal top highlight
        shellGrad.addColorStop(0.35, 'rgba(215, 235, 245, 0.75)'); // Translucent shell
        shellGrad.addColorStop(0.65, 'rgba(185, 155, 120, 0.7)'); // Amber internal organ shading
        shellGrad.addColorStop(1, 'rgba(145, 115, 80, 0.6)'); // Ventral edge

        c.beginPath();
        c.fillStyle = shellGrad;
        c.moveTo(6 * s, -10 * s);
        // Rostrum (serrated dorsal spear extending forward)
        c.quadraticCurveTo(34 * s, -11 * s, 46 * s, -5 * s);
        c.lineTo(41 * s, -1 * s);
        // Head curve
        c.quadraticCurveTo(32 * s, 8 * s, 6 * s, 9 * s);
        c.quadraticCurveTo(-2 * s, 7 * s, -4 * s, 0 * s);
        c.closePath();
        c.fill();

        // Rostrum micro-teeth (serrations on top of spear)
        c.beginPath();
        c.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        c.lineWidth = 0.8 * s;
        for (let t = 0; t < 5; t++) {
          const toothX = 22 * s + t * 4 * s;
          c.moveTo(toothX, -10 * s);
          c.lineTo(toothX + 1.5 * s, -12 * s);
        }
        c.stroke();

        // Realistic Eyestalk & Compound Eye
        c.beginPath();
        c.fillStyle = 'rgba(200, 225, 240, 0.85)';
        c.arc(31 * s, -4.5 * s, 3.2 * s, 0, Math.PI * 2); // Eyestalk
        c.fill();

        // Obsidian Eye Globe with Specular Glint
        c.beginPath();
        c.fillStyle = '#060a12';
        c.arc(32 * s, -5 * s, 2.5 * s, 0, Math.PI * 2);
        c.fill();
        c.beginPath();
        c.fillStyle = '#ffffff';
        c.arc(33 * s, -5.8 * s, 0.9 * s, 0, Math.PI * 2);
        c.fill();

        // Walking Legs (Pereiopods under chest)
        c.beginPath();
        c.strokeStyle = 'rgba(235, 245, 255, 0.7)';
        c.lineWidth = 1.1 * s;
        for (let l = 0; l < 5; l++) {
          const legX = 10 * s + l * 4 * s;
          const legWave = Math.sin(this.swimCycle * 2.5 + l * 0.6) * 3;
          c.moveTo(legX, 7 * s);
          c.lineTo(legX - 4 * s, 14 * s);
          c.lineTo(legX - 9 * s + legWave, 21 * s);
        }
        c.stroke();

        // ========================================================
        // 3. ARTICULATED ABDOMEN (6 Real Curving Exoskeleton Segments)
        // ========================================================
        const strokeCurl = Math.sin(this.swimCycle);
        // Natural anatomical segments derived from live shrimp proportions
        const abdomenSegments = [
          { dx: -5 * s, dy: 0 * s, w: 10 * s, h: 8.5 * s, rot: 0.04 * strokeCurl },
          { dx: -16 * s, dy: 2 * s, w: 9.5 * s, h: 8 * s, rot: 0.1 * strokeCurl },
          { dx: -27 * s, dy: 6 * s, w: 8.8 * s, h: 7.2 * s, rot: 0.2 * strokeCurl },
          { dx: -37 * s, dy: 13 * s, w: 8 * s, h: 6.5 * s, rot: 0.32 * strokeCurl },
          { dx: -46 * s, dy: 22 * s, w: 7.2 * s, h: 5.6 * s, rot: 0.46 * strokeCurl },
          { dx: -54 * s, dy: 32 * s, w: 6.5 * s, h: 4.8 * s, rot: 0.6 * strokeCurl },
        ];

        abdomenSegments.forEach((seg, idx) => {
          c.save();
          c.translate(seg.dx, seg.dy);
          c.rotate(seg.rot);

          // Realistic segment shell gradient (dorsal pearl to ventral translucency)
          const segGrad = c.createLinearGradient(-seg.w, -seg.h, seg.w, seg.h);
          segGrad.addColorStop(0, 'rgba(245, 252, 255, 0.88)');
          segGrad.addColorStop(0.45, 'rgba(215, 235, 245, 0.7)');
          segGrad.addColorStop(0.85, 'rgba(195, 175, 145, 0.65)');
          segGrad.addColorStop(1, 'rgba(165, 140, 105, 0.55)');

          // Shell plate ellipse
          c.beginPath();
          c.fillStyle = segGrad;
          c.ellipse(0, 0, seg.w, seg.h, 0.15, 0, Math.PI * 2);
          c.fill();

          // Delicate biological band highlight across segment
          c.beginPath();
          c.strokeStyle = 'rgba(255, 255, 255, 0.65)';
          c.lineWidth = 0.8 * s;
          c.ellipse(0, 0, seg.w * 0.88, seg.h * 0.88, 0.15, -0.7, 1.4);
          c.stroke();

          // ========================================================
          // 4. PLEOPODS (Swimmerets Paddling Rhythmically Underneath)
          // ========================================================
          // Metachronal paddling wave: phase shifts across segments
          const paddlePhase = Math.sin(this.swimCycle * 3.5 + idx * 0.8);
          const paddleFlutter = paddlePhase * 9 * s;

          c.beginPath();
          c.strokeStyle = 'rgba(225, 245, 255, 0.75)';
          c.lineWidth = 1.2 * s;
          // Swimmeret base to paddle tip
          c.moveTo(-1 * s, seg.h);
          c.quadraticCurveTo(-4 * s, seg.h + 5 * s, -8 * s + paddleFlutter, seg.h + 10 * s);
          c.stroke();

          // Swimmeret fine translucent fan fringe
          c.beginPath();
          c.fillStyle = 'rgba(210, 240, 255, 0.35)';
          c.ellipse(-7 * s + paddleFlutter, seg.h + 9 * s, 3 * s, 1.5 * s, 0.4, 0, Math.PI * 2);
          c.fill();

          c.restore();
        });

        // ========================================================
        // 5. TAIL FAN (Telson & 4 Uropod Blades Opening on Stroke)
        // ========================================================
        const tailJoint = abdomenSegments[5];
        c.save();
        c.translate(tailJoint.dx, tailJoint.dy);
        c.rotate(tailJoint.rot);

        // Fan expands dynamically during kick, streamlines during glide
        const fanSpread = 1 + strokeCurl * 0.3;
        const tailBlades = [
          { angle: -0.42 * fanSpread, len: 20 * s, width: 3.5 * s },
          { angle: -0.21 * fanSpread, len: 23 * s, width: 4 * s },
          { angle: 0, len: 25 * s, width: 3.8 * s }, // Central Telson (spine)
          { angle: 0.21 * fanSpread, len: 23 * s, width: 4 * s },
          { angle: 0.42 * fanSpread, len: 20 * s, width: 3.5 * s },
        ];

        tailBlades.forEach((b) => {
          c.save();
          c.rotate(b.angle);

          const bladeGrad = c.createLinearGradient(0, 0, -b.len, 0);
          bladeGrad.addColorStop(0, 'rgba(240, 250, 255, 0.85)');
          bladeGrad.addColorStop(0.5, 'rgba(210, 235, 250, 0.6)');
          bladeGrad.addColorStop(1, 'rgba(180, 215, 240, 0.1)');

          c.beginPath();
          c.fillStyle = bladeGrad;
          c.moveTo(0, 0);
          c.quadraticCurveTo(-b.len * 0.6, -b.width, -b.len, 0);
          c.quadraticCurveTo(-b.len * 0.6, b.width, 0, 0);
          c.fill();

          // Subtle chitin vein on blade
          c.beginPath();
          c.strokeStyle = 'rgba(255, 255, 255, 0.5)';
          c.lineWidth = 0.6 * s;
          c.moveTo(0, 0);
          c.lineTo(-b.len * 0.85, 0);
          c.stroke();

          c.restore();
        });

        c.restore(); // End tail joint

        c.restore(); // End prawn translation
      }
    }

    // ========================================================
    // RISING PEARLESCENT BUBBLES
    // ========================================================
    class RealBubble {
      x: number;
      y: number;
      radius: number;
      speedY: number;
      wobble: number;
      wobbleSpeed: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = height + Math.random() * 80;
        this.radius = 1.2 + Math.random() * 3.8;
        this.speedY = 0.5 + Math.random() * 1.4;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.03 + Math.random() * 0.025;
        this.opacity = 0.2 + Math.random() * 0.45;
      }

      update() {
        this.y -= this.speedY;
        this.wobble += this.wobbleSpeed;
        this.x += Math.sin(this.wobble) * 0.45;

        if (this.y < -20) {
          this.y = height + 20;
          this.x = Math.random() * width;
        }
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        c.globalAlpha = this.opacity;

        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = 'rgba(200, 235, 255, 0.18)';
        c.fill();
        c.lineWidth = 0.8;
        c.strokeStyle = 'rgba(255, 255, 255, 0.65)';
        c.stroke();

        // Specular gleam
        c.beginPath();
        c.arc(
          this.x - this.radius * 0.35,
          this.y - this.radius * 0.35,
          this.radius * 0.25,
          0,
          Math.PI * 2
        );
        c.fillStyle = 'rgba(255, 255, 255, 0.85)';
        c.fill();

        c.restore();
      }
    }

    // Initialize 8 Real Live Vannamei Prawns
    const prawns: LiveVannameiPrawn[] = [];
    for (let i = 0; i < 8; i++) {
      prawns.push(new LiveVannameiPrawn(true));
    }

    // Initialize Bubbles
    const bubbles: RealBubble[] = [];
    if (showBubbles) {
      for (let i = 0; i < 26; i++) {
        bubbles.push(new RealBubble());
      }
    }

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render bubbles
      bubbles.forEach((b) => {
        b.update();
        b.draw(ctx);
      });

      // Render live prawns sorted by depth (far prawns render first, near prawns on top)
      prawns.sort((a, b) => a.depth - b.depth);
      prawns.forEach((p) => {
        p.update();
        p.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [showBubbles]);

  const isFullScreen = !className.includes('min-h-') && !className.includes('h-');

  return (
    <div className={`relative ${isFullScreen ? 'min-h-screen' : ''} w-full overflow-hidden flex flex-col ${className}`}>
      {/* 1. Cinematic Pristine Ocean Wallpaper with Natural Sunlight Caustic Rays */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-100 pointer-events-none"
        style={{
          backgroundImage: `url('/assets/prawns_bg.jpg')`,
        }}
      />

      {/* 2. Soft Marine Atmospheric Vignette for Perfect Text Readability */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          intensity === 'deep'
            ? 'bg-gradient-to-b from-slate-950/85 via-slate-900/65 to-slate-950/90'
            : intensity === 'subtle'
            ? 'bg-gradient-to-b from-slate-950/45 via-slate-900/30 to-sky-950/50'
            : 'bg-gradient-to-b from-slate-950/60 via-slate-900/40 to-sky-950/70'
        }`}
      />

      {/* 3. Surface Light Ray Shimmer Highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-300/18 via-sky-500/5 to-transparent pointer-events-none" />

      {/* 4. Canvas with Real Live Swimming Vannamei Prawns & Bubbles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* 5. Forefront Interactive UI Content */}
      <div className="relative z-20 flex-1 flex flex-col">{children}</div>
    </div>
  );
};
