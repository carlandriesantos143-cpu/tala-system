  import { useNavigate } from "react-router";
  // Public asset — reference by URL (nasa public/ folder), hindi i-import.
  const logo = "/tala-logo.svg";

  export function LandingPage() {
    const navigate = useNavigate();

    return (
      <main className="w-full max-w-md h-dvh mx-auto p-4 bg-gradient-to-b from-emerald-600 via-emerald-500 to-emerald-200 flex flex-col justify-between items-center overflow-hidden">
        <section className="flex flex-col h-100 py-10 px-28 justify-center text-center gap-6">
            <div className="flex flex-col ">
                <img src={logo} alt="Tala Logo" className="flex h-32 justify-center items-start gap-[10px] shrink-0" />
                <h1 className="font-['Jomolhari'] text-white text-center text-[40px] font-normal leading-17 tracking-[6px]"> TALA </h1>
            </div>

            <div className="flex flex-col items-center gap-3">
                <p className="text-white text-base font-light w-48 leading-tight">Reliable health guidance for</p>
                <div className="px-3 py-1 rounded-[14px] bg-white/20 backdrop-blur-sm border border-white/10">
                    <p className="text-white">Barangay Malinta</p>
                </div>
            </div>
        </section>

        <section className="flex flex-col w-full h-56 items-center justify-around">
            <div className="flex flex-col h-25">
                <button type="button" onClick={() => navigate("/app")} className="w-full h-14 flex items-center justify-center rounded-2xl bg-white shadow-lg active:scale-95 transition-transform">
                    <p className="text-emerald-600 font-bold text-md">Get Started</p>
                </button>
                <p className="text-white text-xs font-light mt-3 text-center opacity-90">Works without internet. Install once, use anytime.</p>
            </div>
            <p className="text-emerald-900/50 text-[10px] font-medium tracking-widest uppercase">TALA v1.0 · Barangay Malinta</p>
        </section>
    </main>
    );
  }
