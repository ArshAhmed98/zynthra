let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

export function playClickSound() {
  if (typeof window === "undefined") return;
  
  try {
    const ctx = getAudioContext();
    
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.15;
    
    const feedback = ctx.createGain();
    feedback.gain.value = 0.4;
    
    const dry = ctx.createGain();
    dry.gain.value = 0.6;
    
    const wet = ctx.createGain();
    wet.gain.value = 0.5;
    
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(ctx.destination);
    dry.connect(ctx.destination);
    
    const playBeat = (delayTime: number, freq: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(dry);
      gain.connect(delay);
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delayTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + delayTime + 0.08);
      
      gain.gain.setValueAtTime(0.5, ctx.currentTime + delayTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delayTime + 0.2);
      
      osc.start(ctx.currentTime + delayTime);
      osc.stop(ctx.currentTime + delayTime + 0.25);
    };
    
    playBeat(0, 80);
    playBeat(0.08, 60);
  } catch {}
}

export function playHoverSound() {
  if (typeof window === "undefined") return;
  
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  } catch {}
}