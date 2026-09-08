import AddGoalForm from "./AddGoalForm.jsx";
import GoalCard from "./GoalCard.jsx";
import ShareProgress from "./ShareProgress.jsx";

export default function GoalsView({ goals, tasks, onAddGoal, onUseTemplate, onDeleteGoal, onAddTask, onToggle, onDelete }) {
  return (
    <section>
      <AddGoalForm onAddGoal={onAddGoal} onUseTemplate={onUseTemplate} />
      {goals.length === 0 ? (
        <p className="empty-state">Add a long-term goal, then break it into small tasks you can actually do today.</p>
      ) : (
        <ul className="goal-list">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              tasks={tasks}
              onAddTask={onAddTask}
              onToggle={onToggle}
              onDelete={onDelete}
              onDeleteGoal={onDeleteGoal}
            />
          ))}
        </ul>
      )}

      <h2 className="section-heading">Share progress</h2>
      <ShareProgress goals={goals} tasks={tasks} />
    </section>
  );
}
