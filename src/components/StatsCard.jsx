import { FaArrowUp, FaArrowDown } from "react-icons/fa";

function StatsCard({ title, amount, change, type }) {
  return (
    <div className="stats-card">
      <div className="stats-top">
        <h3>{title}</h3>
        <span className={type === "profit" ? "up" : "down"}>
          {type === "profit" ? <FaArrowUp /> : <FaArrowDown />}
          {change}%
        </span>
      </div>

      <h2>{amount}</h2>
    </div>
  );
}

export default StatsCard;