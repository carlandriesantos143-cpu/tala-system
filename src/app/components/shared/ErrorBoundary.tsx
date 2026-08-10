import { Component, type ReactNode, type ErrorInfo } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * ErrorBoundary — sinasalo nito ang anumang error na nangyayari habang nagre-render
 * ang mga child component. Kapag walang ganito, isang error lang sa kahit saang bahagi
 * ay nagpapaging blank (white screen) sa BUONG app, na walang paraan para makabawi ang user.
 *
 * Kailangang class component ito: React error boundaries ay gumagana lang sa
 * getDerivedStateFromError / componentDidCatch, na wala sa function components.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    // May error habang nagre-render — ipakita ang fallback sa susunod na render.
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // I-log para sa debugging. Hindi ipinapakita sa user ang teknikal na detalye.
    console.error("[TALA] Uncaught render error:", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-gray-800 font-bold mb-2" style={{ fontSize: "1.15rem" }}>
            May Nangyaring Mali
          </h1>
          <p className="text-gray-500 mb-6 max-w-[320px]" style={{ fontSize: "0.85rem" }}>
            Nagkaroon ng hindi inaasahang problema. Subukang i-reload ang app. Kung
            magpatuloy ito, i-restart ang app o suriin ang iyong koneksyon.
          </p>
          <button
            onClick={this.handleReload}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors cursor-pointer"
            style={{ fontSize: "0.9rem" }}
          >
            I-reload ang App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
