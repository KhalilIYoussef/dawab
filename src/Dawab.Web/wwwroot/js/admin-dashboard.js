document.querySelectorAll("[data-dashboard-tab]").forEach((button) => {
    button.addEventListener("click", () => {
        const tab = button.dataset.dashboardTab;
        if (!tab) {
            return;
        }
        const url = new URL(window.location.href);
        url.searchParams.set("tab", tab);
        window.history.replaceState({}, "", url);
    });
});

document.addEventListener("submit", (event) => {
    if (!(event.target instanceof HTMLFormElement) || event.target.method !== "post") {
        return;
    }

    let tabInput = event.target.querySelector('input[name="tab"]');
    if (!(tabInput instanceof HTMLInputElement)) {
        tabInput = document.createElement("input");
        tabInput.type = "hidden";
        tabInput.name = "tab";
        event.target.append(tabInput);
    }
    tabInput.value = new URLSearchParams(window.location.search).get("tab") ?? "overview";
}, true);

document.querySelectorAll("[data-admin-list]").forEach((list) => {
    const rows = Array.from(list.querySelectorAll("[data-list-row]"));
    const body = list.querySelector("tbody");
    const pagination = list.querySelector("[data-list-pagination]");
    const emptyRow = list.querySelector("[data-list-empty]");
    if (!body || !pagination) {
        return;
    }

    const noResultsRow = document.createElement("tr");
    noResultsRow.hidden = true;
    noResultsRow.innerHTML = `<td colspan="${body.closest("table")?.querySelectorAll("thead th").length ?? 1}" class="p-8 text-center text-gray-500">لا توجد نتائج مطابقة للبحث أو عوامل التصفية.</td>`;
    body.append(noResultsRow);

    const searchInput = list.querySelector("[data-list-search]");
    const pageSizeInput = list.querySelector("[data-page-size]");
    const filters = Array.from(list.querySelectorAll("[data-list-filter]"));
    let page = 1;
    let pageSize = Number(pageSizeInput?.value) || 10;

    const normalize = (value) => value
        .toLocaleLowerCase("ar")
        .normalize("NFD")
        .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
        .trim();

    const render = () => {
        const query = normalize(searchInput instanceof HTMLInputElement ? searchInput.value : "");
        const filteredRows = rows.filter((row) => {
            const matchesSearch = !query || normalize(row.textContent ?? "").includes(query);
            const matchesFilters = filters.every((filter) => {
                if (!(filter instanceof HTMLSelectElement) || !filter.value) {
                    return true;
                }
                return row.dataset[filter.dataset.listFilter ?? ""] === filter.value;
            });
            return matchesSearch && matchesFilters;
        });

        const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
        page = Math.min(page, pageCount);
        const firstIndex = (page - 1) * pageSize;
        const visibleRows = new Set(filteredRows.slice(firstIndex, firstIndex + pageSize));

        rows.forEach((row) => {
            row.hidden = !visibleRows.has(row);
        });
        if (emptyRow) {
            emptyRow.hidden = rows.length > 0;
        }
        noResultsRow.hidden = rows.length === 0 || filteredRows.length > 0;

        const rangeStart = filteredRows.length === 0 ? 0 : firstIndex + 1;
        const rangeEnd = Math.min(firstIndex + pageSize, filteredRows.length);
        pagination.replaceChildren();

        const footer = document.createElement("div");
        footer.className = "flex flex-col gap-3 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between";
        const summary = document.createElement("span");
        summary.textContent = `عرض ${rangeStart}–${rangeEnd} من ${filteredRows.length}`;
        footer.append(summary);

        const buttons = document.createElement("div");
        buttons.className = "flex items-center gap-2";
        const previous = createPageButton("السابق", page <= 1, () => {
            page -= 1;
            render();
        });
        const pageLabel = document.createElement("span");
        pageLabel.className = "min-w-20 text-center font-bold text-gray-700";
        pageLabel.textContent = `صفحة ${page} من ${pageCount}`;
        const next = createPageButton("التالي", page >= pageCount, () => {
            page += 1;
            render();
        });
        buttons.append(previous, pageLabel, next);
        footer.append(buttons);
        pagination.append(footer);
    };

    if (searchInput instanceof HTMLInputElement) {
        searchInput.addEventListener("input", () => {
            page = 1;
            render();
        });
    }
    filters.forEach((filter) => filter.addEventListener("change", () => {
        page = 1;
        render();
    }));
    pageSizeInput?.addEventListener("change", () => {
        pageSize = Number(pageSizeInput.value) || 10;
        page = 1;
        render();
    });

    render();
});

function createPageButton(label, disabled, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.disabled = disabled;
    button.className = "rounded-lg border border-gray-200 px-3 py-2 font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40";
    button.addEventListener("click", onClick);
    return button;
}

const animalFormModal = document.getElementById("animal-form-modal");
const animalForm = document.getElementById("animal-form");
if (animalFormModal instanceof HTMLDialogElement && animalForm instanceof HTMLFormElement) {
    document.querySelectorAll("[data-open-animal-form]").forEach((button) => {
        button.addEventListener("click", () => {
            const editing = button.dataset.openAnimalForm === "edit";
            animalForm.reset();
            animalForm.action = editing ? "/Admin/UpdateAnimal" : "/Admin/AddAnimal";
            document.getElementById("animal-form-title").textContent = editing ? "تعديل نوع الحيوان" : "إضافة نوع حيوان";
            document.getElementById("animal-form-submit").textContent = editing ? "حفظ التعديلات" : "إضافة الحيوان";
            document.getElementById("animal-form-id").value = editing ? button.dataset.id ?? "" : "";
            document.getElementById("animal-form-name").value = editing ? button.dataset.name ?? "" : "";
            document.getElementById("animal-form-initial-weight").value = editing ? button.dataset.initialWeight ?? "" : "";
            document.getElementById("animal-form-target-weight").value = editing ? button.dataset.targetWeight ?? "" : "";
            document.getElementById("animal-form-price").value = editing ? button.dataset.price ?? "" : "";
            document.getElementById("animal-form-insurance").value = editing ? button.dataset.insurance ?? "750" : "750";
            document.getElementById("animal-form-duration").value = editing ? button.dataset.duration ?? "" : "";
            animalFormModal.showModal();
        });
    });

    animalFormModal.querySelectorAll("[data-close-animal-form]").forEach((button) => {
        button.addEventListener("click", () => animalFormModal.close());
    });

    animalFormModal.addEventListener("click", (event) => {
        if (event.target === animalFormModal) {
            animalFormModal.close();
        }
    });
}
