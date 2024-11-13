export const elementColors = {
  dendro: "#2ecc71",
  pyro: "#e74c3c",
  hydro: "#3498db",
  electro: "#9b59b6",
  anemo: "#1abc9c",
  geo: "#f1c40f",
  cryo: "#ecf0f1",
};

export const decideColor = (element: string) => {
  return (
    elementColors[element.toLowerCase() as keyof typeof elementColors] || "#000"
  );
};
