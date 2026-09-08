import { formatShort } from "../lib/dates.js";

export default function ExpenseRow({ expense, onToggleCategory, onDelete }) {
  const isBusiness = expense.category === "business";

  return (
    <li className="expense-row">
      <div className="expense-row-main">
        <span className="expense-row-amount">₹{expense.amountRupees.toLocaleString("en-IN")}</span>
        <span className="expense-row-desc">{expense.description}</span>
      </div>
      <div className="expense-row-meta">
        <button
          type="button"
          className={isBusiness ? "expense-category-pill expense-category-business" : "expense-category-pill expense-category-personal"}
          onClick={() => onToggleCategory(expense.id)}
          aria-label={`Currently ${expense.category} — tap to change`}
        >
          {isBusiness ? "Business" : "Personal"}
        </button>
        <span className="expense-row-date">{formatShort(expense.createdAt)}</span>
        <button
          type="button"
          className="task-delete"
          aria-label={`Delete expense: ${expense.description}`}
          onClick={() => onDelete(expense.id)}
        >
          ×
        </button>
      </div>
    </li>
  );
}
