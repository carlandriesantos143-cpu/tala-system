  import { useNavigate } from "react-router";
  import logo from "../../../public/tala-logo.svg";

  export function LandingPage() {
    const navigate = useNavigate();

    return (
        // <div
        //   className="flex min-h-dvh overflow-hidden border border-emerald-200/70 mx-auto max-w-[430px] space-y-5 px-5 py-6 pb-24"
        //   style={{
        //     background:
        //       "linear-gradient(180deg, #0d8f63 0%, #16a874 26%, #6ed3aa 54%, #dff4e8 78%, #f8fcf9 100%)",
        //   }}
        // >
        //   <div className="flex flex-1 h-44 flex-col px-6 pb-8 pt-10 text-center sm:px-8 sm:pb-10 sm:pt-12">
        //     <div className="flex flex-1 flex-col items-center justify-center">
        //       <div className="mb-7 sm:mb-8">
        //         <img
        //           src={logo}
        //           alt="TALA logo"
        //           className="h-28 w-28 object-contain sm:h-32 sm:w-32"
        //         />
        //       </div>
  //             <button
        //         type="button"
        //         
        //         className="mb-4 flex h-[52px] w-full cursor-pointer items-center justify-center rounded-[18px] border border-emerald-300/40 text-white transition-transform active:scale-[0.98]"
        //         style={{
        //           background: "linear-gradient(180deg, #0b8f63 0%, #0a7e58 100%)",
        //           fontSize: "1rem",
        //           fontWeight: 600,
        //           boxShadow: "0 16px 34px rgba(10, 126, 88, 0.24)",
        //         }}
        //       >
        //         Get Started
        //       </button>
        //       <h1
        //         className="mb-10 text-white"
        //         style={{
        //           fontSize: "3.1rem",
        //           fontWeight: 400,
        //           letterSpacing: "0.14em",
        //           fontFamily: "Georgia, serif",
        //         }}
        //       >
        //         TALA
        //       </h1>

        //       <p className="mb-4 text-white/90" style={{ fontSize: "0.95rem", lineHeight: 1.7 }}>
        //         Reliable health guidance
        //         <br />
        //         for
        //       </p>

        //       <div className="rounded-full border border-white/30 bg-white/14 px-4 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-sm">
        //         <span className="text-white" style={{ fontSize: "0.92rem", fontWeight: 500 }}>
        //           Barangay Malinta
        //         </span>
        //       </div>
        //     </div>

        //     <div className="pb-3 pt-6 sm:pt-8">
      

        //       <p className="text-center text-emerald-950/70" style={{ fontSize: "0.78rem" }}>
        //         Works without internet. Install once, use anytime.
        //       </p>

        //       <p className="mt-24 text-center text-emerald-950/75 sm:mt-28" style={{ fontSize: "0.72rem" }}>
        //         TALA v1.0 - Barangay Malinta
        //       </p>
        //     </div>
        //   </div>
        // </div>
        <div className="mx-auto min-h-full max-w-[430px] p-4 bg-gradient-to-b from-emerald-600 via-emerald-500 to-emerald-200 flex justify-content-center flex-col justify-between items-center overflow-hidden">
          <div className="self-stretch h-[465px] px-24 py-10 flex flex-col justify-center items-center gap-5">
              <div className="w-44 h-52 flex flex-col justify-between items-center">
                <img src={logo} alt="Logo"/>
                  <div className="self-stretch h-16 text-center justify-start text-white text-4xl font-normal font-['Jomolhari'] leading-[60px] tracking-[6px]">TALA</div>
              </div>
              <div className="h-20 flex flex-col justify-between items-center overflow-hidden">
                  <div className="w-48 h-12 text-center justify-start text-white text-base font-normal font-['Inter'] " style={{ fontSize: "0.92rem", fontWeight: 500 }}>Reliable health guidance for<br/></div>
                  <div className="h-6 bg-white/20 rounded-2xl flex flex-col justify-between items-center overflow-hidden">
                      <div className="w-36 h-6 text-center justify-center text-white text-base font-normal font-['Inter'] leading-6" style={{ fontSize: "0.92rem", fontWeight: 500 }}>Barangay Malinta</div>
                  </div>
              </div>
          </div>
          <div className="self-stretch h-52 flex flex-col justify-between items-center">
              <div className="h-24 flex flex-col justify-start items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => navigate("/app")}
                    className="w-80 h-14 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl shadow-[0px_10px_15px_-3px_rgba(164,244,207,1.00)] text-white text-base font-medium font-['Inter'] leading-6 transition-all duration-200 hover:from-emerald-700 hover:to-teal-600 hover:shadow-[0px_12px_20px_-3px_rgba(16,185,129,0.55)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Get Started
                  </button>
                  <div className="w-96 h-4 text-center justify-start text-zinc-800 text-xs font-normal font-['Inter'] leading-4">Works without internet. Install once, use anytime.</div>
              </div>
              <div className="w-[480px] h-5 py-2.5 inline-flex justify-start items-start">
                  <div className="flex-1 text-center justify-start text-black text-xs font-normal font-['Inter'] leading-4">TALA v1.0 · Barangay Malinta</div>
              </div>
          </div>
      </div>
    );
  }
