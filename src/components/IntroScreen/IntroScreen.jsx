import { useRef, useState } from "react";
import { useProgress } from "@react-three/drei";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import styles from "./IntroScreen.module.scss";

const IntroScreen = () => {
  const { progress } = useProgress();
  const [shouldRender, setShouldRender] = useState(true);
  const introRef = useRef(null);

  useGSAP(() => {
    if (progress === 100) {
      const tl = gsap.timeline({
        onComplete: () => {
          setShouldRender(false);
        },
      });

      tl.to(introRef.current, {
        opacity: 0,
        duration: 1,
        ease: "power2.out",
        delay: 2.2,
      });
    }
  }, [progress]);

  if (!shouldRender) return null;

  return (
    <>
      <div ref={introRef} className={styles.introScreen}>
        <img className={`${styles.bat} ${styles.batOne}`} src="/halloween/bat_full.webp" alt="" />
        <img className={`${styles.bat} ${styles.batTwo}`} src="/halloween/bat_full.webp" alt="" />
        <img className={`${styles.bat} ${styles.batThree}`} src="/halloween/bat_full.webp" alt="" />

        <div className={styles.introScreenContent}>
          <img className={styles.pumpkin} src="/halloween/pumpkin_classic.webp" alt="" />

          <h1 className={styles.title}>Mr. Panda&apos;s Haunted Notebook</h1>

          <ul className={styles.hints}>
            <li>🐼 scroll/drag up/down to navigate!!</li>
            <li>🔦 move your mouse (or tap) to shine the flashlight</li>
            <li>🍬 find all 13 hidden treats!</li>
          </ul>

          <div className={styles.progressBarContainer}>
            <div
              className={styles.progressBar}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className={styles.links}>
          <a
            href="https://www.youtube.com/watch?v=zyWD2E8AHCg"
            className="tutorial-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Watch tutorial here!!
          </a>
          <a
            href="https://github.com/andrewwoan/mr-pandas-psychologically-safe-portfolio"
            className="credits-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            See full list of credits here!!
          </a>
        </div>
      </div>
    </>
  );
};

export default IntroScreen;
