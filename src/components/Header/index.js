import './index.css'
import {Link} from 'react-router-dom'
import Logout from '../Logout'

const Header = () => (
  <ul className="header-container">
    <Link to="/">
      <li className="website-logo">
        <img
          src="https://assets.ccbp.in/frontend/react-js/logo-img.png"
          alt="website logo"
        />
      </li>
    </Link>
    <li>
      <ul>
        <Link to="/">
          <li>Home</li>
        </Link>
        <Link to="/jobs">
          <li>Jobs</li>
        </Link>
      </ul>
    </li>
    <li>
      <Logout />
    </li>
  </ul>
)

export default Header
