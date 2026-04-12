import {useReducer} from "react";
import {useNavigate} from "react-router";
import {useAuth} from "../contexts-desktop/AuthContext";
import {api, ApiError} from "@commons/api/api";

type LoginState = {
    email: string;
    password: string;
    error: string | undefined;
    stage: "editing" | "posting" | "succeed" | "failed";
};

type LoginAction =
    | { type: "input-change"; email: string; password: string }
    | { type: "post" }
    | { type: "success" }
    | { type: "error"; message: string };

function reduce(state: LoginState, action: LoginAction): LoginState {
    switch (action.type) {
        case "input-change":
            return {
                ...state,
                email: action.email,
                password: action.password,
            };
        case "post":
            return {
                ...state,
                stage: "posting",
                error: undefined,
            };
        case "success":
            return {
                email: "",
                password: "",
                error: undefined,
                stage: "succeed",
            };
        case "error":
            return {
                ...state,
                stage: "failed",
                error: action.message,
            };
        default:
            return state;
    }
}

const initState: LoginState = {
    email: "",
    password: "",
    error: undefined,
    stage: "editing",
};

export function Login() {
    const [state, dispatch] = useReducer(reduce, initState);
    const {login} = useAuth();
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch({type: "post"});

        try {
            const response = await api.createToken({
                email: state.email,
                password: state.password,
            });
            await login(state.email, state.password);
            dispatch({type: "success"});
            navigate("/");
        } catch (err) {
            if (err instanceof ApiError) {
                dispatch({type: "error", message: err.message});
            } else {
                dispatch({
                    type: "error",
                    message: "An error occurred during login",
                });
            }
        }
    };

    return (
        <div className="auth-container">
            <h2>Login</h2>
            <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-field">
                    <label>
                        Email
                        <input
                            type="email"
                            name="email"
                            value={state.email}
                            onChange={(e) =>
                                dispatch({
                                    type: "input-change",
                                    email: e.target.value,
                                    password: state.password,
                                })
                            }
                            required
                            autoComplete="email"
                        />
                    </label>
                </div>
                <div className="form-field">
                    <label>
                        Password
                        <input
                            type="password"
                            name="password"
                            value={state.password}
                            onChange={(e) =>
                                dispatch({
                                    type: "input-change",
                                    email: state.email,
                                    password: e.target.value,
                                })
                            }
                            required
                            autoComplete="current-password"
                        />
                    </label>
                </div>
                {state.error && (
                    <div className="form-error">{state.error}</div>
                )}
                <button
                    className="submit-button"
                    type="submit"
                    disabled={state.stage === "posting"}
                >
                    {state.stage === "posting"
                        ? "Logging in..."
                        : "Login"}
                </button>
            </form>
        </div>
    );
}