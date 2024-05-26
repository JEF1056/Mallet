import { useParams } from "react-router-dom";

export default function ProjectDetailPage() {
  const { id } = useParams();
  return <div>{id}</div>;
}
