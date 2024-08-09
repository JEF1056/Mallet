import { Stats } from "react-daisyui";
import NavBarComponent from "../../NavBarComponent";
import { gql, useQuery } from "@apollo/client";
import { useEffect } from "react";

export default function HomePage() {
  const getProjectCountGql = gql`
    query GetProjectCount {
      projectCount
    }
  `;

  const subscribeToProjectCountGql = gql`
    subscription GetProjectCount {
      projectCount
    }
  `;

  const getRankedProjectsGql = gql`
    query RankedProjects($categoryId: ID!) {
      rankedProjects(categoryId: $categoryId) {
        score
        project {
          name
        }
      }
    }
  `;

  const { subscribeToMore, loading, error, data } =
    useQuery(getProjectCountGql);

  const { loading: rankedProjectsLoading, data: rankedProjectsData } = useQuery(
    getRankedProjectsGql,
    {
      variables: { categoryId: "general" },
    }
  );

  useEffect(() => {
    subscribeToMore({
      document: subscribeToProjectCountGql,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;

        return {
          projectCount: subscriptionData.data.projectCount,
        };
      },
    });
  }, [subscribeToMore]);

  return (
    <>
      <NavBarComponent />
      <div className="flex flex-col grow bg-neutral rounded-box p-4 overflow-y-scroll no-scrollbar">
        {/*  */}
        <Stats className="shadow">
          <Stats.Stat>
            <Stats.Stat.Item variant="title">Projects</Stats.Stat.Item>
            <Stats.Stat.Item variant="value">
              {data?.projectCount != undefined ? data.projectCount : "-"}
            </Stats.Stat.Item>
          </Stats.Stat>
        </Stats>

        {/*  */}
        <div>
          <h2 className="text-2xl">Ranked Projects</h2>
          <div className="flex flex-col gap-4">
            {rankedProjectsData?.rankedProjects.map((project: any) => (
              <div
                key={project.project.name}
                className="flex flex-row justify-between items-center"
              >
                <p>{project.project.name}</p>
                <p>{project.score}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
