document.addEventListener("DOMContentLoaded", () => {
  const errorMsg = document.querySelector(".errorMsg");
  const endpoint = "https://learn.01founders.co/api/auth/signin";
  const graphQLEndpoint =
    "https://learn.01founders.co/api/graphql-engine/v1/graphql";

  // GraphQL Queries
  const queries = {
    profile: `user { attrs, campus }`,
    skillGo: `
      user { 
        transactions(
          where: {type: {_eq: "skill_go"}},
          order_by: {amount: asc}
        ) { 
          createdAt, amount, type, path 
        } 
      }
    `,
    xp: `user { xps { amount, path } }`,
    auditRatio: `
      user { 
        audits(
          order_by: {createdAt: asc},
          where: {grade: {_is_null: false}}
        ) { 
          grade, createdAt 
        } 
      }
    `,
    londonDiv01Projects: `
      user { 
        transactions(
          where: {path: {_like: "/london/div-01/%"}},
          order_by: {createdAt: asc}
        ) { 
          createdAt, amount, type, path 
        } 
      }
    `,
  };

  // Form submission handler
  document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData(e.target);
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to sign in");
      }

      const data = await response.json();
      localStorage.setItem("jwt", data.jwt); // Store JWT token in localStorage
      handleSignInSuccess(data);
    } catch (error) {
      displayError(error.message);
    }
  });

  // Function to handle successful sign-in
  const handleSignInSuccess = async (data) => {
    try {
      const profileData = await fetchGraphQLData(queries.profile);
      // Further processing of profileData as needed

      const skillGoData = await fetchGraphQLData(queries.skillGo);
      // Further processing of skillGoData as needed

      // Add more query processing as needed
    } catch (error) {
      displayError("Error fetching GraphQL data");
    }
  };

  // Fetch data from GraphQL endpoint
  const fetchGraphQLData = async (query) => {
    const jwt = localStorage.getItem("jwt"); // Retrieve JWT token from localStorage
    if (!jwt) {
      window.location.href = "login.html"; // Redirect to login page if JWT token is not found
      return;
    }

    const response = await fetch(graphQLEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error("GraphQL request failed");
    }

    const result = await response.json();
    return result.data;
  };

  // Display error messages
  const displayError = (message) => {
    errorMsg.textContent = message;
    errorMsg.style.display = "block";
  };

  // Update D3.js graphs with fetched data
  const updateGraphs = async () => {
    try {
      const xpData = await fetchGraphQLData(queries.xp);
      const xpAmounts = xpData.user.xps.map((xp) => xp.amount);
      const xpPaths = xpData.user.xps.map((xp) => xp.path);

      // Select the statistics div
      const statistics = document.getElementById("statistics");

      // Create and update xpEarnedOverTimeGraph
      const xpEarnedOverTimeGraph = d3
        .select(statistics.querySelector(".statistic svg"))
        .append("path")
        .attr("d", `M 0 0 L ${xpAmounts.join(" L ")}`);

      // Create and update xpEarnedByProjectGraph
      const xpEarnedByProjectGraph = d3
        .select(statistics.querySelector(".statistic svg"))
        .append("path")
        .attr("d", `M 0 0 L ${xpPaths.join(" L ")}`);
    } catch (error) {
      console.error("Error updating graphs:", error);
    }
  };

  // Call updateGraphs to fetch data and update the graphs
  updateGraphs();
});
