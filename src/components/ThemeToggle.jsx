import { useTheme } from "../context/ThemeContext";
import { FaMoon, FaSun } from "react-icons/fa";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button className="theme-toggle" onClick={toggleTheme}>
      <div className={`toggle-circle ${theme === "light" ? "active" : ""}`}>
        {theme === "dark" ? <FaMoon /> : <FaSun />}
      </div>

      <span>
        {theme === "dark" ? "Dark" : "Light"}
      </span>
    </button>
  );
}

export default ThemeToggle;