
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mic, MicOff, MapPin, X, Loader2, Save, AlertCircle, ChevronRight, ImagePlus, Eye, EyeOff, Globe } from 'lucide-react';
import { LocationData, PriorityHint, UserSettings } from '../types';
import { MiniMap } from './MiniMap';

interface IssueFormProps {
  onAnalyze: (image: string, description: string, location: LocationData | null, priority: PriorityHint, isAnonymous: boolean, language: string) => void;
  isAnalyzing: boolean;
  isOnline: boolean;
  settings?: UserSettings;
  t?: any;
}

export const IssueForm: React.FC<IssueFormProps> = ({ onAnalyze, isAnalyzing, isOnline, settings, t }) => {
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [priority, setPriority] = useState<PriorityHint>('medium');
  const [isAnonymous, setIsAnonymous] = useState(settings?.defaultAnonymous || false);
  const [showManualLoc, setShowManualLoc] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Update anonymous state if settings change (e.g. if user came from settings page)
  useEffect(() => {
    if (settings) {
      setIsAnonymous(settings.defaultAnonymous);
    }
  }, [settings]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = settings?.language === 'zu' ? 'zu-ZA' : settings?.language === 'af' ? 'af-ZA' : 'en-ZA'; 

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setDescription(prev => prev + ' ' + finalTranscript);
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        setIsListening(false);
      };
      recognitionRef.current.onend = () => {
         setIsListening(false);
      };
    }
  }, [settings?.language]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Speech recognition start failed", e);
        setIsListening(false);
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getLocation = () => {
    setLocLoading(true);
    setLocError(null);
    setShowManualLoc(false);

    // Fallback Location: Johannesburg City Hall
    // Used when permission is denied so the user still gets a map experience
    const fallbackLocation = {
      latitude: -26.2041,
      longitude: 28.0473,
      accuracy: 500
    };

    if (!navigator.geolocation) {
      setLocError("GPS unsupported. Using default JHB location.");
      setLocation(fallbackLocation);
      setLocLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setLocLoading(false);
      },
      (error) => {
        console.warn("GPS Access Denied/Error:", error);
        
        let errorMsg = "GPS access denied.";
        if (error.code === error.TIMEOUT) errorMsg = "GPS timeout. Try moving outdoors.";
        if (error.code === error.POSITION_UNAVAILABLE) errorMsg = "Location unavailable.";

        setLocError(`${errorMsg} Using approximate location.`);
        setLocation(fallbackLocation); // Set fallback so map renders
        setLocLoading(false);
      },
      // ENFORCE PRECISE AND CURRENT LOCATION
      // enableHighAccuracy: true -> Uses GPS over Wifi/Cell triangulation where possible
      // maximumAge: 0 -> Forces a fresh reading, ignoring cache
      // timeout: 20000 -> Gives the GPS radio 20s to lock (cold start can take time)
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  };

  const handleManualCoordChange = (type: 'lat' | 'lng', value: string) => {
    const numVal = parseFloat(value);
    if (isNaN(numVal)) return;

    setLocation(prev => {
      const defaultLoc = { latitude: -26.2041, longitude: 28.0473, accuracy: 10 };
      if (!prev) return type === 'lat' ? { ...defaultLoc, latitude: numVal } : { ...defaultLoc, longitude: numVal };
      return type === 'lat' ? { ...prev, latitude: numVal } : { ...prev, longitude: numVal };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview) return;
    const base64Data = imagePreview.split(',')[1];
    onAnalyze(base64Data, description, location, priority, isAnonymous, settings?.language || 'en');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in pb-32 md:pb-10 relative">
      
      {/* Step 1: Evidence (Hero Section) */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between text-sm font-bold text-slate-800 mb-4 px-1">
           <span className="flex items-center gap-2"><Camera size={18} className="text-amber-500"/> {t?.form?.step1 || "Evidence Photo"} <span className="text-red-500">*</span></span>
           {imagePreview && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 flex items-center gap-1">Image Ready</span>}
        </div>
        
        {!imagePreview ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group relative h-72 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-slate-100 hover:border-amber-400 transition-all cursor-pointer flex flex-col items-center justify-center gap-4"
          >
             <div className="bg-white p-5 rounded-full shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform relative">
                <Camera className="w-10 h-10 text-slate-400 group-hover:text-amber-500" />
                <div className="absolute inset-0 rounded-full border-2 border-amber-500/0 group-hover:border-amber-500/20 animate-ping"></div>
             </div>
             <div className="text-center">
               <span className="block text-slate-900 font-extrabold text-xl tracking-tight">{t?.form?.tapToCapture || "Tap to Capture"}</span>
               <span className="text-sm text-slate-500 mt-1">or upload from gallery</span>
             </div>
          </div>
        ) : (
          <div className="relative rounded-2xl overflow-hidden h-72 bg-slate-900 group shadow-inner">
            <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
               <button 
                  type="button"
                  onClick={clearImage}
                  className="bg-white text-red-600 px-6 py-3 rounded-full font-bold shadow-xl transform hover:scale-105 transition-transform flex items-center gap-2"
                >
                  <X size={18} /> Retake Photo
                </button>
            </div>
            <button 
              type="button"
              onClick={clearImage}
              className="md:hidden absolute top-3 right-3 bg-black/60 text-white p-2.5 rounded-full backdrop-blur-sm"
            >
              <X size={20} />
            </button>
          </div>
        )}
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" capture="environment" className="hidden" />
      </div>

      {/* Step 2: Details */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
         <label className="block text-sm font-bold text-slate-800 mb-3 px-1">2. {t?.form?.step2 || "Describe Issue"} (Optional)</label>
         <div className="relative">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 pr-14 border border-slate-200 bg-slate-50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400 min-h-[120px] resize-none text-slate-700 placeholder:text-slate-400 transition-all text-base leading-relaxed"
              placeholder={t?.form?.placeholder || "e.g. Large pothole on the left lane near the school..."}
            />
            <button
              type="button"
              onClick={toggleListening}
              className={`absolute bottom-3 right-3 p-3 rounded-xl transition-all shadow-sm ${
                isListening ? 'bg-red-500 text-white animate-pulse-ring' : 'bg-white text-slate-400 hover:text-amber-500 border border-slate-200'
              }`}
            >
              {isListening ? <MicOff size={22} /> : <Mic size={22} />}
            </button>
         </div>
      </div>

      {/* Step 3: Location & Priority */}
      <div className="space-y-4">
        {/* Priority */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
           <label className="block text-sm font-bold text-slate-800 mb-3 px-1">3. {t?.form?.step3 || "Urgency Level"}</label>
           <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
             {(['low', 'medium', 'high'] as const).map((level) => (
               <button
                 key={level}
                 type="button"
                 onClick={() => setPriority(level)}
                 className={`flex-1 py-4 flex flex-col items-center justify-center gap-1.5 rounded-xl transition-all ${
                   priority === level
                     ? 'bg-white text-slate-900 shadow-md ring-1 ring-black/5 scale-[1.02]'
                     : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'
                 }`}
               >
                 <span className={`w-3 h-3 rounded-full shadow-sm ${
                    level === 'low' ? 'bg-green-500' : level === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                 }`}></span>
                 <span className="text-xs font-bold uppercase tracking-wide">{level}</span>
               </button>
             ))}
           </div>
        </div>

        {/* Location */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex flex-col">
           <label className="flex items-center justify-between text-sm font-bold text-slate-800 mb-3 px-1">
             <span>4. {t?.form?.step4 || "Location"}</span>
             {location && !locError && (
               <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border flex items-center gap-1 ${location.accuracy < 30 ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-amber-600 bg-amber-50 border-amber-100'}`}>
                 <MapPin size={10} />
                 {location.accuracy < 30 ? (t?.form?.gpsPrecise || "GPS Precise") : (t?.form?.gpsApprox || "GPS Weak")}
                 <span className="opacity-80"> (±{Math.round(location.accuracy)}m)</span>
               </span>
             )}
             {location && locError && <span className="text-amber-600 text-[10px] font-bold uppercase bg-amber-50 px-2 py-1 rounded border border-amber-100 flex items-center gap-1"><AlertCircle size={10} /> Approx</span>}
           </label>
           
           {!location ? (
             <div className="flex flex-col gap-2 h-full justify-between">
               <button
                 type="button"
                 onClick={getLocation}
                 className="w-full py-4 flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-100 transition-colors font-bold text-sm flex-grow group"
               >
                 {locLoading ? <Loader2 size={20} className="animate-spin" /> : <MapPin size={20} className="group-hover:text-blue-500 transition-colors" />}
                 {locLoading ? 'Acquiring Signal...' : (t?.form?.getGps || 'Get GPS Location')}
               </button>
               <button 
                  type="button" 
                  onClick={() => setShowManualLoc(!showManualLoc)}
                  className="text-xs text-slate-400 hover:text-slate-600 underline py-1"
               >
                 {showManualLoc ? "Hide manual input" : "Or enter coordinates manually"}
               </button>
             </div>
           ) : (
             <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-64 mb-3">
               <MiniMap latitude={location.latitude} longitude={location.longitude} />
               <button 
                  onClick={() => setLocation(null)}
                  className="absolute top-2 right-2 bg-white text-slate-600 p-1.5 rounded-lg shadow-md hover:text-red-500 transition-colors z-20"
               >
                 <X size={16} />
               </button>
             </div>
           )}

           {locError && <p className="text-xs text-amber-600 mt-2 font-medium bg-amber-50 p-2 rounded-lg">{locError}</p>}
           
           {/* Manual Coordinates Inputs */}
           {(showManualLoc || location) && (
              <div className="grid grid-cols-2 gap-3 mt-auto pt-2 animate-fade-in">
                 <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block flex items-center gap-1"><Globe size={10}/> Latitude</label>
                    <input 
                      type="number" 
                      step="any"
                      value={location?.latitude || ''}
                      onChange={(e) => handleManualCoordChange('lat', e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
                      placeholder="-26.204"
                    />
                 </div>
                 <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block flex items-center gap-1"><Globe size={10}/> Longitude</label>
                    <input 
                      type="number" 
                      step="any"
                      value={location?.longitude || ''}
                      onChange={(e) => handleManualCoordChange('lng', e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
                      placeholder="28.047"
                    />
                 </div>
              </div>
           )}
        </div>
      </div>
      
      {/* Privacy Toggle */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isAnonymous ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-500'}`}>
               {isAnonymous ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
            <div>
               <p className="text-sm font-bold text-slate-800">{t?.form?.anonymous || "Report Anonymously"}</p>
               <p className="text-xs text-slate-500">Hide my identity on this report</p>
            </div>
         </div>
         <button
           type="button"
           onClick={() => setIsAnonymous(!isAnonymous)}
           className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ${isAnonymous ? 'bg-amber-500' : 'bg-slate-300'}`}
         >
            <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${isAnonymous ? 'translate-x-5' : 'translate-x-0'}`} />
         </button>
      </div>

      {/* Sticky Mobile Action Bar / Desktop Button */}
      <div className="fixed bottom-[74px] left-0 right-0 p-4 bg-gradient-to-t from-slate-100 via-slate-100/95 to-transparent z-30 md:static md:bg-none md:p-0 md:z-auto pb-safe">
        <div className="max-w-2xl mx-auto">
          <button
            type="submit"
            disabled={!imagePreview || isAnalyzing}
            className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl shadow-amber-500/20 flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] ${
              !imagePreview || isAnalyzing
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : isOnline 
                    ? 'bg-slate-900 text-white hover:bg-slate-800' 
                    : 'bg-amber-500 text-white hover:bg-amber-600'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="animate-spin" />
                {t?.form?.analyzing || "Analyzing Issue..."}
              </>
            ) : (
              <>
                {isOnline ? (t?.form?.submit || 'Generate AI Report') : (t?.form?.saveOffline || 'Save to Offline Queue')}
                <div className="bg-white/20 p-1 rounded-full">
                  <ChevronRight size={18} />
                </div>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
