interface Post {
  id: number;
  title: string;
  author: string;
  description: string;
  upvotes: number;
  tags: Tag[];
  links: Link[];
  time: string;
  post_link: string;
}

interface Tag {
  id: number;
  name: string;
  postId: number;
}

interface Link {
  id: number;
  url: string;
  postId: number;
}
export const dynamic = 'force-dynamic' // defaults to auto
export async function GET_POST(tags: string[]): Promise<{posts:Post[]}> {
    let url = 'api/r_post';
  
    if (tags.length > 0) {
      // Join the tags array into a comma-separated string
      const tagsQuery = tags.join(',');
      // Append the tags as a query parameter
      url += `?tags=${tagsQuery}`;
    }
  
    // Fetch data from the server
    const res = await fetch(url);
    console.log(res)
    // Return the response data
    return res.json();
  }
  