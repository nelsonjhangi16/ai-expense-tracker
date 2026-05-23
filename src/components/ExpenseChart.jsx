import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", expense: 500 },
  { month: "Feb", expense: 800 },
  { month: "Mar", expense: 400 },
];

function ExpenseChart() {
  return (
    <div className="card">
      <h3>Expense Trends</h3>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="expense"
            stroke="#4f46e5"
            fill="#4f46e5"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ExpenseChart;