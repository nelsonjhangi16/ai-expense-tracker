import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const data = [
  { name: "Food", value: 400 },
  { name: "Bills", value: 300 },
  { name: "Shopping", value: 200 },
];

const COLORS = ["#4f46e5", "#22c55e", "#f59e0b"];

function PieChartBox() {
  return (
    <div className="card">
      <h3>Expense Breakdown</h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            outerRadius={100}
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PieChartBox;