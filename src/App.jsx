import "./App.scss";
import Experience from "./Experience/Experience";
import IntroScreen from "./components/IntroScreen/IntroScreen";
import TreatHUD from "./components/TreatHUD/TreatHUD";

function App() {
  return (
    <>
      <IntroScreen />
      <Experience />
      <TreatHUD />
    </>
  );
}

export default App;
