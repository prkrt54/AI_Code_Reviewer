import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaFolderOpen, FaPlus, FaSignOutAlt , FaUser } from "react-icons/fa";
import { GoGraph } from "react-icons/go";
import { useAuth } from "../../contexts/AuthContext";
import "./home.css";

const Home = () => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    console.log(user);

    const [projects, setProjects] = useState([]);

    function navigateToProject(projectId) {
        navigate(`/project/${projectId}`);
    }

    function handleLogout() {
        logout();
        navigate("/login");
    }

    useEffect(() => {
        axios
            .get("https://ai-code-reviewer-z3vr.onrender.com/projects/get-all")
            .then((response) => {
                setProjects(response.data.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    return (
        <main className="home">
            <section className="home-section">

                {/* Header */}

                <div className="home-header">

                    <div className="welcome">

                        <h1>
                            👋 Welcome back,
                            <span> {user?.name || "User"}</span>
                        </h1>

                        <p>
                            Manage all your coding projects from one beautiful dashboard.
                        </p>

                    </div>

                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                    >
                        <FaSignOutAlt />
                        Logout
                    </button>

                </div>

                {/* Stats */}

                <div className="stats">

                    <div className="stat-card">
                        <div className="folder-circle-1">
                            <GoGraph />
                        </div>
                        <div className="stat-card-sub">
                            <h2>{projects.length}</h2>
                            <p>Total Projects</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="folder-circle-1">
                            <FaUser />
                        </div>
                        <div className="stat-card-sub">
                            <h2>{user?.name}</h2>
                            <p>User</p>
                        </div>
                    </div>

                </div>

                {/* New Project */}

                <div className="top-action">

                    <button
                        className="new-project-btn"
                        onClick={() => navigate("/create-project")}
                    >
                        <FaPlus />
                        New Project
                    </button>

                </div>

                {/* Empty State */}

                {projects.length === 0 ? (

                    <div className="empty-state">

                        <FaFolderOpen className="empty-icon" />

                        <h2>No Projects Yet</h2>

                        <p>
                            Create your first AI project and start collaborating.
                        </p>

                        <button
                            className="new-project-btn"
                            onClick={() => navigate("/create-project")}
                        >
                            <FaPlus />
                            Create Project
                        </button>

                    </div>

                ) : (

                    <div className="projects">

                        {projects.map((project) => (

                            <div
                                key={project._id}
                                className="project-card"
                                onClick={() =>
                                    navigateToProject(project._id)
                                }
                            >

                                <div className="folder-circle">

                                    <FaFolderOpen />

                                </div>

                                <h3>{project.name}</h3>

                                <p>Click to open project</p>

                            </div>

                        ))}

                    </div>

                )}
            </section>
        </main>
    );
};

export default Home;