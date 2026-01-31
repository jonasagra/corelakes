/* 15 floating green particles – positions & delays mirror the original CSS */
const PARTICLES = [
  { top:'10%', left:'15%', delay:'0s'   },
  { top:'25%', left:'35%', delay:'1s'   },
  { top:'40%', left:'55%', delay:'2s'   },
  { top:'55%', left:'75%', delay:'3s'   },
  { top:'70%', left:'25%', delay:'4s'   },
  { top:'85%', left:'45%', delay:'5s'   },
  { top:'15%', left:'65%', delay:'1.5s' },
  { top:'30%', left:'85%', delay:'2.5s' },
  { top:'45%', left:'15%', delay:'3.5s' },
  { top:'60%', left:'95%', delay:'4.5s' },
  { top:'20%', left:'50%', delay:'0.5s' },
  { top:'35%', left:'70%', delay:'1.3s' },
  { top:'50%', left:'30%', delay:'2.8s' },
  { top:'65%', left:'60%', delay:'3.2s' },
  { top:'80%', left:'80%', delay:'4.8s' },
];

export default function Particles() {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute w-[5px] h-[5px] sm:w-[4px] sm:h-[4px] animate-float"
          style={{
            top: p.top,
            left: p.left,
            animationDelay: p.delay,
            background: 'rgba(76,166,50,0.3)',
          }}
        />
      ))}
    </div>
  );
}
