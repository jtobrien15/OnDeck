import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const stats = [
  { title: "Active Classes", value: "—" },
  { title: "Total Students", value: "—" },
  { title: "Pending Prereqs", value: "—" },
  { title: "Action Items", value: "—" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
