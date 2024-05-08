import { useState } from "react";
import { Button } from "react-daisyui";
import { useQuery, gql } from "@apollo/client";

const GET_JUDGES = gql`
  query GetJudge($judgeIds: [ID!]) {
    judge(ids: $judgeIds) {
      id
      profile {
        name
        description
        profilePictureUrl
      }
      endingTimeAtLocation
      atLocation {
        id
      }
    }
  }
`;

function JudgeInfo() {
  const { loading, error, data } = useQuery(GET_JUDGES, {
    variables: { judgeIds: null },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  return (
    <div>
      {data.judge.map((judge: any) => (
        <div key={judge.id}>
          <h2>{judge.profile.name}</h2>
          <p>{judge.profile.description}</p>
          <img src={judge.profile.profilePictureUrl} alt={judge.profile.name} />
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="h-screen flex items-center justify-center">
      <JudgeInfo />
      <Button onClick={() => setCount((count) => count + 1)}>{count}</Button>
    </div>
  );
}
