'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface Medicine {
  _id: string;
  name: string;
  dosage: string;
  time: string;
  frequency: string;
}

interface ReminderNotificationProps {
  medicine: Medicine;
  onConfirm: (medicineId: string) => void;
  onDismiss: (medicineId: string) => void;
}

const ReminderNotification: React.FC<ReminderNotificationProps> = ({ medicine, onConfirm, onDismiss }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [isAlertingCaretaker, setIsAlertingCaretaker] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-play the voice reminder when component mounts
  useEffect(() => {
    playVoiceReminder();
  }, [medicine]);

  const playVoiceReminder = async () => {
    setIsPlaying(true);
    setAudioError(false);
    try {
      // Localized prompt for elderly
      const text = `Aapko ab ${medicine.name} lena hai. Kripaya dawa samay par lein.`;

      const response = await fetch('/api/tts/sarvam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: 'hi-IN' }),
      });

      const data = await response.json();
      if (data.audioBase64) {
        const audioSrc = `data:audio/wav;base64,${data.audioBase64}`;
        if (audioRef.current) {
          audioRef.current.pause();
        }
        const audio = new Audio(audioSrc);
        audioRef.current = audio;
        audio.onended = () => setIsPlaying(false);
        await audio.play();
      } else {
        throw new Error('No audio data received');
      }
    } catch (error) {
      console.error('Failed to play voice reminder:', error);
      setAudioError(true);
      setIsPlaying(false);
    }
  };

  const handleDismiss = async () => {
    setIsAlertingCaretaker(true);
    try {
      // Send alert to caretaker
      await fetch('/api/prescriptions/alert-caretaker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicineId: medicine._id,
          message: `Alert: Patient missed or delayed taking ${medicine.name}.`,
        }),
      });
    } catch (error) {
      console.error('Failed to alert caretaker', error);
    } finally {
      setIsAlertingCaretaker(false);
      onDismiss(medicine._id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        <div className="bg-teal-500 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <AlertTriangle className="w-16 h-16 text-white mx-auto mb-4 animate-pulse" />
          <h2 className="text-3xl font-black text-white leading-tight">Time for Medicine!</h2>
          <p className="text-teal-100 mt-2 font-medium text-lg text-white">Please take your dose now</p>
        </div>

        <div className="p-8">
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-8 text-center shadow-inner">
            <h3 className="text-4xl font-extrabold text-gray-900 mb-2">{medicine.name}</h3>
            {medicine.dosage && (
              <p className="inline-block bg-teal-100 text-teal-800 px-4 py-1.5 rounded-full text-lg font-bold">
                {medicine.dosage}
              </p>
            )}
            <p className="text-gray-500 font-medium mt-4 text-lg">Schedule: <span className="text-gray-700 font-bold">{medicine.time}</span></p>
          </div>

          <div className="flex justify-center mb-8">
            <button
              onClick={playVoiceReminder}
              disabled={isPlaying}
              className={`flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition-all shadow-md
                ${isPlaying 
                  ? 'bg-teal-100 text-teal-700 cursor-not-allowed' 
                  : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 active:scale-95'}`}
            >
              <Volume2 className={`w-6 h-6 ${isPlaying ? 'animate-pulse' : ''}`} />
              <span>{isPlaying ? 'Playing Audio...' : 'Replay Voice Message'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleDismiss}
              disabled={isAlertingCaretaker}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-red-100 bg-red-50 text-red-600 hover:bg-red-100 transition-colors active:scale-95"
            >
              {isAlertingCaretaker ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <XCircle className="w-10 h-10" />
              )}
              <span className="font-bold text-lg leading-tight text-center">No, Later</span>
            </button>
            <button
              onClick={() => onConfirm(medicine._id)}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-emerald-100 bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 shadow-emerald-500/30 transition-all active:scale-95"
            >
              <CheckCircle2 className="w-10 h-10" />
              <span className="font-bold text-lg leading-tight text-center">Yes, Target Taken</span>
            </button>
          </div>
        </div>

        {audioError && (
          <div className="p-4 bg-red-50 text-red-600 text-center text-sm font-medium border-t border-red-100">
            Could not play audio. Please ensure volume is up or check the connection.
          </div>
        )}
      </div>
    </div>
  );
};

export default ReminderNotification;
