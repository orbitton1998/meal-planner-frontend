import { useEffect, useState } from "react";
import { generateMealPlan, getMealPlanHistory } from "./api/mealPlanApi";
import { useAuth } from "./hooks/useAuth";

const SHOPPING_CATEGORIES = ["produce", "proteins", "dairy", "pantry", "other"];
const MEAL_SLOTS = [
  { key: "breakfast", label: "Breakfast", emoji: "🌅" },
  { key: "lunch", label: "Lunch", emoji: "☀️" },
  { key: "dinner", label: "Dinner", emoji: "🌙" },
];

const card = "rounded-xl border border-[var(--border)] bg-[var(--surface)]";

export default function App() {
  const { user, accessToken, signInWithGoogle, signOut } = useAuth();
  const [ingredients, setIngredients] = useState("");
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!user) {
      setHistory([]);
      return;
    }
    getMealPlanHistory(user.id, accessToken)
      .then(setHistory)
      .catch(() => setHistory([]));
  }, [user, accessToken]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    const ingredientList = ingredients.split(",").map(i => i.trim()).filter(Boolean);
    try {
      const result = await generateMealPlan(ingredientList, [], 2, accessToken);
      setMealPlan(result);

      if (result.saved && user) {
        getMealPlanHistory(user.id, accessToken).then(setHistory).catch(() => {});
      }
    } catch {
      setError("Couldn't generate a meal plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = (row) => {
    setMealPlan({
      meal_plan: row.plan,
      shopping_list: row.shopping_list,
      nutrition: null,
      ingredient_analysis: null,
    });
  };

  return (
    <div className="min-h-screen bg-[var(--page)] text-[var(--ink-primary)] font-sans">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <header className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">🍽️ Smart Meal Planner</h1>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-[var(--ink-secondary)] sm:inline">{user.email}</span>
              <button
                onClick={signOut}
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--ink-primary)] transition-colors hover:bg-[var(--surface)]"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--ink-primary)] transition-colors hover:bg-[var(--surface)]"
            >
              Sign in with Google
            </button>
          )}
        </header>

        <div className={`${card} p-5`}>
          <label className="mb-2 block text-sm font-medium text-[var(--ink-secondary)]">
            What's in your kitchen?
          </label>
          <textarea
            rows={4}
            className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--page)] p-3 text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            placeholder="Enter ingredients separated by commas: eggs, tomatoes, pasta..."
            value={ingredients}
            onChange={e => setIngredients(e.target.value)}
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !ingredients.trim()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {loading ? "Generating..." : "Generate Meal Plan ✨"}
          </button>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </div>

        {user && history.length > 0 && (
          <div className={`${card} mt-6 p-5`}>
            <h2 className="mb-3 text-sm font-semibold text-[var(--ink-secondary)]">📅 Your Saved Meal Plans</h2>
            <div className="flex flex-wrap gap-2">
              {history.map(row => (
                <button
                  key={row.id}
                  onClick={() => loadFromHistory(row)}
                  className="rounded-full border border-[var(--border)] px-3 py-1 text-sm transition-colors hover:bg-[var(--page)]"
                >
                  Week of {row.week_start}
                </button>
              ))}
            </div>
          </div>
        )}

        {mealPlan && (
          <div className="mt-8 space-y-8">
            <section>
              <h2 className="mb-3 text-lg font-semibold">Your Weekly Plan</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {Object.entries(mealPlan.meal_plan).map(([day, meals]) => (
                  <div key={day} className={`${card} p-4`}>
                    <h3 className="mb-2 font-semibold capitalize">{day}</h3>
                    <dl className="space-y-1.5 text-sm">
                      {MEAL_SLOTS.map(({ key, label, emoji }) => (
                        <div key={key} className="flex gap-2">
                          <dt className="shrink-0 text-[var(--ink-secondary)]">{emoji} {label}:</dt>
                          <dd>{meals[key]}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </div>
            </section>

            {mealPlan.nutrition && (
              <section>
                <h2 className="mb-3 text-lg font-semibold">🥗 Nutrition (daily average)</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: "Calories", value: mealPlan.nutrition.daily_average.calories, unit: "kcal" },
                    { label: "Protein", value: mealPlan.nutrition.daily_average.protein_g, unit: "g" },
                    { label: "Carbs", value: mealPlan.nutrition.daily_average.carbs_g, unit: "g" },
                    { label: "Fat", value: mealPlan.nutrition.daily_average.fat_g, unit: "g" },
                  ].map(stat => (
                    <div key={stat.label} className={`${card} p-4 text-center`}>
                      <div className="text-xs uppercase tracking-wide text-[var(--ink-secondary)]">{stat.label}</div>
                      <div className="mt-1 text-2xl font-semibold">
                        {stat.value}
                        <span className="ml-1 text-sm font-normal text-[var(--ink-muted)]">{stat.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-sm text-[var(--ink-secondary)]">{mealPlan.nutrition.nutrition_notes}</p>
              </section>
            )}

            <section>
              <h2 className="mb-3 text-lg font-semibold">🛒 Shopping List</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {SHOPPING_CATEGORIES.filter(category => mealPlan.shopping_list[category]?.length).map(category => (
                  <div key={category} className={`${card} p-4`}>
                    <h3 className="mb-2 text-sm font-semibold capitalize text-[var(--ink-secondary)]">{category}</h3>
                    <ul className="list-inside list-disc space-y-1 text-sm">
                      {mealPlan.shopping_list[category].map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
