const API_URL = "http://localhost:8000";

function authHeaders(accessToken) {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export async function generateMealPlan(ingredients, preferences = [], people = 2, accessToken = null) {
  const response = await fetch(`${API_URL}/generate-meal-plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(accessToken) },
    body: JSON.stringify({ ingredients, preferences, people }),
  });

  if (!response.ok) throw new Error("Failed to generate meal plan");
  return response.json();
}

export async function getMealPlanHistory(userId, accessToken) {
  const response = await fetch(`${API_URL}/meal-plans/${userId}`, {
    headers: authHeaders(accessToken),
  });

  if (!response.ok) throw new Error("Failed to fetch meal plan history");
  return response.json();
}
