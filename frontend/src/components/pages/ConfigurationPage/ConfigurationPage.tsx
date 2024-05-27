import { Divider } from "react-daisyui";
import CreateCategoriesComponent from "./CreateCategoriesComponent";
import CreateProjectsComponent from "./CreateProjectsComponent";
import { useState } from "react";
import useWindowDimensions from "../../../helpers/useWindowDimensions";
import NoMobileComponent from "../../NoMobileComponent";

export default function ConfigurationPage() {
  const [ignoreScreenSize, setIgnoreScreenSize] = useState(false);
  const { width } = useWindowDimensions();

  if (width < 950 && !ignoreScreenSize) {
    return <NoMobileComponent ignoreSetter={setIgnoreScreenSize} />;
  }

  return (
    <div className="flex flex-col grow bg-neutral rounded-box p-4 overflow-y-scroll no-scrollbar">
      <CreateProjectsComponent />
      <Divider />
      <CreateCategoriesComponent />
    </div>
  );
}
