import { Badge, Button, Card, Collapse, Skeleton } from "react-daisyui";
import NavBarComponent from "../../NavBarComponent";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Category } from "../../../__generated__/resolvers-types";
import { truncate } from "../../../helpers/csv";
import { useEffect } from "react";
import Markdown from "react-markdown";

export default function JudgingPage() {
  const judgeId = "90b86504-af73-43bf-97b1-129acf0e6556";

  const getJudgeGql = gql`
    query Judge($ids: [ID!]) {
      judge(ids: $ids) {
        id
        profile {
          name
        }
        assignedProjects {
          name
          locationNumber
        }
        endingTimeAtLocation
        lastProject {
          name
          description
          id
        }
        judgingProject {
          name
          description
          locationNumber
          id
          categories {
            name
          }
        }
      }
    }
  `;

  const subscribeToJudgeGql = gql`
    subscription Judge($ids: [ID!]) {
      judge(ids: $ids) {
        id
        profile {
          name
        }
        assignedProjects {
          name
          locationNumber
        }
        endingTimeAtLocation
        lastProject {
          name
          description
          id
        }
        judgingProject {
          name
          description
          locationNumber
          id
          categories {
            name
          }
        }
      }
    }
  `;

  const getNextProjectForJudgeGql = gql`
    mutation GetNextProjectForJudge(
      $getNextProjectForJudgeId: ID!
      $skippedCurrent: Boolean
    ) {
      getNextProjectForJudge(
        id: $getNextProjectForJudgeId
        skippedCurrent: $skippedCurrent
      ) {
        name
      }
    }
  `;

  const setRatingGql = gql`
    mutation SetRating(
      $judgeId: ID!
      $projectId: ID!
      $categoryId: ID!
      $currentProjectIsBetter: Boolean
    ) {
      setRating(
        judgeId: $judgeId
        projectId: $projectId
        categoryId: $categoryId
        currentProjectIsBetter: $currentProjectIsBetter
      ) {
        id
        category {
          id
          name
        }
        judge {
          id
          profile {
            name
          }
        }
        betterProject {
          id
          name
          description
          url
          categories {
            id
            name
            description
          }
        }
        worseProject {
          id
          name
          description
          url
          categories {
            id
            name
            description
          }
        }
      }
    }
  `;

  const { subscribeToMore, loading, error, data } = useQuery(getJudgeGql, {
    notifyOnNetworkStatusChange: true,
    variables: {
      ids: [judgeId],
    },
  });

  function getShownProject() {
    if (!loading && error) {
      return (
        <>
          <Card.Title className="h2" color="error">
            Couldn't fetch project.
          </Card.Title>
          <p className="text-error">{error.message}</p>
        </>
      );
    }

    if (data.judge[0]?.judgingProject) {
      return (
        <>
          <div className="flex-grow gap-2 flex-wrap">
            <Card.Title className="h2">
              {data.judge[0]?.judgingProject.name}
            </Card.Title>
            <p className="text-bold">
              Location: {data.judge[0]?.judgingProject.locationNumber}
            </p>
            <Collapse className="bg-base-100 my-4" icon="arrow">
              <Collapse.Title>Description</Collapse.Title>
              <Collapse.Content className="overflow-auto max-h-64 md: max-h-128 no-scrollbar">
                <article className="prose-sm lg:prose">
                  <Markdown>
                    {data.judge[0]?.judgingProject.description}
                  </Markdown>
                </article>
              </Collapse.Content>
            </Collapse>
          </div>
          <div className="max-w-256">
            {data.judge[0]?.judgingProject.categories.map(
              (category: Category) => (
                <Badge key={category.name}>
                  {truncate(category.name, 38, "...")}
                </Badge>
              )
            )}
          </div>
        </>
      );
    } else {
      return (
        <>
          <Card.Title className="h2" color="success">
            No projects to judge.
          </Card.Title>
          <p>Check back later.</p>
        </>
      );
    }
  }

  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: subscribeToJudgeGql,
      variables: { ids: [judgeId] },
      updateQuery: (previous, { subscriptionData, variables }) => {
        console.log("variables", variables);
        console.log("subscriptionData", subscriptionData);
        console.log("previous", previous);

        if (!subscriptionData.data) {
          return previous;
        }

        return { judge: [subscriptionData.data.judge] };
      },
    });

    return unsubscribe;
  }, [subscribeToMore]);

  const [getNextProjectForJudge] = useMutation(getNextProjectForJudgeGql);
  const [setRating] = useMutation(setRatingGql);

  return (
    <>
      <NavBarComponent />
      <div className="flex flex-col md:flex-row grow bg-neutral rounded-box p-4 overflow-y-scroll no-scrollbar gap-4">
        <div className="grow-2">
          {loading && !error ? (
            <Skeleton className="h-full roudned-lg" />
          ) : (
            <Card imageFull className="bg-base-100 h-full">
              {/* <Card.Image src="https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/000/626/926/datas/gallery.jpg" /> */}
              <Card.Body className="min-w-0 p-6 lg:p-8">
                {getShownProject()}
              </Card.Body>
            </Card>
          )}
        </div>
        {!data?.judge[0]?.judgingProject && !data?.judge[0]?.lastProject ? (
          <div className="flex flex-col grow gap-4">
            <Button
              onClick={() =>
                getNextProjectForJudge({
                  variables: {
                    getNextProjectForJudgeId: judgeId,
                    skippedCurrent: true,
                  },
                })
              }
              size="lg"
              className="grow h-full"
            >
              Start
            </Button>
          </div>
        ) : (
          <div className="flex flex-col md:min-w-96 min-h-72 md:min-h-fit md:grow gap-2 text-center">
            <p className="items-center pb-2 md:pb-0">
              Which project is better?
            </p>
            {data?.judge[0]?.lastProject ? (
              <>
                <Button
                  onClick={() => {
                    setRating({
                      variables: {
                        judgeId: judgeId,
                        projectId: data?.judge[0]?.judgingProject.id,
                        categoryId: "general",
                        currentProjectIsBetter: true,
                      },
                    });
                    getNextProjectForJudge({
                      variables: {
                        getNextProjectForJudgeId: judgeId,
                        skippedCurrent: false,
                      },
                    });
                  }}
                  size="lg"
                  className="grow-2"
                  color="primary"
                >
                  {data?.judge[0]?.judgingProject?.name || "Current Project"}
                </Button>
                <Button
                  onClick={() => {
                    setRating({
                      variables: {
                        judgeId: judgeId,
                        projectId: data?.judge[0]?.judgingProject.id,
                        categoryId: "general",
                        currentProjectIsBetter: false,
                      },
                    });
                    getNextProjectForJudge({
                      variables: {
                        getNextProjectForJudgeId: judgeId,
                        skippedCurrent: false,
                      },
                    });
                  }}
                  size="lg"
                  className="grow-2"
                  color="accent"
                >
                  {data?.judge[0]?.lastProject?.name || "Previous Project"}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => {
                  setRating({
                    variables: {
                      judgeId: judgeId,
                      projectId: data?.judge[0]?.judgingProject.id,
                      categoryId: "general",
                      currentProjectIsBetter: false,
                    },
                  });
                  getNextProjectForJudge({
                    variables: {
                      getNextProjectForJudgeId: judgeId,
                      skippedCurrent: false,
                    },
                  });
                }}
                size="lg"
                color="primary"
                className="flex grow"
              >
                Continue
              </Button>
            )}
            <Button
              onClick={() =>
                getNextProjectForJudge({
                  variables: {
                    getNextProjectForJudgeId: judgeId,
                    skippedCurrent: true,
                  },
                })
              }
              size="md"
            >
              Skip
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
