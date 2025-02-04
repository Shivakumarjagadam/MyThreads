import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { fetchUser, getActivity } from "@/lib/actions/user.actions";

import Link from "next/link";

import Image from "next/image";


async function Page() {
  const user = await currentUser();

  if (!user) return <h1 className="head-text">no user</h1>;  

  // fetch organization list created by user
  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  // getActivities..
  const activity =await getActivity(userInfo._id);

  
  
  return(

    <section className="mt-10 flex flex-col gap-5">
  {activity.length > 0 ? (
    <>
      {activity.map((activity) => (
        <Link key={activity._id} href={`/thread/${activity.parentId}`}>
          <article className="activity-card">
            <Image
              src={activity.author.image}
              alt="Profile Image"
              width={20}
              height={20}
              className="rounded-full object-cover"
            />

            <p className="!text-small-regular text-light-1">
              <span className="mr-5 text-primary-500">{activity.author.name}</span>{" "}
              replied to your Thread,checkOut!
            </p>
          </article>
        </Link>
      ))}
    </>
  ) : (
    <p className="text-light-1">No activities</p>
  )}
</section>
  );
}
export default Page;  