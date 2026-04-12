import {useAuth} from "../contexts/AuthContext";
import {Link, Outlet, useNavigate} from "react-router";
import {useTranslation} from "react-i18next";

export function Home() {
    const {t} = useTranslation()
    const {user, logout} = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout()
        navigate("/login");
    };

    return (
        <div className="home-container">
            <h1 className="home-title">{t("home.appName")}</h1>

            <nav className="home-nav">
                <Link className="nav-link" to="/">{t("home.appName")}</Link>
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
                        <Link className="nav-link" to="/login">{t("home.login")}</Link>
                        <span className="nav-separator">/</span>
                        <Link className="nav-link" to="/register">{t("home.register")}</Link>
                    </>
                )}
            </div>

            <main className="home-content">
                <Outlet />
            </main>
        </div>
    );
}