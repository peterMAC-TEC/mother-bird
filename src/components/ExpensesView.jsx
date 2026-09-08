import ExpenseCapture from "./ExpenseCapture.jsx";
import ExpenseRow from "./ExpenseRow.jsx";
import { totalsByCategory } from "../lib/expenseLogic.js";

export default function ExpensesView({ expenses, onAddExpense, onToggleCategory, onDeleteExpense }) {
  const totals = totalsByCategory(expenses);
  const sorted = [...expenses].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return (
    <section>
      <ExpenseCapture onAddExpense={onAddExpense} onToggleCategory={onToggleCategory} />

      <div className="expense-totals">
        <div className="expense-total-tile">
          <span className="expense-total-label">Personal</span>
          <span className="expense-total-value">₹{totals.personal.toLocaleString("en-IN")}</span>
        </div>
        <div className="expense-total-tile">
          <span className="expense-total-label">Business</span>
          <span className="expense-total-value">₹{totals.business.toLocaleString("en-IN")}</span>
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="empty-state">Tap the mic above and log your first expense — try "40 rupees for tea."</p>
      ) : (
        <ul className="expense-list">
          {sorted.map((expense) => (
            <ExpenseRow key={expense.id} expense={expense} onToggleCategory={onToggleCategory} onDelete={onDeleteExpense} />
          ))}
        </ul>
      )}
    </section>
  );
}
