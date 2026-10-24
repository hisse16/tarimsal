import React, { useState } from 'react';
import { Leaf, Info, HelpCircle, Droplet, Sun, Wind, ChevronRight } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

interface SectorDetail {
  id: string;
  name: string;
  moisture: number;
  status: 'optimal' | 'dry' | 'wet';
  lastWatered: string;
  kc: number;
  ndvi: number;
  weedRisk: 'Düşük' | 'Orta' | 'Yüksek';
}

const SECTOR_DATA: SectorDetail[] = [
  { id: 'sec-a1', name: 'A1 Kuzey-Doğu', moisture: 64.2, status: 'optimal', lastWatered: '1 gün önce', kc: 0.72, ndvi: 0.81, weedRisk: 'Düşük' },
  { id: 'sec-a2', name: 'A2 Kuzey-Batı', moisture: 54.8, status: 'dry', lastWatered: '3 gün önce', kc: 0.75, ndvi: 0.78, weedRisk: 'Orta' },
  { id: 'sec-a3', name: 'A3 Orta-Merkez', moisture: 66.5, status: 'optimal', lastWatered: '1 gün önce', kc: 0.70, ndvi: 0.84, weedRisk: 'Düşük' },
  { id: 'sec-b1', name: 'B1 Güney-Doğu', moisture: 78.1, status: 'wet', lastWatered: 'Bugün', kc: 0.68, ndvi: 0.80, weedRisk: 'Yüksek' },
  { id: 'sec-b2', name: 'B2 Güney-Batı', moisture: 48.3, status: 'dry', lastWatered: '4 gün önce', kc: 0.72, ndvi: 0.75, weedRisk: 'Orta' },
  { id: 'sec-b3', name: 'B3 Batı Sınırı', moisture: 63.9, status: 'optimal', lastWatered: '2 gün önce', kc: 0.74, ndvi: 0.82, weedRisk: 'Düşük' },
];

export default function SoilMoistureGrid() {
  const { language } = useTranslation();
  const [selectedSector, setSelectedSector] = useState<SectorDetail>(SECTOR_DATA[0]);

  const getStatusColor = (status: 'optimal' | 'dry' | 'wet') => {
    switch (status) {
      case 'optimal': return 'bg-emerald-500 hover:bg-emerald-400 border-emerald-600/30';
      case 'dry': return 'bg-amber-500 hover:bg-amber-400 border-amber-600/30';
      case 'wet': return 'bg-blue-500 hover:bg-blue-400 border-blue-600/30';
    }
  };

  const getStatusLabel = (status: 'optimal' | 'dry' | 'wet') => {
    switch (status) {
      case 'optimal': return language === 'tr' ? 'Mükemmel (Optimal)' : language === 'es' ? 'Perfecto (Optimal)' : 'Perfect (Optimal)';
      case 'dry': return language === 'tr' ? 'Kuru (Sulama Gerekli)' : language === 'es' ? 'Seco (Requiere Riego)' : 'Dry (Irrigation Needed)';
      case 'wet': return language === 'tr' ? 'Aşırı Nemli' : language === 'es' ? 'Muy Húmedo' : 'Too Wet';
    }
  };

  return (
    <div className="bg-white border border-slate-150 rounded-2xl p-4 md:p-5 shadow-sm text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-display font-bold text-sm text-slate-800 flex items-center gap-2">
            <Droplet className="w-4 h-4 text-emerald-500" />
            {language === 'tr' ? 'Parsel Sensör Nem Izgarası (Sentinel GIS)' : 'Sector Soil Moisture Grid (Sentinel GIS)'}
          </h3>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
            {language === 'tr' ? 'Tarlanızın 6 bağımsız bölgedeki nem ve verim durumları' : 'Real-time readings across 6 independent field sectors'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-[9px] font-bold font-mono">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-500" /> {language === 'tr' ? 'KURU' : 'DRY'}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500" /> OPTİMAL</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-500" /> {language === 'tr' ? 'NEMLİ' : 'WET'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-4">
        
        {/* Interactive Grid Map */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="grid grid-cols-3 gap-3">
            {SECTOR_DATA.map((sector) => {
              const isActive = selectedSector.id === sector.id;
              return (
                <button
                  key={sector.id}
                  onClick={() => setSelectedSector(sector)}
                  className={`aspect-square rounded-xl border p-3 flex flex-col justify-between transition-all relative overflow-hidden group cursor-pointer text-left ${
                    isActive ? 'ring-2 ring-emerald-500 scale-102 shadow-md' : 'shadow-xs hover:scale-101'
                  } ${getStatusColor(sector.status)}`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-extrabold font-mono text-white bg-slate-950/20 px-1 py-0.5 rounded">
                      {sector.id.replace('sec-', '').toUpperCase()}
                    </span>
                    <span className="text-[9px] font-semibold text-white/90">
                      {sector.moisture.toFixed(1)}%
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-white leading-tight block truncate group-hover:underline">
                      {sector.name.split(' ')[1]}
                    </span>
                    <span className="text-[8px] text-white/80 font-mono block">
                      NDVI: {sector.ndvi}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-[9px] text-slate-400 italic mt-3 leading-snug">
            {language === 'tr' 
              ? '*Sektörler, tarlaya yerleştirilen kablosuz LoRaWAN sensörleri ve Sentinel-2 spektral verileri ile 10 dakikada bir kalibre edilir.'
              : '*Sectors are cross-calibrated every 10 minutes using LoRaWAN telemetry and Sentinel-2 spectrology.'}
          </p>
        </div>

        {/* Sector Details Panel */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-150 rounded-xl p-3.5 space-y-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-200/50 pb-1.5">
              <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wide font-mono">
                {selectedSector.name}
              </span>
              <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-650">
                {selectedSector.id.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="bg-white border border-slate-200/55 p-2 rounded-lg">
                <span className="text-slate-500 block text-[9px]">{language === 'tr' ? 'Toprak Nemi' : 'Soil Moisture'}</span>
                <span className="text-sm font-extrabold text-slate-800 mt-0.5 block">{selectedSector.moisture}%</span>
              </div>
              <div className="bg-white border border-slate-200/55 p-2 rounded-lg">
                <span className="text-slate-500 block text-[9px]">NDVI Değeri</span>
                <span className="text-sm font-extrabold text-slate-800 mt-0.5 block">{selectedSector.ndvi}</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-600 space-y-1.5 font-mono pt-1">
              <div className="flex justify-between">
                <span>{language === 'tr' ? 'Nem Durumu' : 'Moisture State'}:</span>
                <span className="font-extrabold text-slate-800">{getStatusLabel(selectedSector.status)}</span>
              </div>
              <div className="flex justify-between">
                <span>{language === 'tr' ? 'Son Sulama' : 'Last Sowing Irrigation'}:</span>
                <span className="font-bold text-slate-700">{selectedSector.lastWatered}</span>
              </div>
              <div className="flex justify-between">
                <span>{language === 'tr' ? 'Yabancı Ot Riski' : 'Weed Infestation Risk'}:</span>
                <span className={`font-bold ${
                  selectedSector.weedRisk === 'Yüksek' ? 'text-red-650' : selectedSector.weedRisk === 'Orta' ? 'text-amber-600' : 'text-emerald-600'
                }`}>{selectedSector.weedRisk}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-2.5 rounded-lg flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md shrink-0">
              <Info className="w-3.5 h-3.5" />
            </div>
            <p className="text-[9px] text-slate-500 leading-normal">
              {selectedSector.status === 'dry' 
                ? (language === 'tr' ? 'Kritik nem sınırı aşılmış! Bu parsele acil su verilmesi önerilir.' : 'Moisture has breached critical limits. Water immediately!')
                : (language === 'tr' ? 'Sektör sağlığı yerinde. Dengeli sulama periyoduna devam edebilirsiniz.' : 'Sector health is fully functional. Keep current schedules.')}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
