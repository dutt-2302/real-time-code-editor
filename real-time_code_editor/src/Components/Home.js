/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');

    const createNewRoom = (e) => {
        e.preventDefault();

        const id = uuidv4();
        console.log(id);
        setRoomId(id);

        toast.success("Created a new room")
    }

    const joinRoom = () => {
        if (!roomId || !username) {
            toast.error("Room ID & Username is required")
            return;
        }

        // Redirect 
        navigate(`/editor/${roomId}`, {
            state: {
                username,
            }
        })
    }

    const handleInputEnter = (e) => {
        console.log(e.code)

        if (e.code === 'Enter') {
            joinRoom();
        }
    }

    return (
        <div className="homePageWrapper">
            <div className="formWrapper">
                <div className='inputGroup'>
                    <input type="text" className="inputBox" placeholder="ROOM ID" value={roomId} onChange={(e) => setRoomId(e.target.value)} onKeyUp={handleInputEnter} />
                    <input type="text" className="inputBox" placeholder="USERNAME" value={username} onChange={(e) => setUsername(e.target.value)} onKeyUp={handleInputEnter} />
                    <button className="btn joinBtn" onClick={joinRoom}>Join</button>
                    <span className="createInfo">
                        If you don't have an invite then create{' '}
                        <a onClick={createNewRoom} href="" className="createNewBtn">
                            new room
                        </a>
                    </span>

                </div>
            </div>
            <footer>
                <h4>
                    Build with &#9829; by {' '}
                    <a href="https://github.com/dutt-2302">dutt-2302</a>
                </h4>
            </footer>
        </div>
    );
};

export default Home;