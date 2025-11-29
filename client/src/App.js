import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ChaosStyles.css';
import { MEME_ASSETS, VEHICLES } from './MemeConfig';

const App = () => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [page, setPage] = useState('landing');
    
    // Konami Code State
    const [konami, setKonami] = useState([]);
    
    useEffect(() => {
        const handleKeyDown = (e) => {
            setKonami(prev => [...prev.slice(-10), e.key]);
            if ([...konami, e.key].slice(-10).join('') === 'ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightba') {
                alert("GOD MODE ACTIVATED");
                document.body.style.transform = "rotate(180deg)";
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [konami]);

    const renderPage = () => {
        switch(page) {
            case 'landing': return <Landing goLogin={() => setPage('login')} />;
            case 'login': return <Login setToken={setToken} goDash={() => setPage('dashboard')} />;
            case 'dashboard': return <Dashboard token={token} goPay={() => setPage('pay')} />;
            case 'pay': return <PayToll token={token} goBack={() => setPage('dashboard')} />;
            default: return <Landing />;
        }
    };

    return <div className="app-container">{renderPage()}</div>;
};

// --- COMPONENTS ---

const Landing = ({ goLogin }) => (
    <div className="landing">
        <h1>🔥 Mihir Troll 🔥</h1>
        {/* Added error handling for image */}
        <img 
            src={MEME_ASSETS.fire} 
            alt="This is fine" 
            width="300" 
            onError={(e) => {e.target.onerror = null; e.target.src="https://i.imgur.com/C4y19i9.jpeg"}} // Fallback image
        />
        <h2>PAY TOLL OR SUFFER</h2>
        <button className="meme-btn shake" onClick={goLogin}>
            SHUT UP AND TAKE MY MONEY
        </button>
        {/* eslint-disable-next-line jsx-a11y/no-distracting-elements */}
        <marquee style={{fontSize: '2rem', marginTop: '50px'}}>
            🚀 STONKS ONLY GO UP 🚀 DOGECOIN ACCEPTED (NOT REALLY) 🚀
        </marquee>
    </div>
);

const Login = ({ setToken, goDash }) => {
    const [isRegister, setIsRegister] = useState(false); // Toggle state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuth = async () => {
        setLoading(true);
        const endpoint = isRegister ? '/register' : '/login';
        try {
            // Using localhost here because the Browser (Windows) calls the API
            const res = await axios.post(`http://localhost:5001/api/users${endpoint}`, { username, password });
            
            if (isRegister) {
                alert(res.data.msg + " (Now Login!)");
                setIsRegister(false); // Switch to login after register
            } else {
                setToken(res.data.token);
                localStorage.setItem('token', res.data.token);
                goDash();
            }
        } catch (err) {
            alert(err.response?.data?.msg || "Server is asleep. Shhh.");
        }
        setLoading(false);
    };

    if (loading) return <div><img src={MEME_ASSETS.loading} alt="loading" /><h1>HOLD UP...</h1></div>;

    return (
        <div>
            <h1>{isRegister ? "JOIN THE CULT" : "LET ME INNNN!!!"}</h1>
            
            <input 
                placeholder="Username" 
                value={username} 
                onChange={e=>setUsername(e.target.value)} 
                style={{padding: 10, fontSize: 20, margin: 10}} 
            />
            <br/>
            <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
                style={{padding: 10, fontSize: 20, margin: 10}} 
            />
            <br/><br/>
            
            <button className="meme-btn" onClick={handleAuth}>
                {isRegister ? "Yeet (Register)" : "Yeet (Login)"}
            </button>

            <p style={{marginTop: 20, cursor: 'pointer', textDecoration: 'underline', color: 'yellow'}} 
               onClick={() => setIsRegister(!isRegister)}>
                {isRegister ? "Already a Troll? Login here" : "No account? Register here"}
            </p>
        </div>
    );
};

const Dashboard = ({ token, goPay }) => {
    const [data, setData] = useState(null);

    useEffect(() => {
        // FIX: Read token directly from storage to avoid "null" race condition
        const storedToken = localStorage.getItem('token'); 
        
        if (!storedToken) {
            // If no token, don't even try to fetch.
            return;
        }

        axios.get('http://localhost:5001/api/users/wallet', { 
            headers: { Authorization: `Bearer ${storedToken}` }
        })
        .then(res => setData(res.data))
        .catch(err => {
            console.error("Dashboard Error:", err);
            // Optional: Auto-logout if token is bad
            if(err.response && (err.response.status === 422 || err.response.status === 401)) {
               alert("Your session expired (Troll ate it). Login again.");
               localStorage.removeItem('token');
               window.location.reload();
            }
        });
    }, []); // Removed 'token' dependency to prevent double-firing

    if (!data) return (
        <div style={{textAlign: 'center', marginTop: '50px'}}>
             <img src={MEME_ASSETS.loading} alt="loading" />
             <h2>Loading your poverty...</h2>
        </div>
    );

    return (
        <div>
            <h1>{data.roast}</h1>
            <h2>Balance: ${data.balance}</h2>
            {data.reaction === "panik" && <h1>😱 PANIK (Low Balance)</h1>}
            {data.reaction === "kalm" && <h1>😌 KALM (You good)</h1>}
            {data.reaction === "stonks" && <h1>📈 STONKS (Rich)</h1>}
            
            <div style={{marginTop: 50}}>
                <button className="meme-btn" onClick={goPay}>PAY TROLL</button>
            </div>
        </div>
    );
};

const PayToll = ({ token, goBack }) => {
    const [vehicle, setVehicle] = useState('Car');
    const [receipt, setReceipt] = useState(null);
    const [loading, setLoading] = useState(false);

    const pay = async () => {
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5002/api/tolls/pay', 
                { vehicle, amount: 15 }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setReceipt(res.data.receipt);
        } catch (err) {
            alert(err.response?.data?.msg || "Payment Failed");
        }
        setLoading(false);
    };

    if (loading) return <div><img src={MEME_ASSETS.success} alt="dance" /><h1>TAKING YOUR MONEY...</h1></div>;

    if (receipt) return (
        <div>
            <h1>LADIES AND GENTLEMEN, WE GOT HIM</h1>
            <div className="receipt-box">{receipt}</div>
            <button className="meme-btn" onClick={() => setReceipt(null)}>Do it again</button>
            <button className="meme-btn" onClick={goBack} style={{background: 'gray', marginLeft: 10}}>Escape</button>
        </div>
    );

    return (
        <div>
            <h1>Select Your Weapon</h1>
            <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10}}>
                {VEHICLES.map(v => (
                    <div key={v.id} 
                         onClick={() => setVehicle(v.id)}
                         style={{border: vehicle === v.id ? '5px solid yellow' : '1px solid white', padding: 20, cursor: 'pointer', borderRadius: 10}}>
                        <div style={{fontSize: '3rem'}}>{v.img}</div>
                        <p>{v.name}</p>
                        <small><i>"{v.meme}"</i></small>
                    </div>
                ))}
            </div>
            <h1 style={{color: 'yellow'}}>Price: $15 (Maybe)</h1>
            <button className="meme-btn" onClick={pay}>SHUT UP AND TAKE MY MONEY</button>
            <br/><br/>
            <button className="meme-btn" style={{background:'red', fontSize: '1rem'}} onClick={goBack}>Run Away</button>
        </div>
    );
};

export default App;