export async function getPassengerData() {
  const res = await fetch('http://localhost:5000/config');
  if (!res.ok) {
    throw new Error(`Config HTTP error: ${res.status}`);
  }
  const config = await res.json();
  return config;
}
