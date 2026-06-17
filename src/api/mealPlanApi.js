const API_URL = "http://localhost:8000";

export async function generateMealPlan(ingredients, preferences = [], people = 2) {
  const response = await fetch(`${API_URL}/generate-meal-plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ingredients, preferences, people }),
  });

  if (!response.ok) throw new Error("Failed to generate meal plan");
  return response.json();
}