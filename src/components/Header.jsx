import { FaBell, FaSearch } from "react-icons/fa";
import ThemeToggle from "./ThemeToggle";

function Header() {
  return (
    <div className="header">
      <div className="header-left">
        <h2>Dashboard</h2>
        <p>Welcome back 👋</p>
      </div>

      <div className="header-right">
        <div className="search-box">
          <FaSearch />
          <input type="text" placeholder="Search..." />
        </div>

        <ThemeToggle />

        <div className="icons">
          <FaBell />
        </div>

        <div className="profile">
          <div className="avatar">U</div>
        </div>
      </div>
    </div>
  );
}

export default Header;