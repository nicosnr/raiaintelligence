export type CountyFinance = {
  code: number;
  allocation: number; // total money allocated (KES)
  spent: number; // money spent so far (KES)
  percent: number; // percent spent (0-100)
};

export function getCountyFinance(code: number): CountyFinance {
  // Simple deterministic sample data so we don't need a DB for the first iteration.
  // Allocation scales with county code; percent spent is pseudo-random but stable.
  const allocation = 300_000_000 + code * 5_000_000; // KES
  const pseudo = ((code * 37) % 83) + 7; // gives 7..89
  const percent = Math.min(100, Math.max(0, pseudo));
  const spent = Math.round((allocation * percent) / 100);
  return { code, allocation, spent, percent };
}

export function formatKES(n: number) {
  try {
    return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n);
  } catch {
    // fallback
    return `KES ${Math.round(n).toLocaleString()}`;
  }
}
