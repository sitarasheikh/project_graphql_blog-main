import { GraphQLClient, gql } from 'graphql-request';

const graphqlAPI = process.env.NEXT_PUBLIC_GRAPHCMS_ENDPOINT;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function safeRequest(client, query, variables, retries = 3) {
  try {
    return await client.request(query, variables);
  } catch (error) {
    if (retries > 0 && error.response?.status === 429) {
      // Using single quotes and removed console.log
      console.warn('Rate limit hit. Retrying...');
      await delay(1000); // Delay for 1 second
      return safeRequest(client, query, variables, retries - 1);
    }
    throw error; // Throw error if retries exhausted
  }
}

export default async function asynchandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  if (!graphqlAPI || !process.env.GRAPHCMS_TOKEN) {
    return res.status(500).json({ error: 'API configuration is missing.' });
  }

  try {
    const graphQLClient = new GraphQLClient(graphqlAPI, {
      headers: {
        authorization: `Bearer ${process.env.GRAPHCMS_TOKEN}`,
      },
    });

    const query = gql`
      mutation CreateComment($name: String!, $email: String!, $comment: String!, $slug: String!) {
        createComment(data: {name: $name, email: $email, comment: $comment, post: {connect: {slug: $slug}}}) { id }
      }
    `;

    const result = await safeRequest(graphQLClient, query, {
      name: req.body.name,
      email: req.body.email,
      comment: req.body.comment,
      slug: req.body.slug,
    });

    return res.status(200).send(result);
  } catch (error) {
    // Replacing console.log with console.error
    console.error('Error creating comment:', error.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
}
