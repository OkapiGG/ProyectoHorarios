import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { Plus, Search, Save, XCircle } from "lucide-react";

function renderOption(option) {
  if (option && typeof option === "object") {
    return {
      value: option.value,
      label: option.label ?? option.value,
    };
  }

  return {
    value: option,
    label: option,
  };
}

function renderFieldNode(node, formData, handleChange) {
  if (!node) {
    return null;
  }

  if (node.kind === "group") {
    return (
      <div className={node.className ?? "space-y-4"}>
        {node.children?.map((child, index) => (
          <React.Fragment key={child.key ?? child.name ?? index}>
            {renderFieldNode(child, formData, handleChange)}
          </React.Fragment>
        ))}
      </div>
    );
  }

  if (node.kind === "divider") {
    return <hr className={node.className ?? "my-2 border-gray-100"} />;
  }

  if (node.kind === "info") {
    const Icon = node.icon;

    return (
      <div
        className={`flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 ${
          node.className ?? ""
        }`}
      >
        {Icon ? <Icon size={16} className="mt-0.5 shrink-0 text-blue-600" /> : null}
        <p className="text-xs font-medium leading-relaxed text-blue-800">
          {node.message}
        </p>
      </div>
    );
  }

  if (node.kind === "static") {
    const Icon = node.icon;

    return (
      <div className={node.wrapperClassName}>
        {node.label ? (
          <label className={node.labelClassName ?? "mb-2 block text-[10px] font-bold uppercase tracking-wider text-gray-400"}>
            {node.label}
          </label>
        ) : null}
        <div className={node.valueWrapperClassName ?? "flex items-center justify-between rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5"}>
          <span className={node.valueClassName ?? "text-sm font-bold text-gray-600"}>
            {node.value}
          </span>
          {Icon ? <Icon size={14} className={node.iconClassName ?? "text-gray-400"} /> : null}
        </div>
      </div>
    );
  }

  const value = formData[node.name];
  const inputType = node.type ?? "text";

  return (
    <div className={node.wrapperClassName}>
      {node.label ? (
        <label className={node.labelClassName ?? "mb-2 block text-[10px] font-bold uppercase tracking-wider text-gray-400"}>
          {node.label}
        </label>
      ) : null}

      {inputType === "select" ? (
        <select
          name={node.name}
          value={value}
          onChange={handleChange}
          required={node.required}
          disabled={node.disabled}
          className={
            node.className ??
            "w-full cursor-pointer rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 outline-none transition-all focus:border-blue-500"
          }
        >
          {node.options?.map((option) => {
            const normalized = renderOption(option);

            return (
              <option key={String(normalized.value)} value={normalized.value}>
                {normalized.label}
              </option>
            );
          })}
        </select>
      ) : inputType === "textarea" ? (
        <textarea
          name={node.name}
          value={value}
          onChange={handleChange}
          required={node.required}
          disabled={node.disabled}
          rows={node.rows ?? 4}
          placeholder={node.placeholder}
          className={
            node.className ??
            "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          }
        />
      ) : (
        <input
          name={node.name}
          value={value}
          onChange={handleChange}
          type={inputType}
          required={node.required}
          disabled={node.disabled}
          min={node.min}
          max={node.max}
          step={node.step}
          placeholder={node.placeholder}
          className={
            node.className ??
            "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          }
        />
      )}
    </div>
  );
}

function createCatalogCrudPage(config) {
  function CatalogCrudPage() {
    const resolvedConfig =
      typeof config === "function" ? config() : config;
    const { entityNamePlural, loadItems: loadItemsFn } = resolvedConfig;
    const titleClassName = resolvedConfig.titleClassName ?? "text-gray-900";
    const [items, setItems] = useState([]);
    const [formData, setFormData] = useState(resolvedConfig.initialFormState);
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState({ type: "idle", message: "" });
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState(
      resolvedConfig.defaultTab ?? resolvedConfig.tabs?.[0] ?? ""
    );

    useEffect(() => {
      let isMounted = true;

      const fetchItems = async () => {
        if (typeof loadItemsFn !== "function") {
          return;
        }

        try {
          const data = await loadItemsFn();

          if (isMounted && Array.isArray(data)) {
            setItems(data);
          }
        } catch (error) {
          console.error(`No se pudo cargar ${entityNamePlural}:`, error);
        }
      };

      fetchItems();

      return () => {
        isMounted = false;
      };
    }, [entityNamePlural, loadItemsFn]);

    const handleChange = (event) => {
      const { name, value, type } = event.target;

      setFormData((prev) => ({
        ...prev,
        [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
      }));
    };

    const resetForm = () => {
      setFormData(resolvedConfig.initialFormState);
      setFeedback({ type: "idle", message: "" });
    };

    const handleGuardar = async (event) => {
      event.preventDefault();

      const payload =
        typeof resolvedConfig.buildPayload === "function"
          ? resolvedConfig.buildPayload(formData)
          : formData;

      if (typeof resolvedConfig.validatePayload === "function") {
        const validationMessage = resolvedConfig.validatePayload(payload, formData);

        if (validationMessage) {
          setFeedback({ type: "error", message: validationMessage });
          return;
        }
      }

      setIsSaving(true);
      setFeedback({ type: "idle", message: "" });

      try {
        const savedItem = await resolvedConfig.createItem(payload);
        const nextRecord =
          typeof resolvedConfig.buildLocalRecord === "function"
            ? resolvedConfig.buildLocalRecord(savedItem, payload)
            : savedItem ?? payload;

        setItems((prev) => [nextRecord, ...prev]);
        setFeedback({
          type: "success",
          message:
            resolvedConfig.createSuccessMessage ??
            `${resolvedConfig.entityLabelSingular} guardado correctamente.`,
        });
        setFormData(resolvedConfig.initialFormState);
      } catch (error) {
        console.error(`Error al guardar ${resolvedConfig.entityLabelSingular}:`, error);
        setFeedback({
          type: "error",
          message:
            error?.response?.data?.message ||
            resolvedConfig.createErrorMessage ||
            `No se pudo guardar ${resolvedConfig.entityLabelSingular}. Revisa que el backend esté corriendo.`,
        });
      } finally {
        setIsSaving(false);
      }
    };

    const visibleItems =
      typeof resolvedConfig.filterItems === "function"
        ? resolvedConfig.filterItems(items, searchTerm)
        : items;

    return (
      <div className="flex h-screen overflow-hidden bg-sigho-bg font-sans">
        {resolvedConfig.sidebar ?? <Sidebar />}

        <main className="flex-1 flex gap-6 overflow-hidden p-6 lg:p-8">
          <section className="flex min-w-125 flex-1 flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div className="shrink-0 border-b border-gray-100 p-6">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-gray-400">
                    {resolvedConfig.headerKicker ?? "Configuración de Datos Maestros"}
                  </p>
                  <h1 className={`mt-2 text-2xl font-bold ${titleClassName}`}>
                    {resolvedConfig.title}
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">{resolvedConfig.description}</p>
                </div>
                <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600 ring-1 ring-gray-100">
                  {resolvedConfig.itemsSummary?.(items.length, visibleItems.length) ??
                    `${items.length} ${resolvedConfig.entityNamePlural} cargados`}
                </div>
              </div>

              {resolvedConfig.tabs?.length ? (
                <div className="flex gap-2">
                  {resolvedConfig.tabs.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                        activeTab === tab
                          ? "bg-white text-sigho-primary shadow-sm ring-1 ring-gray-200"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                      >
                        {tab}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="shrink-0 p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-1 items-center rounded-xl border border-transparent bg-gray-50 px-4 py-3 transition-all focus-within:border-blue-500 focus-within:bg-white">
                  <Search size={18} className="mr-3 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder={
                      resolvedConfig.searchPlaceholder ??
                      `Filtrar ${resolvedConfig.entityNamePlural}...`
                    }
                    className="w-full border-none bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setFeedback({
                      type: "success",
                      message:
                        resolvedConfig.newRecordMessage ??
                        "Formulario limpio, listo para un nuevo registro.",
                    });
                  }}
                  className="flex items-center gap-2 rounded-xl bg-sigho-sidebar px-6 py-3 text-sm font-bold text-black shadow-md transition-colors hover:bg-green-400"
                >
                  <Plus size={18} />
                  {resolvedConfig.newRecordLabel ?? "NUEVO REGISTRO"}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {resolvedConfig.renderTableHead ? (
                <table className="w-full border-collapse text-left">
                  <thead>{resolvedConfig.renderTableHead()}</thead>
                  <tbody className="divide-y divide-gray-50">
                    {visibleItems.length > 0
                      ? visibleItems.map((item, index) => resolvedConfig.renderRow(item, index))
                      : null}
                  </tbody>
                </table>
              ) : null}

              {!visibleItems.length ? (
                <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                  {resolvedConfig.emptyStateIcon ? (
                    <resolvedConfig.emptyStateIcon size={32} className="mb-3 text-gray-400" />
                  ) : null}
                  <p className="text-sm font-bold text-gray-700">
                    {resolvedConfig.emptyStateTitle ??
                      `No hay ${resolvedConfig.entityNamePlural} registrados`}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {resolvedConfig.emptyStateDescription ??
                      "Agrega un registro desde el panel lateral."}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-between border-t border-gray-50 p-4 text-sm">
              <span className="font-medium text-gray-500">
                {resolvedConfig.footerLabel?.(visibleItems.length, items.length) ??
                  `Mostrando ${visibleItems.length} ${resolvedConfig.entityNamePlural}`}
              </span>

              {resolvedConfig.pagination ?? null}
            </div>
          </section>

          <aside className="flex w-100 shrink-0 flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg">
            <div className="relative shrink-0 overflow-hidden bg-sigho-sidebar p-6">
              <div className="relative z-10 mb-1 flex items-center gap-3">
                {resolvedConfig.formIcon ? (
                  <resolvedConfig.formIcon size={20} className="text-blue-400" />
                ) : null}
                <h2 className="font-bold tracking-wide text-white">
                  {resolvedConfig.formTitle ?? "DETALLES DEL REGISTRO"}
                </h2>
              </div>
              <p className="relative z-10 ml-8 text-xs text-gray-400">
                {resolvedConfig.formSubtitle ?? "Alta y edición de registro"}
              </p>
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white opacity-5 blur-xl"></div>
            </div>

            <form
              onSubmit={handleGuardar}
              className="flex flex-1 flex-col overflow-y-auto p-6"
            >
              <div className="space-y-5">
                {resolvedConfig.formLayout?.map((node, index) => (
                  <React.Fragment key={node.key ?? node.name ?? index}>
                    {renderFieldNode(node, formData, handleChange)}
                  </React.Fragment>
                ))}

                {resolvedConfig.formInfoMessage ? (
                  <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                    {resolvedConfig.formInfoIcon ? (
                      <resolvedConfig.formInfoIcon
                        size={16}
                        className="mt-0.5 shrink-0 text-blue-600"
                      />
                    ) : null}
                    <p className="text-xs font-medium leading-relaxed text-blue-800">
                      {resolvedConfig.formInfoMessage}
                    </p>
                  </div>
                ) : null}

                {feedback.message ? (
                  <div
                    className={`rounded-xl px-4 py-3 text-sm font-medium ${
                      feedback.type === "success"
                        ? "border border-emerald-100 bg-emerald-50 text-emerald-700"
                        : "border border-red-100 bg-red-50 text-red-700"
                    }`}
                  >
                    {feedback.message}
                  </div>
                ) : null}
              </div>

              <div className="mt-6 border-t border-gray-100 bg-gray-50 pt-6">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50/30 px-5 py-3 text-sm font-bold text-black transition-colors hover:bg-red-200"
                  >
                    <XCircle size={16} />
                    {resolvedConfig.resetLabel ?? "LIMPIAR"}
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sigho-primary px-4 py-3 text-sm font-bold text-white shadow-md transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save size={16} />
                    {isSaving ? resolvedConfig.savingLabel ?? "GUARDANDO..." : resolvedConfig.submitLabel ?? "GUARDAR"}
                  </button>
                </div>
              </div>
            </form>
          </aside>
        </main>
      </div>
    );
  }

  return CatalogCrudPage;
}

export { createCatalogCrudPage };
export default createCatalogCrudPage;
