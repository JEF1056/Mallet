import { Divider } from "react-daisyui";
import CreateCategoriesComponent from "./CreateCategoriesComponent";
import CreateProjectsComponent from "./CreateProjectsComponent";
import { useState } from "react";
import useWindowDimensions from "../../../helpers/useWindowDimensions";
import NoMobileComponent from "../../NoMobileComponent";
import NavBarComponent from "../../NavBarComponent";

export default function ConfigurationPage() {
  const [ignoreScreenSize, setIgnoreScreenSize] = useState(false);
  const { width } = useWindowDimensions();

  if (width < 950 && !ignoreScreenSize) {
    return (
      <>
        <NavBarComponent />
        <NoMobileComponent ignoreSetter={setIgnoreScreenSize} />
      </>
    );
  }

  return (
    <>
      <NavBarComponent />
      <div className="flex flex-col grow bg-neutral rounded-box p-4 overflow-y-scroll no-scrollbar">
        <CreateProjectsComponent />
        <Divider />
        <CreateCategoriesComponent />
      </div>
    </>
  );
}
