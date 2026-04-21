import { useNavigate } from "react-router";
import logo from "../../assets/logo/tala-logo.svg";

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top,_#f7fcf9_0%,_#edf7f1_52%,_#e2efe7_100%)] px-0 sm:flex sm:items-center sm:justify-center sm:p-6 lg:p-10">
      <div
        className="flex min-h-dvh w-full flex-col overflow-hidden border border-emerald-200/70 bg-white sm:min-h-[820px] sm:max-h-[900px] sm:max-w-[430px] sm:rounded-[30px] sm:shadow-[0_28px_90px_rgba(15,23,42,0.14)]"
        style={{
          background:
            "linear-gradient(180deg, #0d8f63 0%, #16a874 26%, #6ed3aa 54%, #dff4e8 78%, #f8fcf9 100%)",
        }}
      >
        <div className="flex flex-1 flex-col px-6 pb-8 pt-10 text-center sm:px-8 sm:pb-10 sm:pt-12">
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="mb-7 sm:mb-8">
              <img
                src={logo}
                alt="TALA logo"
                className="h-28 w-28 object-contain sm:h-32 sm:w-32"
              />
            </div>

            <h1
              className="mb-10 text-white"
              style={{
                fontSize: "3.1rem",
                fontWeight: 400,
                letterSpacing: "0.14em",
                fontFamily: "Georgia, serif",
              }}
            >
              TALA
            </h1>

            <p className="mb-4 text-white/90" style={{ fontSize: "0.95rem", lineHeight: 1.7 }}>
              Reliable health guidance
              <br />
              for
            </p>

            <div className="rounded-full border border-white/30 bg-white/14 px-4 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-sm">
              <span className="text-white" style={{ fontSize: "0.92rem", fontWeight: 500 }}>
                Barangay Malinta
              </span>
            </div>
          </div>

          <div className="pb-3 pt-6 sm:pt-8">
            <button
              type="button"
              onClick={() => navigate("/app")}
              className="mb-4 flex h-[52px] w-full cursor-pointer items-center justify-center rounded-[18px] border border-emerald-300/40 text-white transition-transform active:scale-[0.98]"
              style={{
                background: "linear-gradient(180deg, #0b8f63 0%, #0a7e58 100%)",
                fontSize: "1rem",
                fontWeight: 600,
                boxShadow: "0 16px 34px rgba(10, 126, 88, 0.24)",
              }}
            >
              Get Started
            </button>

            <p className="text-center text-emerald-950/70" style={{ fontSize: "0.78rem" }}>
              Works without internet. Install once, use anytime.
            </p>

            <p className="mt-24 text-center text-emerald-950/75 sm:mt-28" style={{ fontSize: "0.72rem" }}>
              TALA v1.0 - Barangay Malinta
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
