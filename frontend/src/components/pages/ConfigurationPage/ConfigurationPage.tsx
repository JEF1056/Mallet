import { Divider } from "react-daisyui";
import CreateCategoriesComponent from "./CreateCategoriesComponent";
import CreateProjectsComponent from "./CreateProjectsComponent";

export default function ConfigurationPage() {
  return (
    <div className="flex flex-col grow bg-neutral rounded-box p-4 overflow-y-scroll no-scrollbar">
      <CreateProjectsComponent />
      <Divider />
      <CreateCategoriesComponent />
    </div>
  );
}
