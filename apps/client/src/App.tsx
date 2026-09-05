import { useTranslation } from "react-i18next";
import { useUi } from "./state/uiStore";
import MainMenu from "./ui/MainMenu";
import ClassSelect from "./ui/ClassSelect";
import Game from "./game/Game";

export default function App() {
  const screen = useUi((s) => s.screen);
  const lang = useUi((s) => s.lang);
  const { i18n } = useTranslation();
  if (i18n.language !== lang) i18n.changeLanguage(lang);

  return (
    <div className="h-full w-full bg-[#05070f]">
      {screen === "menu" && <MainMenu />}
      {screen === "classSelect" && <ClassSelect />}
      {screen === "game" && <Game />}
    </div>
  );
}
