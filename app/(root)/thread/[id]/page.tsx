// import ThreadCard from "@/components/cards/ThreadCard";
// import { currentUser } from "@clerk/nextjs/server";
// import { fetchUser } from "@/lib/actions/user.actions";
// import { redirect } from "next/navigation";
// import { fetchThread } from "@/lib/actions/threads.actions";
// import Comment from "@/components/forms/Comment";

// const Page= async({params}:{params:{id:string}}) =>{

//   if(!params.id) return null;

//   const user = await currentUser();
//   if(!user) return null;

//   const userInfo = await fetchUser(user.id);
//   if(!userInfo?.onboarded) redirect("/onboarding");

//   const thread = await fetchThread(params.id);

//   return (
//     <section className="relative">
//       <div>
//       <ThreadCard 
//             key={thread._id}
//             id={thread._id}
//             currentUserId={user.id}
//             parentId={thread.parentId}
//             content ={thread.text}
//             author={thread.author}
//             community ={thread.community}
//             createdAt={thread.createdAt}
//             comments={thread.children}
//             />
//       </div>

//       <div  className="mt-7">
//           <Comment
//           threadId={params.id}
//           currentUserImg= {user.imageUrl}
//           currentUserId ={JSON.stringify(userInfo._id)}
//           />
//       </div>
//     </section>
//   );
// }

// export default Page;




import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import Comment from "@/components/forms/Comment";
import ThreadCard from "@/components/cards/ThreadCard";

import { fetchUser } from "@/lib/actions/user.actions";
import { fetchThread } from "@/lib/actions/threads.actions";
// import { fetchThread } from "@/lib/actions/threads.actions";

export const revalidate = 0;

async function page({ params }: { params: { id?: string } }) {
  if (!params?.id) return null;

  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const thread = await fetchThread(params.id);

  return (
    <section className='relative'>
      <div>
        <ThreadCard
          id={thread._id}
          currentUserId={user.id}
          parentId={thread.parentId}
          content={thread.text}
          author={thread.author}
          community={thread.community}
          createdAt={thread.createdAt}
          comments={thread.children}
        />
      </div>

      <div className='mt-7'>
        <Comment
          threadId={params.id}
          currentUserImg={userInfo.image}
          currentUserId={userInfo._id}
        />
      </div>
          {/* these are the  comments of the post */}
      <div className='mt-10'>
        {thread.children.map((childItem: any) => (
          <ThreadCard
            key={childItem._id}
            id={childItem._id}
            currentUserId={user.id}
            parentId={childItem.parentId}
            content={childItem.text}
            author={childItem.author}
            community={childItem.community}
            createdAt={childItem.createdAt}
            comments={childItem.children}
            isComment
          />
        ))}
      </div>
    </section>
  );
}

export default page;