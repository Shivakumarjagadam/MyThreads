import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { fetchUser, fetchUsers } from "@/lib/actions/user.actions";
import ProfileHeader from "@/components/shared/ProfileHeader";

import { profileTabs } from "@/constants";
import Image from "next/image";
import ThreadsTab from "@/components/shared/ThreadsTab";
import { use } from "react";
import UserCard from "@/components/cards/UserCard";

async function Page() {
  const user = await currentUser();

  if (!user) return <h1 className="head-text">no user</h1>;  

  // fetch organization list created by user
  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  // fetch users...
  const result =await fetchUsers({
    userId:user.id,
    searchString:"",
    pageNumber:1,
    pageSize:25,
  })

  return(

    <section>
      <h1 className="head-text mb-10">Search</h1>
      
      {/* search Bar */}

      <div className="mt-14 flex flex-col gap-9 ">
        {result.users.length===0 ?(
          <p>No users found</p>
        
        ):(
          <>
          {result.users.map((person) =>(
            <UserCard
              key={person.id}
              id={person.id}
              name={person.name}
              username={person.username}
              imageUrl={person.image}
              personType='User'
            />
          ))}
          </>
        )
        }
      </div>
    </section>
  );
}
export default Page;  