import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/StatCard";
import { DollarSign, Receipt, ShoppingBag, TrendingUp } from "lucide-react";
import { usePos } from "@/store/posStore";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function Reports() {
  const { sales } = usePos();

  const today = new Date().toDateString();
  const todaysSales = sales.filter((s) => new Date(s.createdAt).toDateString() === today);
  const todayRevenue = todaysSales.reduce((a, s) => a + s.total, 0);
  const itemsToday = todaysSales.reduce((a, s) => a + s.items.reduce((b, i) => b + i.quantity, 0), 0);
  const avgTicket = todaysSales.length ? todayRevenue / todaysSales.length : 0;

  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number }>();
    sales.forEach((s) =>
      s.items.forEach((i) => {
        const key = i.id;
        const cur = map.get(key) ?? { name: i.name, qty: 0, revenue: 0 };
        cur.qty += i.quantity;
        cur.revenue += i.quantity * i.price;
        map.set(key, cur);
      })
    );
    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [sales]);

  const COLORS = ["hsl(var(--primary))", "hsl(var(--primary-glow))"];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">Track performance and best-sellers.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Sales Today" value={`$${todayRevenue.toFixed(2)}`} icon={DollarSign} tone="primary" delta={14} />
        <StatCard label="Transactions" value={String(todaysSales.length)} icon={Receipt} tone="success" delta={6} />
        <StatCard label="Items Sold" value={String(itemsToday)} icon={ShoppingBag} tone="warning" />
        <StatCard label="Avg. Ticket" value={`$${avgTicket.toFixed(2)}`} icon={TrendingUp} tone="primary" />
      </div>

      <Card className="p-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Top products</h3>
            <p className="text-xs text-muted-foreground">Ranked by revenue</p>
          </div>
          <Badge className="bg-primary-soft text-primary hover:bg-primary-soft">All time</Badge>
        </div>

        {topProducts.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-medium">No sales data yet</p>
            <p className="text-xs text-muted-foreground mt-1">Complete sales to see your reports.</p>
          </div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} margin={{ left: -20, right: 8, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "hsl(var(--accent) / 0.4)" }}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    boxShadow: "var(--shadow-lg)",
                  }}
                  formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]}
                />
                <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
                  {topProducts.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {topProducts.length > 0 && (
        <Card className="p-6 shadow-soft">
          <h3 className="font-semibold mb-4">Best-sellers</h3>
          <ul className="divide-y divide-border">
            {topProducts.map((p, i) => (
              <li key={p.name} className="flex items-center gap-4 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary text-sm font-bold">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.qty} sold</p>
                </div>
                <span className="text-sm font-semibold">${p.revenue.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
