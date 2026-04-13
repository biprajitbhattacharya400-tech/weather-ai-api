import { useEffect, useMemo, useRef, useState } from 'react';
import { Volume2, VolumeX, Waves } from 'lucide-react';

const labelByWeather = {
  clear: 'Soft daylight ambience',
  clouds: 'Cloud drift ambience',
  rain: 'Rain ambience',
  snow: 'Snow ambience',
  night: 'Night ambience',
  default: 'Ambient atmosphere',
};

const createNoiseBuffer = (context) => {
  const size = context.sampleRate * 2;
  const buffer = context.createBuffer(1, size, context.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < size; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }

  return buffer;
};

const createAmbientLayer = (context, noiseBuffer, weather) => {
  const layerGain = context.createGain();
  layerGain.gain.value = 0;

  const cleanups = [];

  const connectNoise = ({ gain = 0.03, lowpass = 900, highpass = 80 }) => {
    const noise = context.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const hp = context.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = highpass;

    const lp = context.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = lowpass;

    const g = context.createGain();
    g.gain.value = gain;

    noise.connect(hp);
    hp.connect(lp);
    lp.connect(g);
    g.connect(layerGain);

    noise.start();
    cleanups.push(() => {
      try {
        noise.stop();
      } catch {
        // no-op
      }
    });
  };

  const connectOsc = ({ type = 'sine', freq = 196, gain = 0.014 }) => {
    const osc = context.createOscillator();
    const g = context.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = gain;

    osc.connect(g);
    g.connect(layerGain);
    osc.start();

    cleanups.push(() => {
      try {
        osc.stop();
      } catch {
        // no-op
      }
    });
  };

  if (weather === 'rain') {
    connectNoise({ gain: 0.05, lowpass: 2200, highpass: 320 });
    connectNoise({ gain: 0.018, lowpass: 900, highpass: 140 });
  } else if (weather === 'snow') {
    connectNoise({ gain: 0.03, lowpass: 1800, highpass: 420 });
    connectOsc({ type: 'sine', freq: 170, gain: 0.008 });
  } else if (weather === 'clouds') {
    connectNoise({ gain: 0.028, lowpass: 1200, highpass: 120 });
    connectOsc({ type: 'triangle', freq: 138, gain: 0.008 });
  } else if (weather === 'night') {
    connectOsc({ type: 'sine', freq: 110, gain: 0.012 });
    connectOsc({ type: 'triangle', freq: 220, gain: 0.006 });
  } else {
    connectOsc({ type: 'sine', freq: 196, gain: 0.012 });
    connectOsc({ type: 'triangle', freq: 261.6, gain: 0.006 });
  }

  layerGain.connect(context.destination);

  return {
    gainNode: layerGain,
    stop: () => {
      cleanups.forEach((fn) => fn());
      layerGain.disconnect();
    },
  };
};

function AmbientSoundControl({ weatherKey = 'default' }) {
  const [enabled, setEnabled] = useState(false);
  const [muted, setMuted] = useState(false);
  const contextRef = useRef(null);
  const masterGainRef = useRef(null);
  const noiseRef = useRef(null);
  const activeLayerRef = useRef(null);

  const ambientLabel = useMemo(() => labelByWeather[weatherKey] || labelByWeather.default, [weatherKey]);

  const ensureAudio = async () => {
    if (!contextRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;

      const context = new AudioCtx();
      const master = context.createGain();
      master.gain.value = 0;
      master.connect(context.destination);

      contextRef.current = context;
      masterGainRef.current = master;
      noiseRef.current = createNoiseBuffer(context);
    }

    if (contextRef.current.state === 'suspended') {
      await contextRef.current.resume();
    }

    return contextRef.current;
  };

  useEffect(() => {
    let isDisposed = false;

    const syncLayer = async () => {
      if (!enabled || !masterGainRef.current) return;

      const context = await ensureAudio();
      if (!context || isDisposed) return;

      const layer = createAmbientLayer(context, noiseRef.current, weatherKey);
      const now = context.currentTime;

      layer.gainNode.connect(masterGainRef.current);
      layer.gainNode.gain.setValueAtTime(0, now);
      layer.gainNode.gain.linearRampToValueAtTime(1, now + 2.2);

      const prev = activeLayerRef.current;
      activeLayerRef.current = layer;

      if (prev) {
        prev.gainNode.gain.cancelScheduledValues(now);
        prev.gainNode.gain.setValueAtTime(prev.gainNode.gain.value, now);
        prev.gainNode.gain.linearRampToValueAtTime(0, now + 1.8);
        window.setTimeout(() => prev.stop(), 1900);
      }
    };

    syncLayer();

    return () => {
      isDisposed = true;
    };
  }, [enabled, weatherKey]);

  useEffect(() => {
    if (!masterGainRef.current || !contextRef.current) return;
    const now = contextRef.current.currentTime;
    const target = enabled && !muted ? 0.24 : 0;

    masterGainRef.current.gain.cancelScheduledValues(now);
    masterGainRef.current.gain.setValueAtTime(masterGainRef.current.gain.value, now);
    masterGainRef.current.gain.linearRampToValueAtTime(target, now + 0.55);
  }, [enabled, muted]);

  useEffect(
    () => () => {
      if (activeLayerRef.current) {
        activeLayerRef.current.stop();
        activeLayerRef.current = null;
      }

      if (contextRef.current) {
        contextRef.current.close();
      }
    },
    [],
  );

  return (
    <div className="ambient-audio-panel glass-lite fixed bottom-4 right-4 z-40 rounded-2xl p-3 shadow-ambient">
      {!enabled ? (
        <button
          type="button"
          className="soft-button ambient-enable-btn inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold"
          onClick={async () => {
            await ensureAudio();
            setEnabled(true);
            setMuted(false);
          }}
        >
          <Waves size={14} />
          <span>Enable Ambient Sound</span>
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="soft-button inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-inkSecondary"
            onClick={() => setMuted((prev) => !prev)}
            aria-label={muted ? 'Unmute ambient sound' : 'Mute ambient sound'}
          >
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            <span>{muted ? 'Unmute' : 'Mute'}</span>
          </button>
          <span className="text-[11px] font-medium text-inkTertiary">{ambientLabel}</span>
        </div>
      )}
    </div>
  );
}

export default AmbientSoundControl;
