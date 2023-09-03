import { useEffect, useRef, useState } from "react";
import Client from "./Client";
import Editor from "./Editor";
import { initSocket } from "../socket";
import ACTIONS from "../Action";
import { useLocation, useNavigate, Navigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

const EditorPage = () => {
    const [clients, setClients] = useState([]);
    const socketRef = useRef(null)
    const codeRef = useRef(null);
    const location = useLocation();
    const reactNavigator = useNavigate();
    const { roomId } = useParams();

    useEffect(() => {
        const init = async () => {

            console.log("called uesEffect Socket")
            socketRef.current = await initSocket();
            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on("connect_failed", (err) => handleErrors(err));

            function handleErrors(e) {
                console.log("socket Error", e);
                toast.error("Socket connection failed, try again later.");
                reactNavigator('/');
            }
            socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                username: location.state.username,
            })

            //Listening for joined Event
            socketRef.current.on(
                ACTIONS.JOINED, ({ clients, username, socketId }) => {
                    if (username !== location.state?.username) {
                        toast.success(`${username} joined the roomId.`);
                        console.log(`${username} joined`)
                    }
    
                    console.log("clients===>", clients)
                    setClients(clients)

                    socketRef.current.emit(ACTIONS.SYNC_CODE, {
                        code : codeRef.current,
                        socketId,
                    })
                }
            )

            // //Listening for disconnected
            socketRef.current.on(
                ACTIONS.DISCONNECTED,
                ({ socketId, username }) => {
                    toast.success(`${username} left the room.`);
                    setClients((prev) => {
                        return prev.filter((client) => client.socketId !== socketId);
                    });
                }
            )

        }

        init();

        return ()=>{
           socketRef.current.disconnect();
           socketRef.current.off(ACTIONS.JOINED);
           socketRef.current.off(ACTIONS.DISCONNECTED  )
        }

    }, [])

    // copy room id using navigator API
    const copyRoomId = async ()=>{
        try{
             await navigator.clipboard.writeText(roomId)
             toast.success('Room ID has been copied to your clipboard')
        }
        catch(err){
             toast.error('Could not copy the Room ID');
             console.log(err)
        }
    }

    // leave the room
    const leaveRoom = async ()=>{
        reactNavigator('/')
    }

    if (!location.state) {
        return <Navigate to="/" />;
    }

    return (
        <div className="mainWrap">
            <div className="aside">
                <div className="asideInner">
                    <div className="logo">
                        <img className="logoImage" src="/code-sync.png" alt="logo" />
                    </div>
                    <h3>Connected</h3>
                    <div className="clientsList">
                        {
                            clients.map((client) => {
                                return <Client key={client.socketId} username={client.username} />
                            })
                        }
                    </div>
                </div>
                <button className="btn copyBtn" onClick={copyRoomId}>Copy ROOM ID</button>
                <button className="btn leaveBtn" onClick={leaveRoom}>Leave</button>
            </div>
            <div className="editorWrap">
                <Editor socketRef={socketRef} roomId={roomId}  onCodeChange={(code) => {codeRef.current = code}}  />
            </div>

        </div>
    )
}

export default EditorPage;








