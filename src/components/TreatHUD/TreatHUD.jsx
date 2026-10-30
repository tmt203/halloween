import { useEffect, useRef, useState } from "react";
import { useTreats, TOTAL_CANDIES } from "../../Experience/halloween/store";
import styles from "./TreatHUD.module.scss";

const CHEERS = [
  "Sweet! 🍬",
  "Boo-tiful find! 👻",
  "Spook-tacular! 🎃",
  "Fang-tastic! 🦇",
  "Treat secured! 🍭",
  "Nice, no tricks here! ✨",
];

const TreatHUD = () => {
  const count = useTreats((s) => Object.keys(s.collected).length);
  const reset = useTreats((s) => s.reset);
  const [toast, setToast] = useState(null);
  const [bump, setBump] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const prev = useRef(0);

  useEffect(() => {
    if (count > prev.current) {
      setBump(true);
      const bumpTimer = setTimeout(() => setBump(false), 350);
      if (count === TOTAL_CANDIES) {
        setToast(null);
        setShowDone(true);
      } else {
        setToast(CHEERS[(count - 1) % CHEERS.length]);
      }
      const toastTimer = setTimeout(() => setToast(null), 1600);
      prev.current = count;
      return () => {
        clearTimeout(bumpTimer);
        clearTimeout(toastTimer);
      };
    }
    prev.current = count;
  }, [count]);

  // keep pointer events on the HUD from also scrolling the scene
  const stop = (e) => e.stopPropagation();

  return (
    <>
      <div
        className={`${styles.counter} ${bump ? styles.bump : ""} ${
          count === TOTAL_CANDIES ? styles.complete : ""
        }`}
        aria-live="polite"
        title="Find the hidden treats around the notebook!"
      >
        <img src="/halloween/candy_pink.webp" alt="" />
        <span>
          {count} / {TOTAL_CANDIES}
        </span>
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}

      {showDone && (
        <div className={styles.doneWrap} onPointerDown={stop} onMouseDown={stop} onTouchStart={stop}>
          <div className={styles.done} role="dialog" aria-label="All treats found">
            <img className={styles.doneBat} src="/halloween/bat_full.webp" alt="" />
            <h2>Happy Halloween!</h2>
            <p>
              You found all {TOTAL_CANDIES} treats. Mr. Panda says thanks for
              exploring, and reminds you: no tricks, only kindness. 🐼🎃
            </p>
            <div className={styles.buttons}>
              <button onClick={() => setShowDone(false)}>Keep exploring</button>
              <button
                className={styles.secondary}
                onClick={() => {
                  reset();
                  prev.current = 0;
                  setShowDone(false);
                }}
              >
                Hide them again
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TreatHUD;
