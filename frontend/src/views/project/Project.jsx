import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { io as SocketIo } from "socket.io-client"
import Editor from '@monaco-editor/react'
import ReactMarkdown from 'react-markdown'
import { useAuth } from '../../contexts/AuthContext'
import "./Project.css"

const Project = () => {
    const prams = useParams()
    const { token } = useAuth()
    const [ messages, setMessages ] = useState([])
    const [ input, setInput ] = useState("")
    const [ socket, setSocket ] = useState(null)
    const [ code, setCode ] = useState("// Write your code here...\n")
    const [ language, setLanguage ] = useState("javascript")
    const [ review, setReview ] = useState("*No review yet. Click 'get-review' to generate a code review.*")

    // Function to handle code changes from the editor
    function handleEditorChange(value) {
        setCode(value)
        socket.emit("code-change", value)
    }

    function handleUserMessage() {
        setMessages((prev) => {
            return [ ...prev, input ]
        })
        socket.emit("chat-message", input)
        setInput("")
    }

    function getReview() {
        if (socket) {
            setReview(" Generating review...")
            socket.emit("get-review", code)
        } else {
            setReview(" Socket not connected yet. Please wait...")
        }
    }

    // Function to change programming language
    function changeLanguage(newLanguage) {
        setLanguage(newLanguage)
    }

    useEffect(() => {
        const io = SocketIo("http://localhost:3000", {
            auth: {
                token: token
            },
            query: {
                project: prams.id
            }
        })


        io.emit("chat-history")

        io.on('chat-history', (messages) => {
            setMessages(messages.map((message) => message.text))
        })

        io.on('chat-message', (message) => {
            setMessages((prev) => {
                return [ ...prev, message ]
            })
        })

        io.on('code-change', (code) => {
            setCode(code)
        })

        io.on('project-code', (code) => {
            setCode(code)
        })

        io.on("code-review", (review) => {
            console.log(review)
            setReview(review)
        })
        io.emit("get-project-code")

        setSocket(io)
    }, [])

    return (
        <main className='project-main' >
            <section className='project-section' >
                <div className="chat">

                    <div className="messages">
                        {
                            messages.map((message, index) => {
                                return (<div className="message" key={index}>
                                    <span>
                                        {message}
                                    </span>
                                </div>)
                            })
                        }
                    </div>

                    <div className="input-area">
                        <input
                            type="text"
                            placeholder='message to project...'
                            onChange={(e) => {
                                setInput(e.target.value)
                            }}
                            value={input}
                        />
                        <button
                            onClick={() => { handleUserMessage() }}
                        ><i className="ri-send-plane-2-fill"></i></button>
                    </div>

                </div>
                <div className="code">
                    <div className="language-selector">
                        <select
                            value={language}
                            onChange={(e) => changeLanguage(e.target.value)}
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="typescript">TypeScript</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="csharp">C#</option>
                            <option value="html">HTML</option>
                            <option value="css">CSS</option>
                        </select>
                    </div>
                    <Editor
                        height="90%"
                        width="100%"
                        language={language}
                        value={code}
                        onChange={handleEditorChange}
                        theme="vs-dark"
                        options={{
                            minimap: { enabled: true },
                            fontSize: 14,
                            wordWrap: 'on',
                            automaticLayout: true,
                            formatOnType: true,
                            formatOnPaste: true,
                            cursorBlinking: "smooth",
                        }}
                    />
                </div>
                <div className="review">
                    <div className="review-content">
                        <ReactMarkdown>{review}</ReactMarkdown>
                    </div>
                    <button
                        onClick={() => {
                            getReview()
                        }}
                        className='get-review' >
                        get-review
                    </button>
                </div>
            </section>
        </main>
    )
}

export default Project