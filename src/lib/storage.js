const GOALS_KEY = "forge-flow:goals";
const TASKS_KEY = "forge-flow:tasks";
const KPIS_KEY = "forge-flow:kpis";
const SETTINGS_KEY = "forge-flow:settings";
const EXPENSES_KEY = "forge-flow:expenses";

export const ALL_KEYS = [GOALS_KEY, TASKS_KEY, KPIS_KEY, SETTINGS_KEY, EXPENSES_KEY];

const DEFAULT_SETTINGS = { capacityMinutes: null };

function loadList(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveList(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // localStorage unavailable (e.g. private browsing) — app still works for this session
  }
}

export const loadGoals = () => loadList(GOALS_KEY);
export const saveGoals = (goals) => saveList(GOALS_KEY, goals);
export const loadTasks = () => loadList(TASKS_KEY);
export const saveTasks = (tasks) => saveList(TASKS_KEY, tasks);
export const loadKPIs = () => loadList(KPIS_KEY);
export const saveKPIs = (kpis) => saveList(KPIS_KEY, kpis);
export const loadExpenses = () => loadList(EXPENSES_KEY);
export const saveExpenses = (expenses) => saveList(EXPENSES_KEY, expenses);

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // localStorage unavailable — ignore
  }
}
