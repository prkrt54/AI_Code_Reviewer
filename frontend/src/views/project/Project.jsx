import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { io as SocketIo } from "socket.io-client"
import Editor from '@monaco-editor/react'
import ReactMarkdown from 'react-markdown'
import { useAuth } from '../../contexts/AuthContext'
import "./Project.css"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Project = () => {
    const prams = useParams()
    const { token, user } = useAuth()
    const [ messages, setMessages ] = useState([])
    const [ input, setInput ] = useState("")
    const [ chatLoading, setChatLoading ] = useState(true)
    const [ chatError, setChatError ] = useState("")
    const socketRef = useRef(null)
    const [ code, setCode ] = useState("// Write your code here...\n")
    const [ language, setLanguage ] = useState("javascript")
    const [ review, setReview ] = useState("*No review yet. Click 'get-review' to generate a code review.*")
    const currentUserId = user?.id || user?._id
    const visibleMessages = messages.filter((message) => {
        const text = typeof message === "string" ? message : message?.text
        return typeof text === "string"
            && !text.startsWith("__history_fix_")
            && !text.startsWith("__chat_member_")
    })

    function getMessageSenderId(message) {
        const sender = message?.user
        if (typeof sender === "string") return sender
        if (sender && typeof sender === "object") return sender._id || sender.id
        return null
    }

    // Function to handle code changes from the editor
    function handleEditorChange(value) {
        setCode(value)
        socketRef.current?.emit("code-change", value)
    }

    function handleUserMessage() {
        if (!input.trim()) return
        socketRef.current?.emit("chat-message", input)
        setInput("")
    }

    function getReview() {
        if (socketRef.current) {
            setReview(" Generating review...")
            socketRef.current.emit("get-review", code)
        } else {
            setReview(" Socket not connected yet. Please wait...")
        }
    }

    // Function to change programming language
    function changeLanguage(newLanguage) {
        setLanguage(newLanguage)
    }

    useEffect(() => {
        const io = SocketIo(API_BASE_URL, {
            auth: {
                token: token
            },
            query: {
                project: prams.id
            }
        })

        io.on('chat-history', (messages) => {
            console.log("Chat history received", {
                projectId: prams.id,
                messageCount: Array.isArray(messages) ? messages.length : 0
            })
            setMessages(messages)
            setChatLoading(false)
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

        io.on("error", (error) => {
            console.error("Project chat error:", error)
            setChatLoading(false)
            setChatError(typeof error === "string" ? error : "Unable to load project chat")
        })

        io.on("connect_error", (error) => {
            console.error("Project chat connection error:", error.message)
            setChatLoading(false)
            setChatError("Unable to connect to project chat")
        })

        io.on("connect", () => {
            console.log("Project chat connected", { projectId: prams.id })
            setChatError("")
            console.log("Requesting chat history", { projectId: prams.id })
            io.emit("chat-history")
            io.emit("get-project-code")
        })

        io.on("disconnect", (reason) => {
            if (reason !== "io client disconnect") {
                console.warn("Project chat disconnected:", reason)
                setChatLoading(false)
                setChatError("Project chat disconnected")
            }
        })

        socketRef.current = io

        return () => {
            io.removeAllListeners()
            io.disconnect()
            if (socketRef.current === io) {
                socketRef.current = null
            }
        }
    }, [token, prams.id])

    return (
        <main className='project-main' >
            <section className='project-section' >
                <div className="chat">

                    <div className="messages">
                        {chatLoading && <div className="message">Loading messages...</div>}
                        {!chatLoading && chatError && <div className="message">{chatError}</div>}
                        {!chatLoading && !chatError && visibleMessages.length === 0 && (
                            <div className="message">No messages yet.</div>
                        )}
                        {!chatLoading && !chatError && (
                            visibleMessages.map((message, index) => {
                                const text = typeof message === "string" ? message : message.text
                                const senderId = getMessageSenderId(message)
                                const isOwnMessage = Boolean(currentUserId && senderId
                                    && String(currentUserId) === String(senderId))
                                const sender = message?.user
                                const senderName = !isOwnMessage && sender && typeof sender === "object"
                                    ? sender.name
                                    : null

                                return (<div
                                    className={`message-row ${isOwnMessage ? "message-row-own" : "message-row-other"}`}
                                    key={message?._id || `${message?.createdAt || text}-${index}`}
                                >
                                    <div className="message">
                                        {senderName && <span className="message-sender">{senderName}</span>}
                                        <span>{text}</span>
                                    </div>
                                </div>)
                            })
                        )}
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