import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Info,
  MessageSquareText,
  X,
} from "lucide-react";

const DialogContext = createContext(null);

const variantStyles = {
  info: {
    icon: Info,
    iconWrap: "bg-blue-50 text-[#12356b]",
    confirm: "bg-[#12356b] text-white hover:bg-[#0b2855]",
  },
  success: {
    icon: CheckCircle2,
    iconWrap: "bg-emerald-50 text-emerald-700",
    confirm: "bg-emerald-700 text-white hover:bg-emerald-800",
  },
  warning: {
    icon: AlertTriangle,
    iconWrap: "bg-amber-50 text-amber-700",
    confirm: "bg-amber-600 text-white hover:bg-amber-700",
  },
  danger: {
    icon: AlertTriangle,
    iconWrap: "bg-red-50 text-red-700",
    confirm: "bg-red-600 text-white hover:bg-red-700",
  },
  prompt: {
    icon: MessageSquareText,
    iconWrap: "bg-slate-100 text-[#12356b]",
    confirm: "bg-[#12356b] text-white hover:bg-[#0b2855]",
  },
};

function normalizeOptions(options, defaults = {}) {
  if (typeof options === "string") {
    return { ...defaults, message: options };
  }

  return { ...defaults, ...(options ?? {}) };
}

export function DialogProvider({ children }) {
  const resolverRef = useRef(null);
  const [dialog, setDialog] = useState(null);
  const [inputValue, setInputValue] = useState("");

  const openDialog = useCallback((config) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setInputValue(config.defaultValue ?? "");
      setDialog(config);
    });
  }, []);

  const closeDialog = useCallback((value) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setDialog(null);
    setInputValue("");
  }, []);

  const api = useMemo(
    () => ({
      alert: (options) =>
        openDialog(
          normalizeOptions(options, {
            type: "alert",
            variant: "info",
            title: "Aviso",
            confirmLabel: "Entendido",
          })
        ),
      confirm: (options) =>
        openDialog(
          normalizeOptions(options, {
            type: "confirm",
            variant: "warning",
            title: "Confirmar acción",
            confirmLabel: "Confirmar",
            cancelLabel: "Cancelar",
          })
        ),
      prompt: (options) =>
        openDialog(
          normalizeOptions(options, {
            type: "prompt",
            variant: "prompt",
            title: "Agregar detalle",
            confirmLabel: "Guardar",
            cancelLabel: "Cancelar",
            placeholder: "",
            defaultValue: "",
          })
        ),
    }),
    [openDialog]
  );

  const styles = variantStyles[dialog?.variant] ?? variantStyles.info;
  const Icon = styles.icon ?? HelpCircle;

  return (
    <DialogContext.Provider value={api}>
      {children}

      {dialog ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.24)]">
            <div className="flex items-start gap-4 border-b border-slate-100 px-5 py-4">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.iconWrap}`}
              >
                <Icon size={21} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-extrabold text-slate-900">
                  {dialog.title}
                </h2>
                {dialog.message ? (
                  <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-600">
                    {dialog.message}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => closeDialog(dialog.type === "alert" ? true : null)}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                title="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            {dialog.type === "prompt" ? (
              <div className="px-5 py-4">
                <textarea
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  rows={4}
                  autoFocus
                  placeholder={dialog.placeholder}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#12356b] focus:bg-white"
                />
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-3 bg-slate-50 px-5 py-4">
              {dialog.type !== "alert" ? (
                <button
                  type="button"
                  onClick={() => closeDialog(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100"
                >
                  {dialog.cancelLabel}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() =>
                  closeDialog(dialog.type === "prompt" ? inputValue : true)
                }
                className={`rounded-xl px-4 py-2.5 text-sm font-extrabold shadow-sm transition-colors ${styles.confirm}`}
              >
                {dialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </DialogContext.Provider>
  );
}

export function useAppDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useAppDialog debe usarse dentro de DialogProvider");
  }

  return context;
}
