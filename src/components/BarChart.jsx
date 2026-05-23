import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", income: 2400 },
  { month: "Feb", income: 1800 },
  { month: "Mar", income: 3200 },
];

function BarChartBox() {
  return (
    <div className="card">
      <h3>Monthly Income</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="income" fill="#22c55e" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BarChartBox;