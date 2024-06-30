  import { Stats } from "react-daisyui";
  import NavBarComponent from "../../NavBarComponent";

  export default function HomePage() {
    return (
      <>
        <NavBarComponent />
        <div className="flex flex-col grow bg-neutral rounded-box p-4 overflow-y-scroll no-scrollbar">
        {/*  */}
        <Stats className="shadow">
          <Stats.Stat>
            <Stats.Stat.Item variant="title">Projects</Stats.Stat.Item>
            <Stats.Stat.Item variant="value">{0}</Stats.Stat.Item>
          </Stats.Stat>
        </Stats>
        </div>
      </>
    );
  }
