import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAppContext } from "../Context/UserContext";
type UserDatas = {
    email: string;
    password: string;
};

type RegisterData = {
    email: string;
    username: string;
    password: string;
    ProfileImage: File | null;
    role: string;
};

function Auth() {
    const navigate = useNavigate();
    const { setUser, setLoggedIn } = useAppContext();
    const [isSignup, setIsSignup] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [UserData, setUserData] = useState<UserDatas>({
        email: "",
        password: "",
    });

    const [RegisterData, setRegisterData] = useState<RegisterData>({
        email: "",
        username: "",
        password: "",
        ProfileImage: null,
        role: "",
    });

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        if (isSignup) {
            setRegisterData({
                ...RegisterData,
                [name]: value,
            });
        } else {
            setUserData({
                ...UserData,
                [name]: value,
            });
        }
    };

    const handleProfileImage = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];

        if (!file) return;

        // Frontend validation
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        // 5 MB
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be smaller than 5 MB");
            return;
        }

        setRegisterData({
            ...RegisterData,
            ProfileImage: file,
        });
    };

    const handleLogin = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setLoading(true);
        setError(null);

        if (!UserData.email || !UserData.password) {
            toast.error("Please fill in all fields");
            setLoading(false);
            return;
        }

        try {
            const response = await api.post(
                "user/login",
                UserData,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            setLoggedIn(true);
            setUser({
                id: response.data.user.id,
                email: response.data.user.email,
                username: response.data.user.username,
                profileImage: response.data.user.ProfileImage,
                role: response.data.user.role,
            });
            navigate("/");

            toast.success("Login successful");

            console.log("Login successful:", response.data);

        } catch (error) {

            if (axios.isAxiosError(error)) {
                const message =
                    error.response?.data?.message ||
                    "Error logging in";

                setError(message);
                toast.error(message);
            } else {
                toast.error("Error logging in");
            }

            console.error("Error logging in:", error);

        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setLoading(true);
        setError(null);

        if (
            !RegisterData.username ||
            !RegisterData.email ||
            !RegisterData.password ||
            !RegisterData.role
        ) {
            toast.error("Please fill in all fields");
            setLoading(false);
            return;
        }
        if (RegisterData.password.length < 6) {
            toast.error("Password must be at least 6 characters long");
            setLoading(false);
            return;
        }
        try {
            const formData = new FormData();

            formData.append("username", RegisterData.username);
            formData.append("email", RegisterData.email);
            formData.append("password", RegisterData.password);
            formData.append("role", RegisterData.role);

            if (RegisterData.ProfileImage) {
                formData.append(
                    "ProfileImage",
                    RegisterData.ProfileImage
                );
            }

            const response = await api.post(
                "user/register",
                formData
            );
            setLoggedIn(true);
            toast.success("Registration successful");
            navigate("/");
            console.log(
                "Registration successful:",
                response.data
            );

            setIsSignup(false);

        } catch (error) {

            if (axios.isAxiosError(error)) {
                const message =
                    error.response?.data?.message ||
                    "Error registering";

                setError(message);
                toast.error(message);
            } else {
                toast.error("Error registering");
            }

            console.error("Error registering:", error);

        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">

            <div className="w-full max-w-md">

                {/* Logo / Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold text-xl shadow-lg shadow-blue-600/20 mb-4">
                        A
                    </div>

                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        {isSignup ? "Create your account" : "Welcome back"}
                    </h1>

                    <p className="text-slate-400 mt-2 text-sm">
                        {isSignup
                            ? "Join us and get started today"
                            : "Sign in to continue to your account"}
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">

                    {/* Error */}
                    {error && (
                        <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <form
                        className="space-y-5"
                        onSubmit={
                            isSignup
                                ? handleRegister
                                : handleLogin
                        }
                    >

                        {/* Signup fields */}
                        {isSignup && (
                            <>
                                {/* Profile Image */}
                                <div className="flex flex-col items-center">

                                    <label
                                        htmlFor="ProfileImage"
                                        className="relative cursor-pointer group"
                                    >
                                        <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden group-hover:border-blue-500 transition">

                                            {RegisterData.ProfileImage ? (
                                                <img
                                                    src={URL.createObjectURL(
                                                        RegisterData.ProfileImage
                                                    )}
                                                    alt="Profile preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="text-center">
                                                    <svg
                                                        className="w-7 h-7 mx-auto text-slate-400"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={1.8}
                                                            d="M12 16v-4m0 0V8m0 4h4m-4 0H8m12 0a8 8 0 11-16 0 8 8 0 0116 0z"
                                                        />
                                                    </svg>

                                                    <span className="text-[10px] text-slate-500">
                                                        Add photo
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </label>

                                    <input
                                        id="ProfileImage"
                                        name="ProfileImage"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleProfileImage}
                                        className="hidden"
                                    />

                                    <p className="text-xs text-slate-400 mt-2">
                                        JPG, PNG or WEBP · Max 5 MB
                                    </p>
                                </div>

                                {/* Username */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-slate-700">
                                        Name
                                    </label>

                                    <input
                                        name="username"
                                        type="text"
                                        value={RegisterData.username}
                                        onChange={handleInputChange}
                                        placeholder="Enter your name"
                                        className="w-full h-11 border border-slate-200 rounded-xl px-4 text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                    />
                                </div>

                                {/* Role */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-slate-700">
                                        Role
                                    </label>

                                    <select
                                        name="role"
                                        value={RegisterData.role}
                                        onChange={handleInputChange}
                                        className="select w-full h-11 min-h-11 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                                    >
                                        <option
                                            value=""
                                            disabled
                                        >
                                            Select your role
                                        </option>

                                        <option value="student">
                                            Student
                                        </option>

                                        <option value="teacher">
                                            Teacher
                                        </option>
                                    </select>
                                </div>
                            </>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-slate-700">
                                Email
                            </label>

                            <input
                                name="email"
                                type="email"
                                value={
                                    isSignup
                                        ? RegisterData.email
                                        : UserData.email
                                }
                                onChange={handleInputChange}
                                placeholder="Enter your email"
                                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-slate-700">
                                Password
                            </label>

                            <input
                                name="password"
                                type="password"
                                value={
                                    isSignup
                                        ? RegisterData.password
                                        : UserData.password
                                }
                                onChange={handleInputChange}
                                placeholder="Enter your password"
                                className="w-full h-11 border border-slate-200 rounded-xl px-4 text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium rounded-xl transition active:scale-[0.98] flex items-center justify-center"
                        >
                            {loading ? (
                                <span className="loading loading-spinner loading-sm" />
                            ) : (
                                isSignup
                                    ? "Create Account"
                                    : "Login"
                            )}
                        </button>
                    </form>

                    {/* Switch */}
                    <div className="text-center mt-6 pt-6 border-t border-slate-100 text-sm text-slate-500">

                        {isSignup ? (
                            <>
                                Already have an account?{" "}

                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsSignup(false);
                                        setError(null);
                                    }}
                                    className="text-blue-600 font-semibold hover:text-blue-700 hover:underline"
                                >
                                    Login
                                </button>
                            </>
                        ) : (
                            <>
                                Don't have an account?{" "}

                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsSignup(true);
                                        setError(null);
                                    }}
                                    className="text-blue-600 font-semibold hover:text-blue-700 hover:underline"
                                >
                                    Sign Up
                                </button>
                            </>
                        )}
                    </div>

                </div>

                <p className="text-center text-xs text-slate-500 mt-6">
                    By continuing, you agree to our terms and privacy policy.
                </p>

            </div>
        </main>
    );
}

export default Auth;
