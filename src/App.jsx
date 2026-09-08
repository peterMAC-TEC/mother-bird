import { useEffect, useState } from "react";
import TabNav from "./components/TabNav.jsx";
import TodayView from "./components/TodayView.jsx";
import GoalsView from "./components/GoalsView.jsx";
import KPIsView from "./components/KPIsView.jsx";
import DashboardView from "./components/DashboardView.jsx";
import ExpensesView from "./components/ExpensesView.jsx";
import SharedProgressView from "./components/SharedProgressView.jsx";
import {
  loadGoals, saveGoals, loadTasks, saveTasks,
  loadKPIs, saveKPIs, loadSettings, saveSettings,
  loadExpenses, saveExpenses,
} from "./lib/storage.js";
import { todayISO } from "./lib/dates.js";
import { toggledCheckIns } from "./lib/taskLogic.js";
import { upsertEntry } from "./lib/kpiLogic.js";
import { readShareSnapshotFromHash } from "./lib/shareLink.js";

export default function App() {
  const sharedSnapshot = readShareSnapshotFromHash(window.location.hash);
  const [tab, setTab] = useState("expenses");
  const [goals, setGoals] = useState(() => loadGoals());
  const [tasks, setTasks] = useState(() => loadTasks());
  const [kpis, setKpis] = useState(() => loadKPIs());
  const [settings, setSettings] = useState(() => loadSettings());
  const [expenses, setExpenses] = useState(() => loadExpenses());

  useEffect(() => saveGoals(goals), [goals]);
  useEffect(() => saveTasks(tasks), [tasks]);
  useEffect(() => saveKPIs(kpis), [kpis]);
  useEffect(() => saveSettings(settings), [settings]);
  useEffect(() => saveExpenses(expenses), [expenses]);

  function handleAddGoal({ title, notes }) {
    setGoals((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title, notes, createdAt: todayISO() },
    ]);
  }

  function handleUseTemplate(template) {
    const goalId = crypto.randomUUID();
    const today = todayISO();
    setGoals((prev) => [...prev, { id: goalId, title: template.title, notes: template.notes, createdAt: today }]);
    setTasks((prev) => [
      ...prev,
      ...template.tasks.map((title) => ({
        id: crypto.randomUUID(),
        title,
        goalId,
        recurrence: "once",
        dueDate: today,
        estimateMinutes: null,
        checkIns: [],
        createdAt: today,
      })),
    ]);
  }

  function handleDeleteGoal(goalId) {
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
    setTasks((prev) => prev.filter((t) => t.goalId !== goalId));
  }

  function handleAddTask({ title, goalId, recurrence, recurrenceDays, dueDate, estimateMinutes }) {
    setTasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title,
        goalId,
        recurrence,
        recurrenceDays: recurrenceDays ?? null,
        dueDate,
        estimateMinutes: estimateMinutes ?? null,
        checkIns: [],
        createdAt: todayISO(),
      },
    ]);
  }

  function handleToggle(taskId) {
    const today = todayISO();
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, checkIns: toggledCheckIns(task, today) } : task,
      ),
    );
  }

  function handleDelete(taskId) {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  }

  function handleChangeCapacity(capacityMinutes) {
    setSettings((prev) => ({ ...prev, capacityMinutes }));
  }

  function handleAddKPI({ name, unit }) {
    setKpis((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name, unit, entries: [], createdAt: todayISO() },
    ]);
  }

  function handleLogKPIValue(kpiId, iso, value) {
    setKpis((prev) => prev.map((kpi) => (kpi.id === kpiId ? upsertEntry(kpi, iso, value) : kpi)));
  }

  function handleDeleteKPI(kpiId) {
    setKpis((prev) => prev.filter((kpi) => kpi.id !== kpiId));
  }

  function handleAddExpense(expense) {
    setExpenses((prev) => [...prev, expense]);
  }

  function handleToggleExpenseCategory(expenseId) {
    setExpenses((prev) =>
      prev.map((e) => (e.id === expenseId ? { ...e, category: e.category === "business" ? "personal" : "business" } : e)),
    );
  }

  function handleDeleteExpense(expenseId) {
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
  }

  if (sharedSnapshot) {
    return <SharedProgressView snapshot={sharedSnapshot} />;
  }

  return (
    <main className="app">
      <header className="app-header">
        <div className="app-header-brand">
          <img src="/icon-192.png" alt="" className="app-logo" />
          <h1>Mother Bird</h1>
        </div>
        <p className="app-tagline">Break the big goal down. Show up on the small one.</p>
      </header>

      {tab === "today" && (
        <TodayView
          goals={goals}
          tasks={tasks}
          settings={settings}
          onAddTask={handleAddTask}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onChangeCapacity={handleChangeCapacity}
        />
      )}
      {tab === "goals" && (
        <GoalsView
          goals={goals}
          tasks={tasks}
          onAddGoal={handleAddGoal}
          onUseTemplate={handleUseTemplate}
          onDeleteGoal={handleDeleteGoal}
          onAddTask={handleAddTask}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      )}
      {tab === "kpis" && (
        <KPIsView
          kpis={kpis}
          onAddKPI={handleAddKPI}
          onLogValue={handleLogKPIValue}
          onDelete={handleDeleteKPI}
        />
      )}
      {tab === "expenses" && (
        <ExpensesView
          expenses={expenses}
          onAddExpense={handleAddExpense}
          onToggleCategory={handleToggleExpenseCategory}
          onDeleteExpense={handleDeleteExpense}
        />
      )}
      {tab === "dashboard" && <DashboardView goals={goals} tasks={tasks} />}

      <TabNav active={tab} onChange={setTab} />
    </main>
  );
}
