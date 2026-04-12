import {useAuth} from "../contexts-desktop/AuthContext";
import {Link, Outlet, useNavigate} from "react-router";

export function Home() {
    const {user, logout} = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout()
        navigate("/login");
    };

    return (
        <div className="home-container">
            <h1 className="home-title">Home</h1>

            <nav className="home-nav">
                <Link className="nav-link" to="/">Home Screen</Link>
                <span className="nav-separator">/</span>
            </nav>

            <div className="home-auth">
                {user ? (
                    <>
                        <Link className="profile-link" to="/profile">
                            {user.name}
                        </Link>
                        <button className="logout-button" onClick={handleLogout}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link className="nav-link" to="/login">Login</Link>
                        <span className="nav-separator">/</span>
                        <Link className="nav-link" to="/register">Register</Link>
                    </>
                )}
            </div>

            <main className="home-content">
                <Outlet />
            </main>
        </div>
    );
}