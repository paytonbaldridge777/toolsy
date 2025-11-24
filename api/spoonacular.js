export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  if (!url.pathname.startsWith("/api/spoonacular")) {
    return new Response("Not Found", { status: 404 });
  }

  try {
    // Replace /api/spoonacular with the actual Spoonacular path
    const spoonacularPath = url.pathname.replace("/api/spoonacular", "");
    const spoonacularUrl = `https://api.spoonacular.com${spoonacularPath}${url.search}`;

    // Send the request to Spoonacular API
    const headers = new Headers();
    headers.append("Authorization", `Bearer ${env.SPOONACULAR_API_TOKEN}`);

    const spoonacularResponse = await fetch(spoonacularUrl, {
      method: request.method,
      headers: headers,
    });

    // Return the response from Spoonacular
    return new Response(await spoonacularResponse.body, {
      status: spoonacularResponse.status,
      headers: { "Content-Type": spoonacularResponse.headers.get("Content-Type") },
    });
  } catch (error) {
    console.error("Failed to proxy Spoonacular request:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}