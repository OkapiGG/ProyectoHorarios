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

        <main className="flex flex-1 gap-4 overflow-hidden p-4 lg:p-5">
          <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="shrink-0 border-b border-gray-100 px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <h1 className={`truncate text-lg font-extrabold tracking-tight ${titleClassName}`}>
                    {resolvedConfig.title}
                  </h1>
                  {resolvedConfig.description ? (
                    <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">
                      {resolvedConfig.description}
                    </p>
                  ) : null}
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                  {resolvedConfig.itemsSummary?.(items.length, visibleItems.length) ??
                    `${items.length} ${resolvedConfig.entityNamePlural}`}
                </span>
              </div>

              {resolvedConfig.tabs?.length ? (
                <div className="mt-3 flex gap-1.5">
                  {resolvedConfig.tabs.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        activeTab === tab
                          ? "bg-sigho-primary text-white shadow-sm"
                          : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                      >
                        {tab}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="shrink-0 px-5 pt-4">
              <div className="flex items-center gap-3">
                <div className="flex flex-1 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 transition-all focus-within:border-blue-500 focus-within:bg-white">
                  <Search size={15} className="mr-2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder={
                      resolvedConfig.searchPlaceholder ??
                      `Buscar ${resolvedConfig.entityNamePlural}...`
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
                        "Formulario listo para un nuevo registro.",
                    });
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-sigho-primary px-4 py-2 text-xs font-bold text-white shadow-sm transition-opacity hover:opacity-90"
                >
                  <Plus size={15} />
                  Nuevo
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto px-5 pb-2 pt-3">
              {resolvedConfig.renderTableHead ? (
                <table className="w-full min-w-max border-collapse text-left">
                  <thead>{resolvedConfig.renderTableHead()}</thead>
                  <tbody className="divide-y divide-gray-50">
                    {visibleItems.length > 0
                      ? visibleItems.map((item, index) => resolvedConfig.renderRow(item, index))
                      : null}
                  </tbody>
                </table>
              ) : null}

              {!visibleItems.length ? (
                <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/60 p-6 text-center">
                  {resolvedConfig.emptyStateIcon ? (
                    <resolvedConfig.emptyStateIcon size={26} className="mb-2 text-gray-400" />
                  ) : null}
                  <p className="text-sm font-semibold text-gray-700">
                    {resolvedConfig.emptyStateTitle ??
                      `Sin ${resolvedConfig.entityNamePlural}`}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {resolvedConfig.emptyStateDescription ??
                      "Agrega un registro desde el panel lateral."}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 px-5 py-2.5 text-xs">
              <span className="font-medium text-gray-500">
                {resolvedConfig.footerLabel?.(visibleItems.length, items.length) ??
                  `${visibleItems.length} / ${items.length}`}
              </span>

              {resolvedConfig.pagination ?? null}
            </div>
          </section>

          <aside className="flex w-[340px] shrink-0 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="shrink-0 border-b border-gray-100 bg-sigho-sidebar px-5 py-4">
              <div className="flex items-center gap-2.5">
                {resolvedConfig.formIcon ? (
                  <resolvedConfig.formIcon size={16} className="text-blue-300" />
                ) : null}
                <h2 className="text-sm font-bold tracking-wide text-white">
                  {resolvedConfig.formTitle ?? "Detalles del registro"}
                </h2>
              </div>
              {resolvedConfig.formSubtitle ? (
                <p className="ml-6 mt-0.5 text-[11px] text-gray-400">
                  {resolvedConfig.formSubtitle}
                </p>
              ) : null}
            </div>

            <form
              onSubmit={handleGuardar}
              className="flex flex-1 flex-col overflow-hidden"
            >
              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
                {resolvedConfig.formLayout?.map((node, index) => (
                  <React.Fragment key={node.key ?? node.name ?? index}>
                    {renderFieldNode(node, formData, handleChange)}
                  </React.Fragment>
                ))}

                {resolvedConfig.formInfoMessage ? (
                  <div className="flex gap-2.5 rounded-lg border border-blue-100 bg-blue-50 p-3">
                    {resolvedConfig.formInfoIcon ? (
                      <resolvedConfig.formInfoIcon
                        size={14}
                        className="mt-0.5 shrink-0 text-blue-600"
                      />
                    ) : null}
                    <p className="text-[11px] font-medium leading-relaxed text-blue-800">
                      {resolvedConfig.formInfoMessage}
                    </p>
                  </div>
                ) : null}

                {feedback.message ? (
                  <div
                    className={`rounded-lg px-3 py-2 text-xs font-medium ${
                      feedback.type === "success"
                        ? "border border-emerald-100 bg-emerald-50 text-emerald-700"
                        : "border border-red-100 bg-red-50 text-red-700"
                    }`}
                  >
                    {feedback.message}
                  </div>
                ) : null}
              </div>

              <div className="shrink-0 border-t border-gray-100 bg-gray-50/60 px-5 py-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
                  >
                    <XCircle size={14} />
                    Limpiar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-sigho-primary px-3 py-2 text-xs font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save size={14} />
                    {isSaving ? "Guardando..." : "Guardar"}
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
