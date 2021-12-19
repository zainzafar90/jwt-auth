import { gql, useQuery } from "@apollo/client";
import React from "react";

function App() {
  const { data, loading } = useQuery(gql`
    {
      hello
    }
  `);

  console.log(data);
  return <div className="App">{loading ? "Loading" : data.hello}</div>;
}

export default App;
