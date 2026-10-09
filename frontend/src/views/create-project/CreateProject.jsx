import React, { useState } from "react";
import "./CreateProject.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaFolderPlus, FaArrowLeft } from "react-icons/fa";

const CreateProject = () => {
    const [projectName, setProjectName] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        if (!projectName.trim()) return;

        try {
            setLoading(true);

            await axios.post("https://ai-code-reviewer-z3vr.onrender.com/projects/create", {
                projectName,
            });

            navigate("/");
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="create-project">

            <section className="create-project-section">

                <div className="create-project-card">

                    <div className="project-icon">

                        <FaFolderPlus />

                    </div>

                    <p className="create-eyebrow">Workspace setup</p>
                    <h1>Create New Project</h1>

                    <p>
                        Give your project a meaningful name and start building.
                    </p>

                    <form onSubmit={handleSubmit}>

                        <label>Project Name</label>

                        <input
                            type="text"
                            placeholder="Enter project name..."
                            value={projectName}
                            onChange={(e) =>
                                setProjectName(e.target.value)
                            }
                            required
                        />

                        <div className="button-group">

                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => navigate("/")}
                            >
                                <FaArrowLeft />
                                Back
                            </button>

                            <button
                                type="submit"
                                className="create-btn"
                            >
                                {loading ? "Creating..." : "Create Project"}
                            </button>

                        </div>

                    </form>

                </div>

            </section>

        </main>
    );
};

export default CreateProject;