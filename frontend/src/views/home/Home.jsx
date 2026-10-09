import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaFolderOpen, FaPlus, FaSignOutAlt } from "react-icons/fa";
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
                <nav className="top-nav">
                    <div className="brand-lockup">
                        <div className="brand-mark"><span></span><span></span><span></span></div>
                        <div>
                            <strong>Code Reviewer</strong>
                            <small>AI project workspace</small>
                        </div>
                    </div>
                    <div className="nav-context">
                        <span className="nav-context-label">Workspace</span>
                        <span className="nav-divider"></span>
                        <span className="nav-current">Overview</span>
                    </div>
                    <div className="header-actions">
                        <div className="workspace-status">
                            <span className="status-dot"></span>
                            Workspace overview
                        </div>
                        <div className="profile-chip">
                            <span className="profile-avatar">{(user?.name || "U").charAt(0).toUpperCase()}</span>
                            <span className="profile-name">{user?.name || "User"}</span>
                        </div>
                        <button
                            className="logout-btn"
                            onClick={handleLogout}
                            aria-label="Logout"
                        >
                            <FaSignOutAlt />
                            <span>Logout</span>
                        </button>
                    </div>
                </nav>

                <div className="dashboard-intro">
                    <div className="welcome">
                        <p className="eyebrow">Your workspace is ready</p>
                        <h1>Build, review,<br /><span>ship with confidence.</span></h1>
                        <p className="hero-copy">
                            A focused command center for your AI-assisted development projects.
                        </p>
                        <button
                            className="new-project-btn hero-cta"
                            onClick={() => navigate("/create-project")}
                        >
                            <FaPlus />
                            Create new project
                        </button>
                    </div>
                    <div className="hero-visual" aria-hidden="true">
                        <div className="visual-grid"></div>
                        <div className="visual-window">
                            <div className="window-bar"><i></i><i></i><i></i><span>workspace.ai</span></div>
                            <div className="window-body">
                                <span className="code-line line-long"></span>
                                <span className="code-line line-short"></span>
                                <span className="code-line line-medium"></span>
                                <span className="code-line line-accent"></span>
                                <span className="code-line line-long"></span>
                            </div>
                        </div>
                        <div className="visual-badge"><GoGraph /><span>AI workspace</span></div>
                    </div>
                </div>

                <div className="workspace-grid">
                    <section className="projects-panel">
                        <div className="section-heading">
                            <div>
                                <p className="eyebrow">Workspace library</p>
                                <h2>Your projects</h2>
                                <p>Pick up where you left off.</p>
                            </div>
                            <button
                                className="new-project-btn"
                                onClick={() => navigate("/create-project")}
                            >
                                <FaPlus />
                                New project
                            </button>
                        </div>

                        {projects.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-illustration" aria-hidden="true">
                                    <div className="empty-folder"><FaFolderOpen /></div>
                                    <span className="empty-spark spark-one">+</span>
                                    <span className="empty-spark spark-two">·</span>
                                </div>
                                <div>
                                    <p className="eyebrow">Start your workspace</p>
                                    <h2>No projects yet</h2>
                                    <p>Create your first AI project and start collaborating.</p>
                                    <button
                                        className="new-project-btn"
                                        onClick={() => navigate("/create-project")}
                                    >
                                        <FaPlus />
                                        Create project
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="projects">
                                {projects.map((project) => (
                                    <div
                                        key={project._id}
                                        className="project-card"
                                        onClick={() => navigateToProject(project._id)}
                                    >
                                        <div className="project-card-header">
                                            <div className="folder-circle"><FaFolderOpen /></div>
                                            <span className="project-arrow">↗</span>
                                        </div>
                                        <div className="project-card-content">
                                            <span className="project-label">PROJECT</span>
                                            <h3>{project.name}</h3>
                                            <p>Click to open project</p>
                                        </div>
                                        <div className="project-card-footer">
                                            <span className="project-status"><i></i> Project workspace</span>
                                            <span className="card-dots">•••</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </section>
        </main>
    );
};

export default Home;