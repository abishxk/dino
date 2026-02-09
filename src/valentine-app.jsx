import React, { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";
import "./brutalist-button.css";

/* ================= BACK BUTTON ================= */

function BackButton({ onClick }) {
    return (
        <div
            className="styled-wrapper back-btn"
            onClick={onClick}
            onTouchStart={onClick}
        >
            <button className="button">
                <div className="button-box">

                    <span className="button-elem">
                        <svg
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            className="arrow-icon"
                        >
                            <path
                                fill="black"
                                d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
                            />
                        </svg>
                    </span>

                    <span className="button-elem">
                        <svg
                            fill="black"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            className="arrow-icon"
                        >
                            <path
                                d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
                            />
                        </svg>
                    </span>

                </div>
            </button>
        </div>
    );
}


/* ================= MAIN APP ================= */

export default function ValentineApp() {

    const [page, setPage] = useState("start");
    // start → home → game

    useEffect(() => {
        emailjs.init("aEbujbuY5ZtX1sDQq");
    }, []);


    return (
        <div className="valentine-container">

            {/* Hearts Background (Only Start + Home) */}
            {page !== "game" && (
                <div className="hearts-bg">

                    <div className="heart x1" />
                    <div className="heart x2" />
                    <div className="heart x3" />
                    <div className="heart x4" />
                    <div className="heart x5" />

                    <div className="heart x6" />
                    <div className="heart x7" />
                    <div className="heart x8" />
                    <div className="heart x9" />
                    <div className="heart x10" />

                    <div className="heart x11" />
                    <div className="heart x12" />

                </div>
            )}




            <div className="app-content">

                {page === "start" && (
                    <StartPage onStart={() => setPage("home")} />
                )}

                {page === "home" && (
                    <HomePage onYes={() => setPage("game")} />
                )}

                {page === "game" && (
                    <GamePage onBack={() => setPage("home")} />
                )}

            </div>

            <style>{styles}</style>

        </div>
    );
}



/* ================= START PAGE ================= */

function StartPage({ onStart }) {

    return (
        <div className="start-page">

            <div className="start-card">

                <p className="start-sub">
                    Touch my head to continue
                </p>


                {/* CAT CONTAINER */}
                <div className="cat-box">

                    <div className="cat-box">

                        <img
                            src="/cat.jpg"
                            className="cat-img"
                            alt="Cute cat"
                        />

                        <button
                            className="cat-head-btn"
                            onClick={onStart}
                            onTouchStart={onStart}
                        />

                    </div>


                </div>


                <p className="start-note">
                    Also dont forget enable sound
                </p>

            </div>

        </div>
    );
}




/* ================= HOME PAGE ================= */

function HomePage({ onYes }) {

    const [pos, setPos] = useState({ x: 0, y: 0 }); // current translate

    const btnRef = useRef(null);
    const yesRef = useRef(null);


    const soundUnlocked = useRef(false);

    const noSound = useRef(null);
    const yesSound = useRef(null);


    /* ================= AUDIO INIT ================= */

    useEffect(() => {

        // NO sound
        const noAudio = new Audio("/sounds/no.mp3");
        noAudio.volume = 0.6;
        noAudio.muted = true;

        // YES hover sound
        const yesAudio = new Audio("/sounds/yes-hover.mp3");
        yesAudio.volume = 0.6;
        yesAudio.muted = true;

        noSound.current = noAudio;
        yesSound.current = yesAudio;


        // Unlock on first user interaction
        const unlock = async () => {

            if (soundUnlocked.current) return;

            try {

                // Unlock NO
                await noSound.current.play();
                noSound.current.pause();
                noSound.current.currentTime = 0;
                noSound.current.muted = false;

                // Unlock YES
                await yesSound.current.play();
                yesSound.current.pause();
                yesSound.current.currentTime = 0;
                yesSound.current.muted = false;

                soundUnlocked.current = true;

                console.log("🔊 Audio unlocked");

            } catch (e) {}

            document.removeEventListener("click", unlock);
            document.removeEventListener("touchstart", unlock);
            document.removeEventListener("keydown", unlock);
        };


        document.addEventListener("click", unlock);
        document.addEventListener("touchstart", unlock);
        document.addEventListener("keydown", unlock);


        return () => {
            document.removeEventListener("click", unlock);
            document.removeEventListener("touchstart", unlock);
            document.removeEventListener("keydown", unlock);
        };

    }, []);



    /* ================= PLAY YES SOUND ================= */

    const playYesSound = () => {

        if (yesSound.current && soundUnlocked.current) {

            yesSound.current.currentTime = 0;

            yesSound.current.play().catch(() => {});
        }
    };

    const handleYesClick = () => {

        // Stop hover music
        if (yesSound.current) {
            yesSound.current.pause();
            yesSound.current.currentTime = 0;
        }

        // Go to next page
        onYes();
    };


    const stopYesSound = () => {

        if (yesSound.current) {

            yesSound.current.pause();
            yesSound.current.currentTime = 0;
        }
    };


    /* ================= MOVE NO ================= */

    const move = () => {

        const noBtn = btnRef.current;
        const yesBtn = yesRef.current;

        if (!noBtn || !yesBtn) return;


        // 🔊 Play sound
        if (noSound.current && soundUnlocked.current) {
            noSound.current.currentTime = 0;
            noSound.current.play().catch(()=>{});
        }


        const rect = noBtn.getBoundingClientRect();
        const yesRect = yesBtn.getBoundingClientRect();

        const screenW = window.innerWidth;
        const screenH = window.innerHeight;

        const margin = 20;
        const minJump = 180;


        let newX = pos.x;
        let newY = pos.y;

        let tries = 0;


        while (tries < 30) {

            tries++;


            /* Force big jump */

            const dx =
                (Math.random() < 0.5 ? -1 : 1) *
                (minJump + Math.random() * 200);

            const dy =
                (Math.random() < 0.5 ? -1 : 1) *
                (minJump + Math.random() * 150);


            let candidateX = pos.x + dx;
            let candidateY = pos.y + dy;


            /* Predict screen position */

            const nextLeft = rect.left + dx;
            const nextRight = nextLeft + rect.width;

            const nextTop = rect.top + dy;
            const nextBottom = nextTop + rect.height;


            /* Stay inside screen */

            if (
                nextLeft < margin ||
                nextRight > screenW - margin ||
                nextTop < margin ||
                nextBottom > screenH - margin
            ) {
                continue;
            }


            /* Avoid YES */

            const overlap =
                nextRight > yesRect.left &&
                nextLeft < yesRect.right &&
                nextBottom > yesRect.top &&
                nextTop < yesRect.bottom;

            if (overlap) continue;


            newX = candidateX;
            newY = candidateY;

            break;
        }


        setPos({
            x: newX,
            y: newY
        });
    };







    /* ================= UI ================= */

    return (
        <div className="home-page">

            <h1 className="valentine-title">
                <span className="title-small">Will you be</span>{" "}
                <span className="title-big">my Valentine?</span>
            </h1>




            {/* YES BUTTON */}

            <button
                ref={yesRef}
                className="brutalist-button yes-brutal"
                onClick={handleYesClick}


                onMouseEnter={playYesSound}
                onMouseLeave={stopYesSound}

                onTouchStart={playYesSound}
                onTouchEnd={stopYesSound}
            >


            <div className="yes-content">

          <span className="btn-text">
            YES
          </span>

                    <span className="btn-subtext">
            Don't be shy, Press me :)
          </span>

                </div>

            </button>



            {/* NO BUTTON */}

            <button
                ref={btnRef}
                className="brutalist-button no-brutal"
                onMouseEnter={move}
                onClick={move}
                onTouchStart={move}
                style={{
                    transform: `translate(${pos.x}px, ${pos.y}px)`
                }}
            >
        <span className="btn-text">
          NO
        </span>
            </button>

        </div>
    );
}



/* ================= GAME PAGE ================= */

function GamePage({ onBack }) {

    const gameFrameRef = useRef(null); // ONLY the iframe box

    const touchStartY = useRef(0);

    const [stage, setStage] = useState("form");
// form → instructions → countdown → play

    const [countdown, setCountdown] = useState(3);
    const [fadeStage, setFadeStage] = useState("none");

    const [senderName, setSenderName] = useState("");
    const [message, setMessage] = useState("");

    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const iframeRef = useRef(null);
    const [key, setKey] = useState(0);

    const isMobile =
        window.matchMedia("(pointer: coarse)").matches;

    useEffect(() => {

        if (stage !== "play") return;

        let startY = 0;

        const onTouchStart = (e) => {

            // ❌ Don’t block UI buttons
            if (e.target.closest("button")) return;

            e.preventDefault();
            startY = e.touches[0].clientY;
        };

        const onTouchEnd = (e) => {

            if (e.target.closest("button")) return;

            e.preventDefault();

            const endY = e.changedTouches[0].clientY;
            const diff = startY - endY;

            const iframe = iframeRef.current;
            if (!iframe) return;

            if (diff < -60) {
                iframe.contentWindow.postMessage({ type: "DUCK" }, "*");
            } else if (diff > -20) {
                iframe.contentWindow.postMessage({ type: "JUMP" }, "*");
            }
        };

        window.addEventListener("touchstart", onTouchStart, { passive: false });
        window.addEventListener("touchend", onTouchEnd, { passive: false });

        return () => {
            window.removeEventListener("touchstart", onTouchStart);
            window.removeEventListener("touchend", onTouchEnd);
        };

    }, [stage]);




    useEffect(() => {

        if (stage === "countdown") {

            if (countdown === 0) {

                // Phase 1: Fade In
                setFadeStage("in");

                setTimeout(() => {

                    // Phase 2: Switch to game
                    setStage("play");
                    setKey(k => k + 1);

                    // Phase 3: Fade Out
                    setFadeStage("out");

                    setTimeout(() => {
                        setFadeStage("none");
                        iframeRef.current?.focus();
                    }, 600);

                }, 600);

                return;
            }


            const timer = setTimeout(() => {
                setCountdown(c => c - 1);
            }, 1000);

            return () => clearTimeout(timer);
        }

    }, [stage, countdown]);


    /* ================= SEND EMAIL ================= */

    const sendMessage = async () => {

        if (!senderName.trim() || !message.trim()) {
            alert("Please enter name & message 💕");
            return;
        }

        setSending(true);

        try {

            await emailjs.send(
                "service_1z5tkws",      // ✅ Your service
                "template_1xkowsi",     // ✅ Your template
                {
                    user_name: senderName,
                    message: message,
                },
                "aEbujbuY5ZtX1sDQq"
            );

            setSent(true);
            setSenderName("");
            setMessage("");

        } catch (err) {

            console.error(err);
            alert("Message failed 💔");

        }

        setSending(false);
    };
    /* Start */

    const startGame = () => {
        setStage("instructions");
    };


    const sendToGame = (data) => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        iframe.contentWindow.postMessage(data, "*");
    };


    /* Retry */

    const retry = (e) => {

        const btn = e.currentTarget;

        btn.disabled = true;

        setTimeout(() => {
            btn.disabled = false;
        }, 50);

        // Reset countdown
        setCountdown(3);

        // Go back to countdown stage
        setStage("countdown");

        // Reset fade
        setFadeStage("none");
    };



    return (
        <div className="game-page">

            {/* Global Back Button */}
            {(stage === "form" || stage === "instructions" || stage === "play") && (
                <BackButton
                    onClick={() => {
                        if (stage === "play") {
                            setStage("form");
                        } else if (stage === "instructions") {
                            setStage("form");
                        } else {
                            onBack();
                        }

                        setCountdown(3);
                        setFadeStage("none");
                    }}
                />
            )}


            {/* ================= FORM ================= */}

            {stage === "form" && (

                <>

                    {/* MESSAGE FORM */}

                    <div className="message-box">

                        <h4>
                            {sent ? "Papa Message Sent!" : "Send me cute cute message 💖"}
                        </h4>

                        {!sent && (

                            <>

                                <input
                                    value={senderName}
                                    onChange={e => setSenderName(e.target.value)}
                                    placeholder="Papa name..."
                                    className="text-input"
                                />

                                <textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    placeholder="Papa message..."
                                    rows={4}
                                    className="text-input"
                                    style={{ resize: "none" }}
                                />

                                <button
                                    onClick={sendMessage}
                                    disabled={sending}
                                    className="brutalist-button no-brutal"
                                    style={{ width: "100%" }}
                                >
                <span className="btn-text">
                  {sending ? "Sending..." : "Send 💌"}
                </span>
                                </button>

                            </>
                        )}

                    </div>


                    {/* BORED TEXT */}

                    <p className="start-divider">
                        If you are bored, press Play
                    </p>


                    {/* GAME BUTTON */}

                    <button
                        className="brutalist-button no-brutal"
                        onClick={startGame}
                    >
                        <span className="btn-text">Play Game</span>
                    </button>


                </>
            )}



            {/* ================= INSTRUCTIONS ================= */}

            {stage === "instructions" && (

                <div className="instruction-card">

                    <div className="instruction-header">

                        <div>
                            <h2>🛡️ Protect Papa</h2>
                            <p>Protect <b>Papa</b> from all cheee things!</p>
                        </div>

                        <img
                            src="/new-papa.png"
                            alt="Papa"
                            className="instruction-img"
                        />

                    </div>


                    {/* ENEMIES */}
                    <div className="instruction-section">

                        <h4>Cheee things</h4>

                        <div className="enemy-grid">

                            <div className="enemy-card">
                                <img src="/bato.png" alt="Demobat" />
                                <p>Demobat</p>
                            </div>

                            <div className="enemy-card">
                                <img src="/1demo.png" alt="Demogorgon" />
                                <p>Demogorgon</p>
                            </div>

                            <div className="enemy-card">
                                <img src="/only_vecna.png" alt="Vecna" />
                                <p>Vecna</p>
                            </div>

                            <div className="enemy-card">
                                <img src="/mf.png" alt="Mind Flayer" />
                                <p>Mind Flayer</p>
                            </div>

                        </div>
                    </div>


                    {/* CONTROLS */}
                    <div className="instruction-section">

                        <h4>Controls :</h4>

                        <p className="control-text">

                            {isMobile
                                ? "Tap = Jump & Swipe ↓ = Duck"
                                : "SPACE / Up Arrow = Jump & Down Arrow = Duck"
                            }

                        </p>

                    </div>


                    {/* RULE */}
                    <p className="rule-text">
                        💡 Jump over EVERYTHING.
                        Only duck for head-level Demobat.
                    </p>


                    {/* START BUTTON */}
                    <button
                        className="brutalist-button start-btn"
                        onClick={() => {
                            setCountdown(3);
                            setStage("countdown");
                        }}
                    >
                        <span className="btn-text">Start Mission</span>
                    </button>

                </div>
            )}




            {/* ================= COUNTDOWN ================= */}

            {stage === "countdown" && (

                <div className="countdown-box">

                    {/* Good Luck Image */}
                    <img
                        src="/goodluck-cat.jpg"
                        alt="Good Luck"
                        className="goodluck-img"
                    />

                    {/* Text */}
                    <h2 className="goodluck-text">
                        Good Luck Papa
                    </h2>

                    {/* Countdown */}
                    <h1>{countdown}</h1>

                    <p>Get Ready</p>

                </div>
            )}

            {fadeStage !== "none" && (
                <div className={`game-fade-overlay ${fadeStage}`} />
            )}

            {/* ================= GAME ================= */}

            {stage === "play" && (

                <>

                    <div className="game-frame" ref={gameFrameRef}>

                    <iframe
                            key={key}
                            ref={iframeRef}
                            src="/dino.html"
                            title="Game"

                            sandbox="allow-scripts allow-same-origin"   // 🔥 REQUIRED
                            allow="autoplay; fullscreen"

                            style={{
                                pointerEvents: "none",
                                width: "100%",
                                height: "100%",
                                border: "none"
                            }}
                        />


                    </div>

                    <button
                        className="brutalist-button no-brutal"
                        onClick={retry}
                        style={{ touchAction: "manipulation" }}   // ✅ helps mobile click
                    >
                    <span className="btn-text">RETRY</span>
                    </button>

                </>
            )}

        </div>
    );

}



/* ================= STYLES ================= */



const styles = `

@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Poppins:wght@400;600&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}


body {
  font-family: "Quicksand", sans-serif;
}


/* Layout */

.valentine-container {
  min-height: 100vh;
  background: linear-gradient(135deg,#FFE5EC,#FFCDB2,#E4C1F9);
  overflow: hidden;
  position: relative;
}

.app-content {
  position: relative;
  z-index: 5;
}


/* ================= START PAGE ================= */

.start-page {
  min-height: 100vh;

  display: flex;
  justify-content: center;
  align-items: center;
}


.start-card {

  background: rgba(255,255,255,0.95);

  padding: 35px 30px;

  border-radius: 28px;

  text-align: center;

  width: 90%;
  max-width: 420px;

  box-shadow:
    0 25px 50px rgba(255,107,157,.25);
}


.start-title {
  font-family: "Pacifico";
  font-size: 2.4rem;
  color: #ff5c8a;
  margin-bottom: 5px;
}


.start-sub {
  font-size: 1.05rem;
  color: #ff7aa2;
  margin-bottom: 20px;
}


/* ================= CAT BOX ================= */

.cat-box {

  position: relative;

  width: 260px;
  max-width: 100%;

  margin: 0 auto 20px;

  animation: cat-float 3s ease-in-out infinite;
}


.cat-img {

  width: 100%;
  border-radius: 18px;

  box-shadow:
    0 15px 35px rgba(0,0,0,.25);

  user-select: none;
  pointer-events: none;
}


/* ================= HEAD BUTTON ================= */

/* Image wrapper */
.cat-box{
  position: relative;
  width: 100%;
  max-width: 280px;
  margin: 0 auto;
}

/* Cat image */
.cat-img{
  width: 100%;
  border-radius: 20px;
  display: block;
}

/* Head touch area */
.cat-head-btn{

  position: absolute;

  /* Position relative to image */
  top: 12%;
  left: 12%;

  width: 30%;
  height: 32%;

  border: none;
  background: rgba(255, 100, 160, 0.15); /* TEMP DEBUG */
  border-radius: 50%;

  cursor: pointer;
}



// /* Glow effect */
// .cat-head-btn::after {
//
//   content: "";
//
//   position: absolute;
//   inset: 0;
//
//   border-radius: 50%;
//
//   box-shadow:
//     0 0 25px rgba(255,120,170,.6);
//
//   opacity: .6;
//
//   transition: .3s;
// }


.cat-head-btn:hover::after {
  opacity: 1;
  box-shadow:
    0 0 40px rgba(255,120,170,.8);
}


.cat-head-btn:active {
  transform: scale(.9);
}


/* ================= NOTE ================= */

.start-note {

  font-size: .9rem;
  opacity: .75;

  color: #ff5c8a;
}


/* ================= ANIMATIONS ================= */

@keyframes cat-float {

  0%   { transform: translateY(0); }
  50%  { transform: translateY(-8px); }
  100% { transform: translateY(0); }
}


@keyframes head-wiggle {

  0% { transform: rotate(0deg); }

  25% { transform: rotate(3deg); }

  50% { transform: rotate(-3deg); }

  75% { transform: rotate(2deg); }

  100% { transform: rotate(0deg); }
}


/* ================= MOBILE ================= */

@media(max-width:600px){

  .cat-box{
    width:220px;
  }

  .start-title{
    font-size:2rem;
  }

}



/* Home */

.home-page {
  min-height: 100vh;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 40px;
  text-align: center;
}

/* ================= VALENTINE TITLE ================= */

.valentine-title{

  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;

  gap: 10px;

  margin-bottom: 25px;
}


/* "Will you be" */

.title-small{

  font-family: "Poppins", sans-serif;

  font-size: 2rem;

  letter-spacing: 2px;

  color: #ff4d8d;

  text-shadow:
    0 2px 6px rgba(255,80,150,.3);

  opacity: 0;

  animation: slide-in 0.8s ease forwards;
  animation-delay: .2s;

  animation-fill-mode: forwards; /* 🔥 IMPORTANT */
}


/* "my Valentine?" */

.title-big{

  font-family: "Great Vibes", cursive;

  font-size: 3.8rem;

  color: #ff2f7d;

  text-shadow:
    0 4px 10px rgba(255,60,120,.4),
    0 0 18px rgba(255,120,180,.25);

  opacity: 0;

  animation: pop-in 0.9s cubic-bezier(.25,1.4,.4,1) forwards;
  animation-delay: .6s;

  animation-fill-mode: forwards; /* 🔥 IMPORTANT */
}


/* Buttons */

.brutalist-button {
  width: 180px;
  height: 60px;

  border-radius: 50px;
  border: 3px solid #ffb3c6;

  background: linear-gradient(135deg,#ff6b9d,#ff8fab);

  color: white;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  box-shadow:
    0 6px 15px rgba(255,107,157,.4),
    4px 4px 0 #000;

  transition: .25s ease;

  overflow: hidden;
}


.brutalist-button:hover {
  transform: translate(-4px,-4px) scale(1.05);
}

.brutalist-button:active {
  transform: scale(.95);
}


.btn-text {
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: 1.5px;
}


.yes-brutal {
  flex-direction: column;
}

.yes-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.btn-subtext {
  font-size: .7rem;
  opacity: 0;
  height: 0;
  overflow: hidden;
  transition: .25s;
}

.yes-brutal:hover .btn-subtext {
  height: 12px;
  opacity: 1;
}


.no-brutal:hover {
  transform: translate(-4px,-4px) rotate(-2deg) scale(1.05);
}


/* Game */

.game-page {
  min-height: 100vh;
  position: relative; /* 🔥 IMPORTANT */
  touch-action: none;

  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  gap: 25px;
  padding: 20px;
}





.game-frame {
  width: 100%;
  max-width: 720px;
  touch-action: none;
  aspect-ratio: 720 / 445;

  border: 3px solid #ff6b9d;
  border-radius: 12px;

  overflow: hidden;
  background: black;
}


.game-frame iframe {
  width: 100%;
  height: 100%;
  border: none;
}


.hint {
  opacity: .7;
  text-align: center;
}


@media(max-width:600px){

  .brutalist-button{
    width:150px;
    height:52px;
  }

  .btn-text{
    font-size:1.2rem;
  }
}
@keyframes slide-in{

  from{
    opacity: 0;
    transform: translateX(-20px);
  }

  to{
    opacity: 1;
    transform: translateX(0);
  }
}


@keyframes pop-in{

  0%{
    opacity: 0;
    transform: scale(.6);
  }

  70%{
    opacity: 1;
    transform: scale(1.15);
  }

  100%{
    opacity: 1;
    transform: scale(1);
  }
}

/* ================= DREAMY FLOATING HEARTS ================= */

.hearts-bg{
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
}


/* Heart Base */
.heart{
  position: absolute;

  width: 22px;
  height: 22px;

  background: linear-gradient(
    135deg,
    #ff4d8d,
    #ff85b3,
    #ffb3d9
  );

  transform: rotate(45deg);

  opacity: .45;

  filter: drop-shadow(0 0 8px rgba(255,120,180,.6));

  animation:
    float-heart 14s linear infinite,
    pulse-heart 2.5s ease-in-out infinite;
}


/* Heart Circles */
.heart::before,
.heart::after{
  content: "";

  position: absolute;

  width: 22px;
  height: 22px;

  background: inherit;

  border-radius: 50%;
}

.heart::before{
  top: -11px;
  left: 0;
}

.heart::after{
  left: -11px;
  top: 0;
}


/* ================= RANDOM POSITIONS ================= */

.x1{ left: 5%;  animation-duration: 14s; }
.x2{ left: 15%; animation-duration: 18s; }
.x3{ left: 25%; animation-duration: 16s; }
.x4{ left: 35%; animation-duration: 20s; }
.x5{ left: 45%; animation-duration: 22s; }

.x6{ left: 55%; animation-duration: 15s; }
.x7{ left: 65%; animation-duration: 19s; }
.x8{ left: 75%; animation-duration: 17s; }
.x9{ left: 85%; animation-duration: 21s; }
.x10{ left: 95%; animation-duration: 24s; }

.x11{ left: 40%; animation-duration: 26s; }
.x12{ left: 60%; animation-duration: 28s; }


/* Random Delays */
.x1,.x4,.x7,.x10{ animation-delay: 0s; }
.x2,.x5,.x8,.x11{ animation-delay: 2s; }
.x3,.x6,.x9,.x12{ animation-delay: 4s; }


/* ================= FLOAT UP ================= */

@keyframes float-heart{

  0%{
    bottom: -10%;
    opacity: 0;
    transform: translateX(0) rotate(45deg) scale(.5);
  }

  15%{
    opacity: .5;
  }

  40%{
    transform: translateX(25px) rotate(45deg) scale(.9);
  }

  70%{
    transform: translateX(-25px) rotate(45deg) scale(1);
  }

  100%{
    bottom: 115%;
    opacity: 0;
    transform: translateX(40px) rotate(45deg) scale(.4);
  }
}


/* ================= HEART PULSE ================= */

@keyframes pulse-heart{

  0%{
    filter: drop-shadow(0 0 6px rgba(255,120,180,.5));
  }

  50%{
    filter: drop-shadow(0 0 14px rgba(255,120,180,.9));
  }

  100%{
    filter: drop-shadow(0 0 6px rgba(255,120,180,.5));
  }
}

/* ================= GAME FORM STYLING ================= */

/* Message Card */

.message-box{
  width: 100%;
  max-width: 420px;

  background: rgba(255,255,255,0.95);

  padding: 26px 24px;

  border-radius: 22px;

  box-shadow:
    0 15px 40px rgba(255,107,157,.25);

  text-align: center;

  backdrop-filter: blur(6px);

  animation: form-pop 0.8s ease forwards;
}


/* Title */

.message-box h4{
  font-family: "Poppins", sans-serif;

  font-size: 1.2rem;

  color: #ff4d8d;

  margin-bottom: 15px;

  letter-spacing: .5px;
}



/* ================= INPUTS ================= */

.text-input{

  width: 100%;

  padding: 13px 14px;

  margin-bottom: 12px;

  border-radius: 14px;

  border: 2px solid #ffb3c6;

  font-family: "Poppins", sans-serif;

  font-size: .95rem;

  background: #fff;

  outline: none;

  transition: .25s ease;
}


/* Focus Effect */

.text-input:focus{

  border-color: #ff4d8d;

  box-shadow:
    0 0 0 3px rgba(255,80,150,.15),
    0 6px 18px rgba(255,80,150,.25);

  transform: scale(1.02);
}



/* ================= SEND BUTTON ================= */

.message-box .brutalist-button{

  margin-top: 8px;

  width: 100%;

  height: 52px;

  font-size: 1rem;

  background: linear-gradient(
    135deg,
    #ff4d8d,
    #ff85b3
  );

  border-color: #fff;

  letter-spacing: 1px;
}


/* Hover */

.message-box .brutalist-button:hover{

  background: linear-gradient(
    135deg,
    #ff85b3,
    #ff4d8d
  );

  box-shadow:
    0 10px 30px rgba(255,80,150,.5),
    6px 6px 0 #000;
}



/* ================= START SECTION ================= */

.start-divider{

  margin-top: 18px;
  margin-bottom: 8px;

  font-size: .9rem;

  font-family: "Poppins", sans-serif;

  color: #00000;

  opacity: .75;
}



/* START BUTTON */

.start-btn{

  position: sticky;   /* 👈 magic */
  bottom: env(safe-area-inset-bottom, 10px);

  margin: 12px auto 0;

  width: 220px;
  height: 60px;

  font-size: 1.15rem;

  background: linear-gradient(
    135deg,
    #ff2f7d,
    #ff6fae
  );

  border-color: #fff;

  box-shadow:
    0 10px 25px rgba(255,80,150,.45),
    6px 6px 0 #000;

  z-index: 5;
}



/* Glow Pulse */

.start-btn:hover{

  animation: pulse-btn 1.2s infinite;

  transform: translate(-4px,-4px) scale(1.08);
}



/* ================= ANIMATIONS ================= */

@keyframes form-pop{

  from{
    opacity: 0;
    transform: scale(.9) translateY(15px);
  }

  to{
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}


@keyframes pulse-btn{

  0%{
    box-shadow:
      0 0 0 rgba(255,80,150,.5),
      6px 6px 0 #000;
  }

  50%{
    box-shadow:
      0 0 25px rgba(255,80,150,.9),
      6px 6px 0 #000;
  }

  100%{
    box-shadow:
      0 0 0 rgba(255,80,150,.5),
      6px 6px 0 #000;
  }
}

/* ================= INSTRUCTIONS ================= */

.instruction-card{

  background: linear-gradient(
    180deg,
    #ffffff,
    #fff5fa
  );

  padding: 20px 18px 90px; /* 👈 bottom space for button */

  border-radius: 26px;

  width: 92%;
  max-width: 900px;

  max-height: 90vh;

  text-align: center;

  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  box-shadow:
    0 20px 50px rgba(255,107,157,.35);

  animation: form-pop .8s ease;

  display: flex;
  flex-direction: column;
}


.instruction-header{

  display: grid;

  grid-template-columns: 1fr auto 1fr; /* 👈 magic */

  align-items: center;

  margin-bottom: 20px;

  text-align: center;
}

.instruction-header > div{
  grid-column: 2;      /* 👈 FORCE CENTER */
  text-align: center;
}

.instruction-header img{
  grid-column: 3;      /* 👈 Push image right */
  justify-self: end;
}





.instruction-card h2{

  color: #ff2f7d;

  margin-bottom: 12px;
}


.instruction-card ul{

  list-style: none;

  padding: 0;

  margin-bottom: 15px;
}


.instruction-card li{

  margin: 6px 0;

  font-family: "Poppins", sans-serif;

  font-size: .95rem;
}


.control-text{

  margin-bottom: 15px;

  color: #ff6b9d;

  font-size: .9rem;

  opacity: .8;
}



/* ================= COUNTDOWN ================= */

.countdown-box{

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  text-align: center;

  gap: 12px;

  animation: pop-in .6s ease;
}



.countdown-box h1{

  font-size: 5rem;

  color: #ff2f7d;

  font-family: "Poppins", sans-serif;
}


.countdown-box p{

  font-size: 1rem;

  color: #ff6b9d;
}

/* ================= INSTRUCTION UI ================= */

.instruction-section{
  margin-bottom: 18px;
}

.instruction-section h4{
  color: #ff4d8d;
  margin-bottom: 6px;
  font-size: 1rem;
}


/* Images */

.instruction-img{
  width: 100px;
  margin: 4px auto;
  display: block;
}


/* Enemy Grid */

.enemy-grid{

  display: grid;

  grid-template-columns: repeat(4,1fr); /* Desktop */

  gap: 16px;

  margin-top: 14px;
}



.enemy-card{

  background: #fff0f6;

  border-radius: 16px;

  padding: 14px 10px;

  text-align: center;

  box-shadow: 0 6px 16px rgba(255,80,150,.2);

  transition: .25s;
}

.enemy-card:hover{
  transform: translateY(-4px) scale(1.05);
}



.enemy-card img{

  width: 55px;
  height: 55px;

  object-fit: contain;

  margin-bottom: 4px;
}


.enemy-card p{
  font-weight: 600;
  font-size: .9rem;
}


.enemy-card small{
  font-size: .7rem;
  opacity: .8;
}


/* Rule */

.rule-text{

  margin: 8px 0 14px;

  font-size: .85rem;

  color: #ff2f7d;

  font-weight: 600;
}

@media(max-width:700px){

  .enemy-grid{
    grid-template-columns: repeat(2,1fr);
  }

  .instruction-card{
    max-width: 380px;
  }

}

@media (max-width:600px){

  .instruction-header{
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .instruction-header > div{
    text-align: center;
  }

  .instruction-header img{
    justify-self: center;
  }
}

/* ================= GOOD LUCK SPLASH ================= */

.goodluck-img{

  width: 90%;          /* 🔥 Super big */
  max-width: 420px;    /* Desktop limit */

  height: auto;

  border-radius: 0;    /* ❌ Remove curves */

  margin-bottom: 18px;

  box-shadow:
    0 20px 45px rgba(0,0,0,.35);

  animation: pop-in .6s ease;

}


.goodluck-text{

  font-family: "Poppins", sans-serif;

  font-size: 1.3rem;

  color: #ff2f7d;

  margin-bottom: 10px;

  text-shadow:
    0 2px 6px rgba(255,80,150,.3);
}

/* ================= SMOOTH GAME TRANSITION ================= */

.game-fade-overlay{
  position: fixed;
  inset: 0;

  background: linear-gradient(
    135deg,
    #ffe5ec,
    #ffcdb2,
    #e4c1f9
  );

  z-index: 9999;

  pointer-events: none;

  opacity: 0;
}

/* Fade In */
.game-fade-overlay.in{
  animation: fadeIn .6s ease forwards;
}

/* Fade Out */
.game-fade-overlay.out{
  animation: fadeOut .6s ease forwards;
}

@keyframes fadeIn{
  from{ opacity: 0; }
  to{ opacity: 1; }
}

@keyframes fadeOut{
  from{ opacity: 1; }
  to{ opacity: 0; }
}

.game-page,
.game-frame {
  touch-action: none;
  overscroll-behavior: none;
}

/* ================= BACK BUTTON ================= */

.back-btn{
  position: fixed;   /* 🔥 lock to screen */

  top: 16px;
  left: 16px;

  z-index: 9999;

  transform: scale(0.9);
}

/* Mobile tweak */
@media(max-width:600px){
  .back-btn{
    top: 10px;
    left: 10px;
    transform: scale(0.8);
  }
}



/* ================= UIverse BACK BUTTON ================= */

.styled-wrapper {
  position: fixed;
}

.styled-wrapper .button {
  display: block;
  position: relative;
  width: 76px;
  height: 76px;
  margin: 0;
  overflow: hidden;
  outline: none;
  background-color: transparent;
  cursor: pointer;
  border: 0;
}

.styled-wrapper .button:before {
  content: "";
  position: absolute;
  border-radius: 50%;
  inset: 7px;
  border: 3px solid black;
  transition:
    opacity 0.4s cubic-bezier(0.77, 0, 0.175, 1) 80ms,
    transform 0.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) 80ms;
}

.styled-wrapper .button:after {
  content: "";
  position: absolute;
  border-radius: 50%;
  inset: 7px;
  border: 4px solid #599a53;
  transform: scale(1.3);
  transition:
    opacity 0.4s cubic-bezier(0.165, 0.84, 0.44, 1),
    transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  opacity: 0;
}

.styled-wrapper .button:hover:before {
  opacity: 0;
  transform: scale(0.7);
}

.styled-wrapper .button:hover:after {
  opacity: 1;
  transform: scale(1);
}

.styled-wrapper .button-box {
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
}

.styled-wrapper .button-elem {
  display: block;
  width: 30px;
  height: 30px;
  margin: 24px 18px 0 22px;
}

.styled-wrapper .button:hover .button-box {
  transition: 0.4s;
  transform: translateX(-69px);
}

.arrow-icon {
  width: 30px;
  height: 30px;
}

.back-btn:active {
  transform: scale(0.8);
  opacity: 0.8;
}


`;
