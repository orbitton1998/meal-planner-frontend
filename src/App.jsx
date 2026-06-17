import { useState } from "react";
import { generateMealPlan } from "./api/mealPlanApi";

export default function App() {
  const [ingredients, setIngredients] = useState("");
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const ingredientList = ingredients.split(",").map(i => i.trim());
    const result = await generateMealPlan(ingredientList);
    setMealPlan(result);
    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>🍽️ Smart Meal Planner</h1>
      
      <textarea
        rows={4}
        style={{ width: "100%", fontSize: "1rem" }}
        placeholder="Enter ingredients separated by commas: eggs, tomatoes, pasta..."
        value={ingredients}
        onChange={e => setIngredients(e.target.value)}
      />
      
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Generating..." : "Generate Meal Plan ✨"}
      </button>

      {mealPlan && (
        <div>
          <h2>Your Weekly Plan</h2>
          {Object.entries(mealPlan.meal_plan).map(([day, meals]) => (
            <div key={day} style={{ marginBottom: "1rem", border: "1px solid #ccc", padding: "1rem" }}>
              <h3>{day.charAt(0).toUpperCase() + day.slice(1)}</h3>
              <p>🌅 <b>Breakfast:</b> {meals.breakfast}</p>
              <p>☀️ <b>Lunch:</b> {meals.lunch}</p>
              <p>🌙 <b>Dinner:</b> {meals.dinner}</p>
            </div>
          ))}
          
          <h2>🛒 Shopping List</h2>
          <ul>
            {mealPlan.shopping_list.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}