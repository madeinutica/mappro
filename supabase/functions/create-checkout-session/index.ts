// Minimal test function
export async function handler(req) {
  return new Response(JSON.stringify({ message: 'Hello World' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}