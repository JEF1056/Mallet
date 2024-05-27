import { gql, useQuery } from "@apollo/client";
import { Badge, Divider, Skeleton } from "react-daisyui";
import { useParams } from "react-router-dom";

const getProjectGql = gql`
  query GetProjects($ids: [ID!]) {
    project(ids: $ids) {
      id
      name
      description
      url
      categories {
        id
        name
        description
      }
      assignedJudges {
        profile {
          name
          profilePictureUrl
        }
        id
      }
      beingJudgedBy {
        profile {
          name
          profilePictureUrl
        }
        id
      }
      locationNumber
      noShow
    }
  }
`;

// const projectSubscription = gql`
//   subscription ProjectSubscription($projectId: ID!) {
//     project(id: $projectId) {
//       id
//       name
//       description
//       url
//       categories {
//         id
//         name
//       }
//       locationNumber
//       noShow
//       beingJudgedBy {
//         id
//         profile {
//           name
//           profilePictureUrl
//         }
//       }
//       assignedJudges {
//         id
//         profile {
//           name
//           profilePictureUrl
//         }
//       }
//     }
//   }
// `;

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { loading, error, data } = useQuery(getProjectGql, {
    variables: { ids: [id] },
  });

  const project = data?.project[0];

  console.log(loading, error, data);

  if (error || (!project && !loading)) {
    return (
      <div className="flex flex-col bg-neutral rounded-box p-8 w-full flex-grow gap-2 items-center justify-center">
        <article className="prose">
          <h1>Project Not Found</h1>
          <p>There was an error loading the project. Is the ID correct?</p>
          <p>{error?.message}</p>
        </article>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-neutral rounded-box p-8 w-full flex-grow gap-2">
      <div className="flex flex-row flex-wrap items-center gap-2">
        {loading ? (
          <Skeleton className="w-96 h-14" />
        ) : (
          <article className="prose prose-sm">
            <h1>{project.name}</h1>
            {project.description && <p>{project.description}</p>}
          </article>
        )}
        <Divider horizontal className="invisible sm:visible" />
        {loading ? (
          <>
            <Skeleton className="w-64 h-6" />
            <Skeleton className="w-32 h-6" />
          </>
        ) : (
          <>
            <Badge color="accent">ID: {project.id}</Badge>
            <Badge color="primary">
              Location: #
              {project.locationNumber
                ? project.locationNumber
                : "No Location Assigned"}
            </Badge>
            {project.noShow && <Badge color="error">No Show 😿</Badge>}
          </>
        )}
      </div>
      <Divider />
      <article className="prose prose-sm">
        <h2>Assigned Judges</h2>
      </article>
    </div>
  );
}
